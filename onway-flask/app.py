from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
from pymongo import MongoClient
import os
from sklearn.metrics.pairwise import cosine_similarity
import ast  # Convert stringified list to actual list
from cart import * 
from order import *
from utils import *
import db
import joblib


app = Flask(__name__)
CORS(app,resources={r"/*": {"origins": "*"}})



# Load dataset
DATA_PATH = "./database/products.csv"
if not os.path.exists(DATA_PATH):
    print("Error: Run train.py first to download and process the dataset!")
    exit()

app.register_blueprint(cart_blueprint, url_prefix="/cart")
app.register_blueprint(order_blueprint, url_prefix="/")

# Load models

df = joblib.load("./models/product_df.pkl")
groq_api_key = os.getenv("GROQ_API_KEY")



@app.route("/")
def home():
    return jsonify({"message": "Flask ML API is running!"})

@app.route("/random-products", methods=["GET"])
def get_random_products():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 9))
    offset = (page - 1) * limit

    random_products = df.sample(n=limit).to_dict(orient="records")
    for product in random_products:
        if isinstance(product["image"], str):
            try:
                product["image"] = ast.literal_eval(product["image"])
            except:
                product["image"] = []

    return jsonify({"products": random_products, "page": page})


@app.route("/product/<string:uniq_id>", methods=["GET"])
def get_product(uniq_id):
    product = df[df["uniq_id"] == uniq_id].to_dict(orient="records")

    if not product:
        return jsonify({"error": "Product not found"}), 400

    
    product = product[0]  # Convert list to dictionary

    # Format description using LLM
    formatted_description = format_description(product["description"])

    # Parse image URLs safely
    images = ast.literal_eval(product["image"]) if isinstance(product["image"], str) else []

    return {
        "product_name": product.get("product_name", "Unknown"),
        "category":product.get("clean_category","Unknown"),
        "brand": product.get("brand", "N/A"),
        "retail_price": product.get("retail_price", "N/A"),
        "discounted_price": product.get("discounted_price", "N/A"),
        "description": formatted_description,
        "image": images,
                "uniq_id": product.get("uniq_id", "N/A"),

    }

@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("query")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 9))

    if not query:
        return jsonify({"error": "Query parameter 'query' is required"}), 400

    results = search_similar_products(query, page, limit)

    return jsonify({"products": results, "page": page})


@app.route("/suggest_categories", methods=["GET"])
def suggest_categories():
    query = request.args.get("query", "").strip()

    if not query:
        return jsonify({"suggestions": []})  # Return empty if no input

    # Prompt LLM to complete partial words
    prompt = f"""
        Given the incomplete input '{query}', suggest the most 5 relevant products item names that might match this prefix. Provide a comma-separated list.

        - **Return only a valid list ["...",".."]** 
        example: if query is "mu", the suggested words can be ["mugs",etc]
        """

    response = llm_pipeline.invoke(prompt)

    
    return ({"suggestions": response.content})



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
