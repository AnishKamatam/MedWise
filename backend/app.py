from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from langchain_community.graphs import Neo4jGraph

load_dotenv()
app = Flask(__name__)
CORS(app)

graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USER"),
    password=os.getenv("NEO4J_PASSWORD")
)

@app.route("/drug-info")
def drug_info():
    drug_name = request.args.get("name")
    if not drug_name:
        return jsonify({"error": "Missing 'name' query parameter"}), 400

    query = f"""
    MATCH (b:BrandDrug {{name: "{drug_name}"}})
    OPTIONAL MATCH (b)-[:OWNED_BY]->(c:Company)
    OPTIONAL MATCH (b)-[:HAS_GENERIC]->(g:GenericDrug)
    OPTIONAL MATCH (g)-[:AVAILABLE_AT]->(r:Retailer)
    OPTIONAL MATCH (g)-[:HAS_SIDE_EFFECT]->(se:SideEffect)
    OPTIONAL MATCH (b)-[:HAS_SIDE_EFFECT]->(bse:SideEffect)
    WITH b, c, g, r, se, bse
    ORDER BY g.price ASC
    RETURN 
        b.name AS brand,
        b.price AS brandPrice,
        b.quantity AS brandQuantity,
        b.dosage AS brandDosage,
        b.description AS brandDescription,
        b.source AS brandSource,
        c.name AS company,
        COLLECT(DISTINCT {{
            name: g.name,
            price: g.price,
            quantity: g.quantity,
            dosage: g.dosage,
            description: g.description,
            source: g.source,
            retailer: {{
                name: r.name,
                url: r.url
            }}
        }})[0..3] AS generics,
        COLLECT(DISTINCT {{
            name: bse.name,
            severity: bse.severity
        }}) AS brandSideEffects
    LIMIT 1
    """
    results = graph.query(query)
    if not results:
        return jsonify({"error": "Drug not found"}), 404

    result = results[0]
    return jsonify({
        "brand": {
            "name": result["brand"],
            "price": result["brandPrice"],
            "quantity": result["brandQuantity"],
            "dosage": result["brandDosage"],
            "description": result["brandDescription"],
            "source": result["brandSource"],
            "company": result["company"],
            "sideEffects": result["brandSideEffects"]
        },
        "generics": result["generics"]
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)

