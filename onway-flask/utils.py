from sentence_transformers import SentenceTransformer
import faiss
import json
import joblib
import ast 
from langchain_groq import ChatGroq

# Initialize the ChatGroq model
llm_pipeline = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key="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",
    temperature=0,
)

df = joblib.load("./models/product_df.pkl")

sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
faiss_index = faiss.read_index("./models/faiss_index.bin")
# Search function
def search_similar_products(query, page=1, limit=9):
    query_embedding = sbert_model.encode([query], convert_to_numpy=True)
    
    # Get a much larger pool of results - enough to cover multiple pages
    # For example, get 100 or more results to ensure we have enough unique products
    max_results = 100  # Adjust this based on your dataset size
    _, indices = faiss_index.search(query_embedding, max_results)

    results = []
    start_idx = (page - 1) * limit
    end_idx = page * limit
    
    # Make sure we don't exceed the number of results we have
    if start_idx >= len(indices[0]):
        return []
    
    # Slice the indices array to get the correct page of results
    for idx in indices[0][start_idx:end_idx]:
        row = df.iloc[idx]
        images = []
        
        # Convert the string representation of a list into a real list
        if isinstance(row["image"], str) and row["image"].startswith("["):
            try:
                images = ast.literal_eval(row["image"])  # Safely convert string to list
            except:
                images = []

        results.append({
            "uniq_id": row["uniq_id"],
            "product_name": row["product_name"],
            "product_url": row["product_url"],
            "retail_price": row["retail_price"],
            "discounted_price": row["discounted_price"],
            "category": row["clean_category"],
            "image": images  # Ensure images is a proper list
        })

    return results

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

       
        print("Raw LLM Response:", response_json)  # Debugging

        return response_json["script"]
       

    except Exception as e:
        print("Error parsing JSON:", e)
        return "<p>Error formatting description</p>"


def get_fbt_keywords(product_names):
    keywords = []

    for product in product_names:
        prompt = f"""suggest single most relevant but different products that customers frequently buy together for '{product}'. 
    Ensure the recommendations are from different brands, styles, or categories but still complement the original product.
    for example : product_name= Lexel High Quality Braided Metal Head Pure Copper Fast Charging 1.5 Meter Long for All Smartphone like Samsung HTC etc USB Cable (it is a usb cable)
    reccomendation should be related to electronics like laptops
        """
        
        response = llm_pipeline.invoke(prompt)

        # Ensure we extract only the relevant keyword
        keywords.append(response.content.strip())  

    return keywords  # List of single keywords per product
