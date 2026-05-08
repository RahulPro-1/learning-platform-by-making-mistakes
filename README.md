# Learning by Making Mistakes

A web app I built as my college major project. The idea is simple — beginners write C, C++, or Python code, the compiler runs, and instead of showing the raw confusing error message, the app explains what went wrong in plain English and tells you exactly how to fix it.

No AI API is used. Everything runs locally.

---

## What it does

- You write code in the editor (Monaco — same editor as VS Code)
- It checks your code in real-time as you type
- When you click Analyze, it shows:
  - The **exact line** where the error is
  - A clear explanation of what went wrong
  - A hint on how to fix it
  - A small before/after fix example
- You can also **run** your code and see the output
- There are **practice questions** with broken code to fix
- Users can **register and login** — progress is saved

The error analysis is fully local. I wrote pattern-matching rules for 50+ common beginner errors in C/C++ and Python. It catches things like:
- Missing semicolons (and shows the correct line, not the next one)
- Missing `#include` when you use `printf` or `scanf`
- Missing opening or closing quotes
- Wrong data types for undeclared variables
- Missing parentheses, braces, etc.

---

## Project structure

```
learning-platform-by-making-mistakes/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── analyzeController.js    # main logic — error analysis, run code
│   │   │   ├── authController.js       # register, login
│   │   │   └── progressController.js   # save and load progress
│   │   ├── routes/
│   │   │   ├── analyzeRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── progressRoutes.js
│   │   │   └── practiceRoutes.js
│   │   ├── services/
│   │   │   └── compilerService.js      # runs gcc / g++ / python
│   │   ├── utils/
│   │   │   ├── errorParser.js          # parses gcc and python output
│   │   │   └── beginnerHints.js        # maps error patterns to hints
│   │   └── data/
│   │       ├── practiceQuestions.js
│   │       ├── samplePrograms.js
│   │       └── users.json
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CodeEditor.tsx
    │   │   ├── OutputPanel.tsx
    │   │   ├── Header.tsx
    │   │   ├── LanguageSelector.tsx
    │   │   ├── DifficultySelector.tsx
    │   │   ├── PracticePanel.tsx
    │   │   ├── SamplePicker.tsx
    │   │   ├── ProgressBar.tsx
    │   │   └── AuthModal.tsx
    │   ├── hooks/
    │   │   ├── useRealtimeCheck.ts
    │   │   └── useAuth.ts
    │   ├── api/
    │   │   ├── analyze.ts
    │   │   ├── auth.ts
    │   │   ├── practice.ts
    │   │   ├── progress.ts
    │   │   └── client.ts
    │   ├── App.tsx
    │   ├── types.ts
    │   └── index.css
    └── package.json
```

---

## How to run it

You need **Node.js**, **GCC** (for C/C++), and **Python 3** installed on your machine.

**Backend** — open a terminal:
```bash
cd backend
npm install
npm satrt
```

Create a `.env` file inside `backend/`:
```
JWT_SECRET=write-any-random-string-here
PORT=5000
```

**Frontend** — open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

Backend runs on port 5000, frontend on port 5173.

---

## API

Three main endpoints:

**POST /api/analyze** — runs the compiler and returns structured error info with hints  
**POST /api/check** — quick compiler check used for real-time detection while typing  
**POST /api/run** — compiles and runs the code, returns stdout/stderr

Request body for all three:
```json
{
  "code": "your code here",
  "language": "c",
  "difficulty": "basic"
}
```

`language` can be `c`, `cpp`, or `python`.  
`difficulty` can be `basic`, `intermediate`, or `advanced`.

For `/run` you can also pass `"stdin"` for programs that need user input.

There are also auth endpoints (`/api/auth/register`, `/api/auth/login`) and progress endpoints (`/api/progress`).

---

## Tech used

Backend: Node.js, Express, JWT, bcryptjs  
Frontend: React, TypeScript, Vite, Monaco Editor, Axios  
No database — users are stored in a JSON file for simplicity

---

## Notes

- GCC must be installed and available in PATH for C/C++ to work. On Windows install MinGW.
- Python must be in PATH for Python to work.
- If you get a CORS error, make sure the backend is running before opening the frontend.
- Run `npm install` and `npm run dev` from inside `backend/` or `frontend/` — not from the root folder.
