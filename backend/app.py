from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from neo4j import GraphDatabase
import requests
import logging
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Neo4j connection
try:
    driver = GraphDatabase.driver(
        os.getenv("NEO4J_URI", "bolt://localhost:7687"),
        auth=(os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "password")),
        max_connection_lifetime=30
    )
    logger.info("Neo4j connection initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Neo4j connection: {str(e)}")

# Hugging Face API configuration
API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}

@lru_cache(maxsize=100)
def get_drug_info_from_neo4j(drug_name: str):
    try:
        query = f"""
        MATCH (b:BrandDrug {{name: "{drug_name}"}})
        OPTIONAL MATCH (b)-[:OWNED_BY]->(c:Company)
        OPTIONAL MATCH (b)-[:HAS_GENERIC]->(g:GenericDrug)
        OPTIONAL MATCH (g)-[:AVAILABLE_AT]->(r:Retailer)
        WITH b, c, g, r
        ORDER BY g.price ASC
        RETURN 
            b.name AS brand,
            b.price AS brandPrice,
            b.quantity AS brandQuantity,
            b.dosage AS brandDosage,
            b.description AS brandDescription,
            c.name AS company,
            COLLECT(DISTINCT {{
                name: g.name,
                price: g.price,
                quantity: g.quantity,
                dosage: g.dosage,
                description: g.description,
                retailer: {{
                    name: r.name,
                    url: r.url
                }}
            }})[0..3] AS generics
        LIMIT 1
        """
        
        with driver.session() as session:
            results = session.run(query)
            if not results:
                return None

            result = results.single()
            return {
                "brand": {
                    "name": result["brand"],
                    "price": result["brandPrice"],
                    "quantity": result["brandQuantity"],
                    "dosage": result["brandDosage"],
                    "description": result["brandDescription"],
                    "company": result["company"]
                },
                "generics": result["generics"]
            }
    except Exception as e:
        logger.error(f"Error in get_drug_info_from_neo4j: {str(e)}")
        return None

def query_huggingface(payload):
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()
    except Exception as e:
        logger.error(f"Error querying Hugging Face API: {str(e)}")
        return None

@app.route("/")
def health_check():
    return jsonify({"status": "healthy"})

@app.route("/drug-info")
def drug_info():
    drug_name = request.args.get("name")
    if not drug_name:
        return jsonify({"error": "Missing 'name' query parameter"}), 400

    try:
        # Get structured data from Neo4j (cached)
        structured_data = get_drug_info_from_neo4j(drug_name)
        if not structured_data:
            return jsonify({"error": "Drug not found"}), 404

        # Get additional information from Hugging Face
        prompt = f"""<s>[INST] You are a medical expert. Provide a brief summary about the drug {drug_name}, including:
        1. Main uses
        2. Key side effects
        3. Important precautions
        Keep the response concise. [/INST]"""
        
        huggingface_response = query_huggingface({"inputs": prompt})
        
        if huggingface_response and not isinstance(huggingface_response, dict):
            structured_data["ai_insights"] = huggingface_response[0]["generated_text"]
        else:
            structured_data["ai_insights"] = "Unable to fetch additional information at this time."

        return jsonify(structured_data)
    except Exception as e:
        logger.error(f"Error in drug_info endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5002))
    app.run(host="0.0.0.0", port=port)

