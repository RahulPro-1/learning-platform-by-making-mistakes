# Beginner Code Learning Assistant

A full-stack web app that helps 1st-year CS students write and understand C, C++, and Python code using AI-powered analysis.

## Project Structure

```
major_project/
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   │   └── analyzeController.js   # AI analysis logic
│   │   ├── routes/
│   │   │   └── analyzeRoutes.js       # API route definitions
│   │   └── index.js                   # Express server entry
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # React + TypeScript + Vite
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── CodeEditor.tsx         # Monaco Editor wrapper
    │   │   ├── LanguageSelector.tsx   # C / C++ / Python switcher
    │   │   └── OutputPanel.tsx        # Shows errors, explanation, hints
    │   ├── App.tsx
    │   ├── types.ts
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    └── package.json
```

## Setup Instructions

### Step 1 — Backend

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):
```
Gemini_API_KEY=sk-ant-your-key-here
PORT=5000
```

Start the backend:
```bash
npm run dev     # development (auto-restarts)
# or
npm start       # production
```

### Step 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## API

### POST /api/analyze

**Request:**
```json
{
  "code": "print('Hello')",
  "language": "python"
}
```

**Response:**
```json
{
  "errors": ["No errors found! Great job!"],
  "explanation": "This code prints the word Hello to the screen.",
  "hints": [
    "Try adding more print statements to explore output.",
    "You can print variables too, like: name = 'Alice'; print(name)"
  ]
}
```

**Supported languages:** `python`, `c`, `cpp`

## Getting an Gemini API Key

1.Go to Google AI Studio Visit: https://aistudio.google.com/
2.Sign in Login using your Google account
3.Open API Keys Section Click on your profile icon (top right) Select "Get API key" or go to API Keys section
4.Create a New API Key Click on "Create API Key" Copy the generated key
