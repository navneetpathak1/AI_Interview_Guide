# 🤖 AI-Powered Interview Coach & ATS Resume Generator

## 📌 What is the Project?

The **AI-Powered Interview Coach & ATS Resume Generator** is an end-to-end full-stack web application engineered to help job seekers effectively prepare for technical interviews and maximize their chances of getting hired.

By evaluating a candidate's uploaded resume (or self-description) directly against a target job description, the platform automatically:
1. **Calculates a Match Score & Identifies Skill Gaps**: Computes an alignment score (0–100%) and highlights missing competencies ranked by severity (`low`, `medium`, `high`).
2. **Generates Targeted Technical & Behavioral Questions**: Provides realistic, role-specific questions together with the **underlying interviewer intention** (what recruiters evaluate) and **comprehensive model answers**.
3. **Builds a Day-by-Day Preparation Roadmap**: Formulates a personalized daily study plan with actionable tasks to bridge identified skill gaps prior to the interview.
4. **Produces ATS-Optimized Tailored Resumes**: Synthesizes and reformulates candidate achievements to highlight keywords from the target role, rendering a clean, print-ready PDF resume.

---

## 🛠️ Technology Stack & What Each is Used For

### 🌐 Frontend

| Technology | What It Is Used For |
| :--- | :--- |
| **React 19** | Core UI component library used for building interactive interfaces (collapsible question accordions, file dropzone, roadmaps, and score displays). |
| **Vite** | Modern frontend build tool and development server providing fast compilation and Hot Module Replacement (HMR). |
| **React Router (v7)** | Client-side routing, route navigation, dynamic URL parameters (`/interview/:interviewId`), and authentication route guarding (`<Protected>`). |
| **SCSS (Sass)** | Modular, nested stylesheets and styling variables powering modern layouts, color schemes, and responsive design. |
| **Axios** | Promise-based HTTP client configured with `withCredentials: true` to seamlessly transmit HTTP-only authentication cookies. |
| **React Context API** | Global application state management handling authentication sessions (`AuthProvider`) and interview reports/loading states (`InterviewProvider`). |

---

### ⚙️ Backend

| Technology | What It Is Used For |
| :--- | :--- |
| **Node.js** | Server-side JavaScript runtime executing the backend services. |
| **Express.js (v5)** | REST API framework for routing, middleware pipelines, request parsing, and serving responses. |
| **MongoDB & Mongoose (v9)** | NoSQL database and Object Data Modeling (ODM) library used to store user profiles, token blacklists, and generated interview reports. |
| **JSON Web Token (`jsonwebtoken`)** | Issues cryptographically signed authentication tokens stored inside secure HTTP-Only cookies. |
| **`bcryptjs`** | Secure password hashing algorithm with salt rounds (10) to protect user credentials in the database. |
| **`cookie-parser`** | Middleware to extract and parse cookies from incoming HTTP request headers. |
| **`cors`** | Configures Cross-Origin Resource Sharing rules to permit secure frontend-backend communication. |
| **`multer`** | Middleware configured with in-memory storage (`multer.memoryStorage()`) to handle resume PDF uploads directly into RAM without saving temp files to disk. |
| **`pdf-parse`** | Parses raw binary buffers of uploaded resume files to extract plain text for AI analysis. |
| **Puppeteer** | Headless Chromium browser automation used on the server to convert dynamically generated HTML/CSS resumes into standard A4 PDF files. |

---

### 🧠 Artificial Intelligence & Schema Enforcement

| Technology | What It Is Used For |
| :--- | :--- |
| **Groq Cloud / LangChain (`@langchain/groq`)** | High-performance inference engine running large language models (such as `openai/gpt-oss-120b` or Llama models) for rapid analysis and content synthesis. |
| **Zod** | TypeScript/JavaScript schema definition library used to strictly define the expected structure for interview reports and tailored resumes. |
| **`withStructuredOutput` (LangChain)** | Enforces strict adherence to Zod schemas on the LLM output, preventing malformed JSON responses and ensuring reliable database persistence. |
