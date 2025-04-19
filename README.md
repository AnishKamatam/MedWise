# 💊 MedWise

**MedWise** is an AI-powered tool that helps users find cheaper, clinically equivalent alternatives to brand-name medications. It’s built to bring transparency to prescription pricing and empower people to make smarter health decisions.

Originally inspired by our SF Hacks 2025 project **PillPenny**, MedWise is a more robust and functional version — currently in active development.

---

## 🚀 Features

- 🔍 Search brand-name drugs to discover generic alternatives
- 💊 Compare active ingredients and potential side effects
- 💰 View real-time prices, quantities, and available retailers
- 🏭 See manufacturer information
- 🧠 Backed by a Neo4j knowledge graph and AI-powered reasoning

---

## 🧠 How It Works

MedWise is powered by a **GraphRAG (Graph Retrieval-Augmented Generation)** architecture:

- A **Neo4j Aura knowledge graph** with over **135 nodes** and **144 relationships** mapping:
  - Brand-name drugs → Generic alternatives
  - Generics → Retailers, pricing, quantities
  - Drug → Side effects, active ingredients, manufacturers

- A backend built with **Flask** that queries the graph and formats results

- A frontend built with **React + TypeScript** for an intuitive, modern user experience

- Integration with **LangChain + Hugging Face** for LLM-based reasoning over structured data

> **Note:** Current version only supports direct drug name input — natural language querying is not yet implemented.

---

## 🛠️ Tech Stack

- **Neo4j Aura** (Graph Database)
- **LangChain** (GraphRAG pipeline)
- **Hugging Face Inference API** (LLM)
- **Flask** (Backend)
- **React + TypeScript** (Frontend)
- **Tailwind CSS** (UI styling)

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/medwise.git
cd medwise
