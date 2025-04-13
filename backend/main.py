import os
from dotenv import load_dotenv
from langchain_community.graphs import Neo4jGraph
from langchain_community.chains.graph_qa.cypher import GraphCypherQAChain
from langchain_ollama import OllamaLLM

# Load environment variables
load_dotenv()

# Neo4j Aura connection
graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USER"),
    password=os.getenv("NEO4J_PASSWORD")
)

# Ollama connection (e.g. mistral)
llm = OllamaLLM(model="mistral")

# === Drug Card Query Logic ===
def get_drug_info(drug_name: str):
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
        }}) AS generics,
        COLLECT(DISTINCT {{
            name: bse.name,
            severity: bse.severity
        }}) AS brandSideEffects
    LIMIT 1
    """
    results = graph.query(query)
    if not results:
        return None

    result = results[0]
    return {
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
    }

# === Mode 3: Single drug card display ===
if __name__ == "__main__":
    print("\n📦 Drug Graph System: Single Drug Viewer")
    name = input("Enter brand drug name (e.g., Dramamine): ")
    data = get_drug_info(name)
    if data:
        print("\n💊 Brand Drug:")
        print(data["brand"])
        print("\n🧪 Generic Alternatives:")
        for g in data["generics"]:
            print(g)
    else:
        print("⚠️ No data found for that drug.")
