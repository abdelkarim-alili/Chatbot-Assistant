# 🤖 Chatbot Assistant

A conversational AI assistant powered by **[Ollama](https://ollama.com/)** and **Mistral:latest**, with:
- **Python Flask** backend for handling AI responses
- **React + TypeScript + Tailwind CSS** frontend for a modern, responsive UI

This project lets you run an AI chatbot **locally** — no API keys, no external servers, all on your machine.

---

## ✨ Features
- 🗨 Real-time streaming AI responses
- ⚡ Runs locally with Ollama models (no cloud dependency)
- 🎨 Clean, responsive frontend built with React + Tailwind
- 🔌 Simple Flask API integration

---

## 📋 Prerequisites

Make sure you have the following installed:

- [Python 3.13+](https://www.python.org/downloads/)
- [Node.js 22.18+](https://nodejs.org/en/download/)
- [Ollama](https://ollama.com/download)

---

## 📥 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/abdelkarim-alili/Chatbot-Assistant.git
cd Chatbot-Assistant

cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

## Frontend Setup (React)
```
cd frontend
npm install
npm run dev
```

## 🤖 Setting up Ollama
Install Ollama

Download from **[Ollama](https://ollama.com/)**'s official website and follow the installation instructions.

Pull a model

This project uses Mistral:latest by default:
```
ollama pull mistral:latest
```
You can also pull and run any model supported by **[Ollama](https://ollama.com/search)**

Then update the model name in backend/app.py.
```
"model": "Your Model Here",  # Use the download model
```
## Start the Backend
```
cd backend
python app.py
```

## 📂 Project Structure
```
Chatbot-Assistant/
├── backend/          # Flask backend (Ollama API calls)
│   ├── app.py
│   ├── requirements.txt
│   └── ...
├── frontend/         # React frontend
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```
