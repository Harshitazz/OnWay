from sentence_transformers import SentenceTransformer
import faiss
import json
import joblib
import ast 
from langchain_groq import ChatGroq
import chromadb
from chromadb.config import Settings

llm_pipeline = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key="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",
    temperature=0,
)

sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

from chromadb import PersistentClient

client = PersistentClient(path="./chroma_store")  # path where data will be saved
collection = client.get_or_create_collection("products")


# 🔍 Updated search using Chroma
def search_similar_products(query, page=1, limit=9):
  
    query_embedding = sbert_model.encode([query]).tolist()
    
    # Query Chroma
    max_results = 100  # Get more results for pagination
    results = collection.query(query_embeddings=query_embedding, n_results=max_results)

    hits = []
    start = (page - 1) * limit
    end = start + limit
    
    if not results["documents"][0]:
        print("No results found for query:", query)
        return []

    for idx, (doc, meta, pid) in enumerate(zip(results["documents"][0], results["metadatas"][0], results["ids"][0])):
        if idx < start or idx >= end:
            continue

        images = []
        if "image" in meta and meta["image"]:
            try:
                if isinstance(meta["image"], str) and (meta["image"].startswith("[") or meta["image"].startswith("\"")):
                    # It's likely a JSON string
                    images = json.loads(meta["image"]) if meta["image"].startswith("[") else [meta["image"]]
                elif isinstance(meta["image"], list):
                    images = meta["image"]
                else:
                    images = [str(meta["image"])]
            except Exception as e:
                print(f"Error parsing image data: {e}")
                images = []

        # Create product with safe access to fields
        product = {
            "uniq_id": pid,
            "product_name": meta.get("product_name", "Unknown"),
            "retail_price": meta.get("retail_price", 0),
            "discounted_price": meta.get("discounted_price", 0),
            "category": meta.get("clean_category", "Unknown"),
            "image": images
        }
        
        hits.append(product)

    return hits

def format_description(description):
    prompt = f"""
    Format this product description using proper HTML structure for clear readability.

    {description}

    - **Return a valid JSON object** with this format:
    ```json
    {{"script": "<h2>Product Description</h2><p>Your formatted description here</p>"}}
    ```
    - Use **bold** text for section headings (`<strong>` or `<h2>`).
    - Use `<ul><li>` for bullet points.
    - Ensure all HTML tags are properly closed.
    - Do NOT return anything other than the JSON object.
    """

    response = llm_pipeline.invoke(prompt)

    try:
        text_response = response.content.strip()
        if text_response.startswith("```json"):
            text_response = text_response.strip("```json").strip("```").strip()

        response_json = json.loads(text_response)

    
        return response_json["script"]
       

    except Exception as e:
        print("Error parsing JSON:", e)
        return "<p>Error formatting description</p>"


def get_fbt_keywords(product_names):
    keywords = []

    for product in product_names:
        prompt = f"""
            You are an e-commerce recommendation engine.

            Suggest **1 single product** that customers often buy together with the following product: '{product}'.

            Rules:
            - It must be from a **different category**, but **practically useful** or **frequently bought together**.
            - Focus on **complementary use cases** (e.g., Gloves → Hand Warmers, not Smartwatches).
            - No brand recommendations unless necessary.
            - Response format: just the recommended product name, no explanation.

            Example:
            Input: USB Cable
            Output: Laptop Sleeve

            Input: Winter Gloves
            Output: Hand Warmers

            Now give the output for: {product}
            """

        
        response = llm_pipeline.invoke(prompt)

        keywords.append(response.content.strip())  

    return keywords 
