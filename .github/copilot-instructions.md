# Copilot Instructions for HealthGraph (PetWell-Project)

## Project Overview
- **HealthGraph** visualizes health metrics from PDF lab reports using AI extraction and interactive charts.
- **Architecture:**
  - `backend/`: FastAPI Python server for PDF parsing, AI data extraction, and API endpoints.
  - `frontend/`: Static HTML/CSS/JS for data upload, visualization, and export.
  - `mobile/`: React Native app for mobile data upload and visualization.

## Key Workflows
- **Local Development:**
  - Install Python dependencies: `pip install -r backend/requirements.txt`
  - Set up `.env` in `backend/` with `GOOGLE_API_KEY`.
  - Start backend: `uvicorn backend.main:app --reload --port 8000`
  - Open `frontend/index.html` in browser for web UI.
- **Docker:**
  - Build and run: `docker-compose up --build`
  - Access at `http://localhost:8000`
- **Mobile:**
  - Install Node.js and required packages: `npx expo install expo-document-picker`, `npm install react-native-plotly react-native-paper`
  - Use Expo Go for running the app.

## Patterns & Conventions
- **Backend:**
  - API routes in `backend/routers/`
  - Data models in `backend/models.py`, schemas in `backend/schemas.py`
  - AI extraction logic in `backend/llm_parser.py`
  - Config/environment in `backend/config.py`
- **Frontend:**
  - Pure JS/HTML/CSS, no framework
  - Data upload triggers API call to backend
- **Mobile:**
  - React Native, context in `mobile/src/AuthContext.js`
  - Screens in `mobile/src/screens/`
  - API calls via `mobile/src/api.js`

## Integration Points
- **PDF Upload:**
  - Frontend/mobile upload PDF → backend `/upload` endpoint
- **AI Extraction:**
  - Backend uses LLM (API key required) for parsing
- **Visualization:**
  - Frontend: Plotly charts
  - Mobile: `react-native-plotly`

## Examples
- To add a new API route, create a file in `backend/routers/` and import in `main.py`.
- To extend data extraction, update `llm_parser.py`.
- For new mobile screens, add to `mobile/src/screens/` and update navigation.

## Tips for AI Agents
- Always check `README.md` for latest setup and workflow changes.
- Respect the separation between backend, frontend, and mobile code.
- Use environment variables for secrets (see `.env` example).
- Follow existing file organization for new features.

---
For questions or unclear conventions, ask for clarification or review recent commits for examples.
