# HealthGraph - Medical Data Visualization

HealthGraph extracts and visualizes health metrics from PDF lab reports.

## Features

- Upload PDF lab reports
- Extract structured data using AI
- Interactive Plotly charts
- Data table with sorting/filtering
- Export to CSV

## Setup

### Local Development

1. Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

2. Set environment variables:

```bash
# Create .env file in backend directory
echo "GOOGLE_API_KEY=your_api_key_here" > backend/.env
```

3. Start the backend server:

```bash
uvicorn backend.main:app --reload --port 8000
```

4. Open `frontend/index.html` in a browser

### Docker

1. Build and start the container:

```bash
docker-compose up --build
```

2. Open http://localhost:8000 in a browser

## Usage

1. Select a PDF lab report
2. Click "Visualize Data"
3. View charts and data table
4. Export data as CSV

## Project Structure

- `backend/`: Python API server
- `frontend/`: HTML/CSS/JS frontend
- `extdata/`: Sample lab reports

## Future: consider using PyMuPDF4LLM

## Capstone Fall 2025 Additions

- Run project on venv, host like this uvicorn backend.main:app --reload --port 8000 --host 10.203.94.239(Your IP)
- Install node.js
- Have these libraries installed - npx expo install expo-document-picker - npm install react-native-plotly react-native-paper
- Download expogo
