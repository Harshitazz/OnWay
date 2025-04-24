import json
import pandas as pd
import ast
from sentence_transformers import SentenceTransformer
from chromadb.config import Settings
from chromadb import PersistentClient

DATA_PATH = "./database/products.csv"

# Load dataset
print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

# Handle NaN values for object columns
for col in df.select_dtypes(include=["object"]).columns:
    df[col] = df[col].fillna("")

# Handle NaN values for numeric columns
for col in df.select_dtypes(include=["number"]).columns:
    df[col] = df[col].fillna(0)

# Filter out products with 'bra' in the name
df = df[~df['product_name'].str.contains('bra', case=False)]

# Extract categories
def extract_first_level_category(category_str):
    try:
        categories = ast.literal_eval(category_str)
        return categories[0].split(">>")[0].strip()
    except:
        return "Unknown"

def extract_clean_categories(category_str):
    try:
        categories = ast.literal_eval(category_str)
        return " ".join(cat.strip() for cat in categories[0].split(">>"))
    except:
        return "Unknown"

df["first_level_category"] = df["product_category_tree"].apply(extract_first_level_category)
df["clean_category"] = df["product_category_tree"].apply(extract_clean_categories)
df["text"] = df["product_name"] + " " + df["clean_category"]

# Load SBERT model
print("Loading SBERT model...")
sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

# Setup ChromaDB
print("Setting up ChromaDB...")
chroma_client = PersistentClient(path="./chroma_store")

# First, delete the existing collection if it exists
try:
    chroma_client.delete_collection("products")
    print("Deleted existing 'products' collection")
except:
    pass

# Create a new collection
collection = chroma_client.create_collection("products")
print("Created new 'products' collection")

# Add in batches
print(f"Processing {len(df)} products in batches...")
BATCH_SIZE = 128
total_batches = (len(df) + BATCH_SIZE - 1) // BATCH_SIZE

for i in range(0, len(df), BATCH_SIZE):
    batch_num = i // BATCH_SIZE + 1
    print(f"Processing batch {batch_num}/{total_batches}")
    
    batch = df.iloc[i:i+BATCH_SIZE].copy()
    texts = batch["text"].tolist()
    
    # Generate embeddings
    embeddings = sbert_model.encode(texts, convert_to_numpy=True)
    
    # Create a clean metadata DataFrame
    # Include all required fields here
    metadata_fields = ["product_name", "clean_category", "image"]
    
    # Add price fields if they exist, with proper conversion
    for price_field in ["retail_price", "discounted_price"]:
        if price_field in batch.columns:
            batch[f"{price_field}_float"] = pd.to_numeric(batch[price_field], errors="coerce").fillna(0)
            metadata_fields.append(f"{price_field}_float")
    
    batch_metadata = batch[metadata_fields].copy()
    
    # Rename the price fields back to their original names
    if "retail_price_float" in batch_metadata.columns:
        batch_metadata = batch_metadata.rename(columns={"retail_price_float": "retail_price"})
    if "discounted_price_float" in batch_metadata.columns:
        batch_metadata = batch_metadata.rename(columns={"discounted_price_float": "discounted_price"})
    
    # batch_metadata.loc[:, "image"] = batch_metadata["image"].apply(json.dumps)

    # Print a sample metadata entry to verify
    if batch_num == 1:
        print("Sample metadata entry:")
        print(batch_metadata.iloc[0].to_dict())
    
    # Convert to dict records for ChromaDB
    metadatas = batch_metadata.to_dict("records")
    
    # Add to collection
    collection.add(
        documents=texts,
        embeddings=embeddings.tolist(),
        ids=[str(x) for x in batch["uniq_id"]],
        metadatas=metadatas
    )
    
    print(f"Added {len(texts)} products to collection")

print(f"✅ ChromaDB collection saved with {collection.count()} products.")

# Print collection info
print("\nCollection info:")
print(f"Total documents: {collection.count()}")
if collection.count() > 0:
    sample = collection.get(limit=1)
    print("Sample metadata keys:", sample["metadatas"][0].keys())