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
        logger.info(f"Attempting to fetch drug info for: {drug_name}")
        query = f"""
        MATCH (b:BrandDrug {{name: "{drug_name}"}})
        OPTIONAL MATCH (b)-[:MANUFACTURED_BY]->(m:Manufacturer)
        OPTIONAL MATCH (b)-[:HAS_PRICE]->(p:Price)
        OPTIONAL MATCH (b)-[:TREATS]->(c:Condition)
        OPTIONAL MATCH (b)-[:HAS_GENERIC_ALTERNATIVE]->(g:GenericDrug)
        OPTIONAL MATCH (g)-[:MANUFACTURED_BY]->(gm:Manufacturer)
        OPTIONAL MATCH (g)-[:HAS_PRICE]->(gp:Price)
        WITH b, m, p, COLLECT(DISTINCT c.name) as conditions,
             COLLECT(DISTINCT {{
                name: g.name,
                price: gp.amount,
                quantity: gp.quantity,
                manufacturer: gm.name,
                description: g.description
             }}) as generics
        RETURN 
            b.name AS brand,
            p.amount AS brandPrice,
            p.quantity AS brandQuantity,
            m.name AS manufacturer,
            conditions as conditions,
            generics as generics
        LIMIT 1
        """
        
        logger.info(f"Executing Neo4j query: {query}")
        
        with driver.session() as session:
            results = session.run(query)
            result = results.single()
            
            if result is None:
                logger.warning(f"No results found for drug: {drug_name}")
                return None
                
            logger.info("Raw Neo4j result:")
            logger.info(f"Brand Name: {result.get('brand')}")
            logger.info(f"Price: {result.get('brandPrice')}")
            logger.info(f"Quantity: {result.get('brandQuantity')}")
            logger.info(f"Manufacturer: {result.get('manufacturer')}")
            logger.info(f"Conditions: {result.get('conditions')}")
            
            response_data = {
                "brand": {
                    "name": result.get("brand"),
                    "price": result.get("brandPrice"),
                    "quantity": result.get("brandQuantity"),
                    "company": result.get("manufacturer"),
                    "conditions": result.get("conditions", [])
                },
                "generics": result.get("generics", [])
            }
            
            logger.info("Formatted response data:")
            logger.info(response_data)
            
            return response_data
    except Exception as e:
        logger.error(f"Error in get_drug_info_from_neo4j: {str(e)}")
        logger.error(f"Full error details: {type(e).__name__}: {str(e)}")
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

@app.route("/test-neo4j")
def test_neo4j():
    try:
        with driver.session() as session:
            # Test basic connectivity and get sample of complete drug data
            query = """
            MATCH (b:BrandDrug)
            OPTIONAL MATCH (b)-[:OWNED_BY]->(c:Company)
            RETURN b, c
            LIMIT 5
            """
            
            result = session.run(query)
            sample_drugs = []
            
            for record in result:
                brand_node = record.get("b")
                company_node = record.get("c")
                
                if brand_node:
                    drug_info = {
                        "name": brand_node.get("name"),
                        "price": brand_node.get("price"),
                        "quantity": brand_node.get("quantity"),
                        "dosage": brand_node.get("dosage"),
                        "description": brand_node.get("description"),
                        "company": company_node.get("name") if company_node else None
                    }
                    sample_drugs.append(drug_info)
            
            return jsonify({
                "status": "connected",
                "total_brand_drugs": len(sample_drugs),
                "sample_drugs": sample_drugs,
                "sample_drug_details": "These are complete drug records to verify data structure"
            })
    except Exception as e:
        logger.error(f"Neo4j test failed: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5002))
    app.run(host="0.0.0.0", port=port)
