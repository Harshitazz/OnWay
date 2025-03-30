from flask import Blueprint, request, jsonify
from db import db
import time
import os
import json
from bson import ObjectId
import random
import string
import datetime
import requests

order_blueprint = Blueprint("order", __name__)

orders_collection = db["orders"]
carts_collection = db["carts"]

# PayPal API configuration
PAYPAL_API_URL = "https://api-m.sandbox.paypal.com"  # Use "https://api-m.paypal.com" for production
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")

# Function to get PayPal access token
def get_paypal_access_token():
    url = f"{PAYPAL_API_URL}/v1/oauth2/token"
    headers = {
        "Accept": "application/json",
        "Accept-Language": "en_US"
    }
    data = "grant_type=client_credentials"
    response = requests.post(
        url,
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
        headers=headers,
        data=data
    )
    response_json = response.json()
    return response_json["access_token"]

# Generate a unique order ID for display
def generate_order_id():
    timestamp = datetime.datetime.now().strftime("%Y%m%d")
    random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_chars}"

# Create Order API
@order_blueprint.route('/create-order', methods=['POST'])
def create_order():
    data = request.json
    user_id = data["user_id"]
    shipping_address = data["shipping_address"]
    cart_items = data["cart_items"]
    total_amount = data["total_amount"]
    payment_method = data.get("payment_method", "PAYPAL")
    currency = data.get("currency", "INR")
    
    # Generate a unique order ID for display to the customer
    display_order_id = generate_order_id()
    
    # Create order in MongoDB
    order = {
        "paypal_order_id": None,  # Will be updated after PayPal order creation
        "display_order_id": display_order_id,
        "user_id": user_id,
        "items": cart_items,
        "total_amount": total_amount,
        "currency": currency,
        "shipping_address": shipping_address,
        "payment_method": payment_method,
        "payment_status": "PENDING",
        "order_status": "Processing",
        "created_at": int(time.time() * 1000)
    }
    
    if payment_method == "COD":
        # For Cash on Delivery, we don't need PayPal approval
        order["payment_status"] = "COD"
        order_id = orders_collection.insert_one(order).inserted_id
        
        # Clear the user's cart
        carts_collection.update_one(
            {"user_id": user_id},
            {"$set": {"items": [], "total_price": 0}}
        )
        
        return jsonify({
            "order_id": str(order_id),
            "display_order_id": display_order_id
        })
    
    # For PayPal payment, first insert the order in MongoDB
    order_id = orders_collection.insert_one(order).inserted_id
    
    # If currency is INR, convert to USD for PayPal (approximate conversion)
    paypal_amount = total_amount
    paypal_currency = currency
    
    if currency == "INR":
        # Approximate conversion rate (adjust as needed)
        paypal_amount = round(total_amount / 83, 2)
        paypal_currency = "USD"
    
    try:
        # Get PayPal access token
        access_token = get_paypal_access_token()
        
        # Create PayPal order using Orders API v2
        url = f"{PAYPAL_API_URL}/v2/checkout/orders"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": str(order_id),
                    "description": f"Payment for order {display_order_id}",
                    "amount": {
                        "currency_code": paypal_currency,
                        "value": str(paypal_amount)
                    }
                }
            ],
            "application_context": {
                "return_url": f"http://localhost:3000/payment-success?order_id={str(order_id)}",
                "cancel_url": f"http://localhost:3000/payment-failure?order_id={str(order_id)}"
            }
        }
        
        response = requests.post(url, headers=headers, json=payload)
        response_data = response.json()
        
        if response.status_code == 201:  # 201 Created
            # Get PayPal order ID
            paypal_order_id = response_data["id"]
            
            # Update our order with PayPal order ID
            orders_collection.update_one(
                {"_id": order_id},
                {"$set": {"paypal_order_id": paypal_order_id}}
            )
            
            # Get approval URL
            approval_url = next((link["href"] for link in response_data["links"] if link["rel"] == "approve"), None)
            
            return jsonify({
                "approval_url": approval_url,
                "order_id": str(order_id),
                "display_order_id": display_order_id,
                "paypal_order_id": paypal_order_id
            })
        else:
            # Delete the order if PayPal order creation fails
            orders_collection.delete_one({"_id": order_id})
            return jsonify({"error": "Payment creation failed", "details": response_data}), 500
            
    except Exception as e:
        # Delete the order if payment creation fails
        orders_collection.delete_one({"_id": order_id})
        return jsonify({"error": "Payment creation failed", "details": str(e)}), 500

# Capture Payment API
@order_blueprint.route('/capture-payment', methods=['POST'])
def capture_payment():
    data = request.json
    order_id = data["order_id"]
    paypal_order_id = data.get("paypal_order_id")
    
    try:
        # If paypal_order_id was not provided, get it from our database
       if not order_id:
    # Find the order using the PayPal order ID
        order = orders_collection.find_one({"paypal_order_id": paypal_order_id})
        
        if not order:
            return jsonify({"error": "Order not found using PayPal order ID"}), 404
        
        order_id = str(order["_id"])
        # Get PayPal access token
        access_token = get_paypal_access_token()
        
        # Capture the payment
        url = f"{PAYPAL_API_URL}/v2/checkout/orders/{paypal_order_id}/capture"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        
        response = requests.post(url, headers=headers)
        response_data = response.json()
        
        if response.status_code in [200, 201]:
            # Update MongoDB order status
            order = orders_collection.find_one({"_id": ObjectId(order_id)})
            
            if order:
                display_order_id = order.get("display_order_id")
                
                # Update order status
                orders_collection.update_one(
                    {"_id": ObjectId(order_id)},
                    {"$set": {
                        "payment_status": "COMPLETED",
                        "payment_details": response_data
                    }}
                )
                
                # Clear the user's cart
                carts_collection.update_one(
                    {"user_id": order["user_id"]},
                    {"$set": {"items": [], "total_price": 0}}
                )
                
                return jsonify({
                    "message": "Payment successful!",
                    "display_order_id": display_order_id
                })
            else:
                return jsonify({"error": "Order not found"}), 404
        else:
            return jsonify({"error": "Payment capture failed", "details": response_data}), 400
            
    except Exception as e:
        return jsonify({"error": "Payment capture failed", "details": str(e)}), 500

# Other API routes remain the same...
# Fetch User Orders API
@order_blueprint.route('/get-orders/<user_id>', methods=['GET'])
def get_orders(user_id):
    orders = list(orders_collection.find({"user_id": user_id}))
    
    # Convert ObjectId to string for JSON serialization
    for order in orders:
        order["_id"] = str(order["_id"])
    
    return jsonify({"orders": orders})

# Cancel Order API
@order_blueprint.route('/cancel-order/<order_id>', methods=['POST'])
def cancel_order(order_id):
    try:
        # Update order status to cancelled
        result = orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"order_status": "Cancelled"}}
        )
        
        if result.modified_count > 0:
            return jsonify({"message": "Order cancelled successfully"})
        else:
            return jsonify({"error": "Order not found or already cancelled"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500