from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import ast  # Convert stringified list to actual list
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from cart import * 
from order import *
from utils import *
from db import *
import joblib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Setup ChromaDB Client
client = chromadb.PersistentClient(path="./chroma_store")
collection = client.get_or_create_collection("products")

# Load the SBERT model for embedding queries
sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

# Register Blueprints
app.register_blueprint(cart_blueprint, url_prefix="/cart")
app.register_blueprint(order_blueprint, url_prefix="/")

groq_api_key = os.getenv("GROQ_API_KEY")

@app.route("/")
def home():
    return jsonify({"message": "Flask ML API is running!"})


@app.route("/random-products", methods=["GET"])
def get_random_products():
    limit = int(request.args.get("limit", 9))
    
    # Get all IDs from the collection
    all_ids = collection.get()['ids']
    
    # Randomly sample IDs (truly random selection)
    if len(all_ids) <= limit:
        # If we have fewer products than requested, return all
        random_ids = all_ids
    else:
        # Select random IDs without replacement
        random_ids = random.sample(all_ids, limit)
    
    # Fetch the selected random products
    results = collection.get(ids=random_ids)
    
    products = []
    for doc, metadata, pid in zip(results["documents"], results["metadatas"], results["ids"]):
        product = {
            "uniq_id": pid,
            "product_name": metadata.get("product_name", "Unknown"),
            "category": metadata.get("clean_category", "Unknown"),
            "description": doc
        }
        
        # Handle price fields
        for price_field in ["retail_price", "discounted_price"]:
            if price_field in metadata:
                try:
                    # Try to convert to float
                    product[price_field] = float(metadata[price_field])
                except (ValueError, TypeError):
                    # Default to 0 if conversion fails
                    product[price_field] = 0
            else:
                product[price_field] = 0
        
        # Safely parse the image field
        image_data = metadata.get("image")
        if image_data:
            try:
                if isinstance(image_data, str):
                    if image_data.startswith("["):
                        product["image"] = json.loads(image_data)
                    else:
                        product["image"] = [image_data]
                elif isinstance(image_data, list):
                    product["image"] = image_data
                else:
                    product["image"] = [str(image_data)]
            except Exception as e:
                print(f"Error parsing image data: {e}")
                product["image"] = []
        else:
            product["image"] = []
        
        products.append(product)
    
    return jsonify({
        "products": products, 
        "count": len(products),
        "random": True  # Flag to indicate these are random products
    })

@app.route("/product/<string:uniq_id>", methods=["GET"])
def get_product(uniq_id):
    # ChromaDB doesn't support direct lookup by ID in the query method
    # We need to use the get method instead or filter results manually
    
    # Method 1: Using get() if available in your ChromaDB version
    # Get the item by ID if the method is available
    result = collection.get(
        ids=[uniq_id],
        include=["metadatas", "documents"]
    )
    
    if not result or not result["ids"]:
        return jsonify({"error": "Product not found"}), 404
        
    # Get the first (and only) result
    metadata = result["metadatas"][0]
    document = result["documents"][0]
    
   
    # Format description if needed
    formatted_description = format_description(document) if 'format_description' in globals() else document
    
    # Parse image URLs safely
    images = []
    if "image" in metadata:
        try:
            if isinstance(metadata["image"], str):
                if metadata["image"].startswith("["):
                    images = json.loads(metadata["image"])
                else:
                    images = [metadata["image"]]
            elif isinstance(metadata["image"], list):
                images = metadata["image"]
        except Exception as e:
            print(f"Error parsing image data: {e}")
    
    # Format prices
    retail_price = metadata.get("retail_price", "N/A")
    discounted_price = metadata.get("discounted_price", "N/A")
    
    # Return the product details
    return jsonify({
        "product_name": metadata.get("product_name", "Unknown"),
        "category": metadata.get("clean_category", "Unknown"),
        "brand": metadata.get("brand", "N/A"),
        "retail_price": retail_price,
        "discounted_price": discounted_price,
        "description": formatted_description,
        "image": images,
        "uniq_id": uniq_id,
    })

@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("query")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 9))
    
    if not query:
        return jsonify({"error": "Query parameter 'query' is required"}), 400
    
    # Encode query into embedding using the same model
    query_embedding = sbert_model.encode([query], convert_to_numpy=True)
    
    # Get more results for pagination
    max_results = 100  # Fetch more results than needed for pagination
    
    # Query ChromaDB for similar products
    results = collection.query(
        query_embeddings=query_embedding.tolist(),
        n_results=max_results
    )
    
    # Calculate pagination indices
    start = (page - 1) * limit
    end = start + limit
    
    products = []
    total_results = len(results["ids"][0]) if results["ids"] and results["ids"][0] else 0
    total_pages = (total_results + limit - 1) // limit if total_results > 0 else 0
    
    # If we have results and the requested page is valid
    if results["ids"] and results["ids"][0] and page <= total_pages:
        # Process only the items for the current page
        for i in range(len(results["ids"][0])):
            # Skip items outside the current page
            if i < start or i >= end:
                continue
                
            product_id = results["ids"][0][i]
            description = results["documents"][0][i]
            
            # Get metadata with safe handling
            metadata = {}
            if i < len(results["metadatas"][0]):
                metadata = results["metadatas"][0][i]
                # Ensure metadata is a dictionary
                if not isinstance(metadata, dict):
                    metadata = {}
            
            # Create product with uniform field access
            product = {
                "uniq_id": product_id,
                "product_name": metadata.get("product_name", "Unknown"),
                "category": metadata.get("clean_category", "Unknown"),
                "description": description
            }
            
            # Handle price fields
            for price_field in ["retail_price", "discounted_price"]:
                try:
                    product[price_field] = float(metadata.get(price_field, 0))
                except (ValueError, TypeError):
                    product[price_field] = 0
            
            # Parse image field using the improved approach
            images = []
            if "image" in metadata and metadata["image"]:
                try:
                    if isinstance(metadata["image"], str) and (metadata["image"].startswith("[") or metadata["image"].startswith("\"")):
                        # It's likely a JSON string
                        images = json.loads(metadata["image"]) if metadata["image"].startswith("[") else [metadata["image"]]
                    elif isinstance(metadata["image"], list):
                        images = metadata["image"]
                    else:
                        images = [str(metadata["image"])]
                except Exception as e:
                    print(f"Error parsing image data: {e}")
                    images = []
            
            product["image"] = images
            products.append(product)
    
    # Return products with pagination info
    return jsonify({
        "products": products, 
        "page": page,
        "total_pages": total_pages,
        "total_results": total_results,
        "limit": limit
    })

@app.route("/suggest_categories", methods=["GET"])
def suggest_categories():
    query = request.args.get("query", "").strip()

    if not query:
        return jsonify({"suggestions": []}) 

    prompt = f"""
        Given the incomplete input '{query}', suggest the most 5 relevant products item names that might match this prefix. Provide a comma-separated list.

        - **Return only a valid list ["...",".."]** 
        example: if query is "mu", the suggested words can be ["mugs", etc]
        """

    response = llm_pipeline.invoke(prompt)

    return jsonify({"suggestions": response.content})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
