Project Overview: HealthGraph 🩺
Objective: To create a web application where users can upload PDF medical records (like lab reports), which are then automatically parsed by a multimodal LLM to visualize health metrics over time.

Core Features:

- PDF file upload via a web interface
- Direct parsing of PDF content using Google Gemini API
- Extraction of tabular data into structured JSON format
- Interactive Plotly charts with "Select All/Select None" buttons
- DataTables table with filtering, sorting and pagination
- CSV export functionality
- Responsive design that works on all devices

Technology Stack:

Backend: Python with FastAPI.

Frontend: HTML, CSS, and vanilla JavaScript.

LLM API: Google AI API for Gemini (1.5 Pro or similar) for native file processing.

Visualization Library: Plotly.js.

Phased Development Plan
This plan is broken into distinct phases, with each task framed as a clear instruction for your AI developer.

Phase 1: Backend API Development
The first phase focuses on building the core service that will process the documents.

Task 1.1: Initialize the Project
Create a root directory named HealthGraph with two subdirectories: backend and frontend. Inside backend, create a main.py file and a requirements.txt file containing:

fastapi
uvicorn
python-multipart
google-generativeai
Task 1.2: Create the PDF Processing Endpoint
In backend/main.py, set up a FastAPI application with a single POST endpoint at /process-pdf. This endpoint must be able to accept a file upload. For now, it can just confirm receipt of the file.

Task 1.3: Implement LLM-Powered PDF Parsing
Create a new Python module, llm_parser.py. Inside, write a function extract_data_from_pdf(file_path: str) -> dict. This function will perform the following steps:

Upload File to API: Use the Google AI SDK to upload the PDF file located at file_path. This makes the file available for the model to analyze.

Define the Prompt: Create a detailed prompt instructing the model on its task. The prompt should demand a specific JSON output structure.

Call the Model: Send both the prompt and the reference to the uploaded file to the Gemini model.

Return JSON: Parse the model's response and return the structured JSON data.

Example Gemini Prompt:

"You are an expert medical data extraction assistant. Analyze the attached PDF lab report. Your task is to extract all medical tests, their values, units, and reference ranges, grouping them by the visit date. Your output MUST be a single, clean JSON object and nothing else. The required JSON schema is: {\"visits\": [{\"visit_date\": \"YYYY-MM-DD\", \"records\": [{\"test_name\": \"string\", \"value\": \"float or string\", \"unit\": \"string\", \"reference_range\": \"string\"}]}]}. If a date is not found, use 'unknown'."

Example Python Snippet for llm_parser.py:

Python

import google.generativeai as genai

def extract_data_from_pdf(file_path: str, prompt: str) -> dict:
    # 1. Upload the file
    uploaded_file = genai.upload_file(path=file_path)
    
    # 2. Call the model with the prompt and the file
    model = genai.GenerativeModel(model_name="models/gemini-1.5-pro-latest")
    response = model.generate_content([prompt, uploaded_file])
    
    # Clean up the file from the service after processing
    genai.delete_file(uploaded_file.name)
    
    # 3. Return the parsed JSON content (add error handling)
    return response.text 
Task 1.4: Finalize the API Endpoint
Integrate the extract_data_from_pdf function into your /process-pdf endpoint. The endpoint should now save the uploaded file temporarily, call the parser function, delete the temporary file, and return the resulting JSON to the client.

Phase 2: Frontend User Interface
This phase focuses on building the user-facing part of the application.

Task 2.1: Create the HTML Structure
In the frontend directory, create an index.html file. This file needs:

A title and a brief description of the tool.

A file input: <input type="file" id="pdfUploader" accept=".pdf">.

A button to trigger the analysis: <button id="processBtn">Visualize Data</button>.

A container for dynamically generated checkboxes: <div id="metricSelector"></div>.

The main container for the chart: <div id="chartContainer"></div>.

Include the Plotly.js library from a CDN and a link to your script.js file.

Task 2.2: Implement File Upload and Data Fetching
In a new frontend/script.js file, write the logic to:

Add a click event listener to the "Visualize Data" button.

On click, grab the file from the input.

Use the fetch API to send the file in a FormData object via a POST request to your backend's /process-pdf endpoint.

While waiting for the response, display a loading message to the user.

Task 2.3: Populate the Data Selector
Upon receiving a successful JSON response from the backend:

Iterate through the data to find all unique test_name values.

For each unique test name, dynamically create and insert a checkbox with a corresponding label into the <div id="metricSelector">.

Task 2.4: Render the Interactive Chart

Add event listeners to the checkboxes in the metric selector.

Whenever a checkbox is changed, trigger a function to update the chart.

This function should filter the main JSON data based on which tests are currently selected.

For each selected test, create a "trace" for Plotly, where the x axis is an array of visit_dates and the y axis is an array of the corresponding values.

Use Plotly.newPlot('chartContainer', traces, layout) to draw a time-series line or scatter plot showing the data over time.

Phase 3: Refinement & Testing
This final phase polishes the application.

Task 3.1: Implement Robust Error Handling
Add error handling on both the frontend and backend. The frontend should display user-friendly alerts if the file upload fails or the server returns an error. The backend must gracefully handle invalid PDFs or unparseable responses from the LLM.

Task 3.2: Improve User Experience (UX)
Enhance the UI with loading spinners, clear instructions, and a responsive layout that works on different screen sizes.

Documentation Plan
Proper documentation is key for future maintenance.

README.md: This file should be in the project root. It needs to include a project description, the technology stack, and clear instructions for setup, including how to set the GOOGLE_API_KEY environment variable and run the backend server.

User Guide: A simple USER_GUIDE.md explaining how a non-technical person can use the website: upload a file, select metrics, and interpret the chart.

API Documentation: FastAPI automatically generates interactive API documentation. Once the server is running, it will be available at the /docs URL (e.g., http://127.0.0.1:8000/docs).

## Development Implementation Plan

This comprehensive implementation plan provides a clear, actionable checklist for developers to follow when implementing the HealthGraph application. The plan is organized into three distinct phases, with each task building upon the previous one.

### Phase 1: Backend API Development (Tasks 1-5)

- [x] **Task 1.1: Initialize the Project**
  - Create a root directory named HealthGraph with two subdirectories: backend and frontend
  - Inside backend, create a main.py file and a requirements.txt file containing:
    - fastapi
    - uvicorn
    - python-multipart
    - google-generativeai

- [x] **Task 1.2: Create the PDF Processing Endpoint**
  - In backend/main.py, set up a FastAPI application with a single POST endpoint at /process-pdf
  - The endpoint must be able to accept a file upload
  - For now, it can just confirm receipt of the file

- [x] **Task 1.3: Implement LLM-Powered PDF Parsing**
  - Created llm_parser.py module
  - Implemented extract_data_from_pdf function that:
    - Uploads PDF to Google AI API
    - Uses detailed prompt for structured JSON output
    - Calls Gemini model with prompt and file
    - Returns parsed JSON data
  - Added error handling and response cleaning

- [x] **Task 1.4: Finalize the API Endpoint**
  - Integrated extract_data_from_pdf into /process-pdf endpoint
  - The endpoint now:
    - Saves uploaded file temporarily
    - Calls parser function
    - Deletes temporary file
    - Returns parsed JSON data to client

- [x] **Task 1.5: Add Error Handling and Validation**
  - Implemented robust error handling for invalid PDFs
  - Added validation for file types and sizes
  - Handles API rate limits and service unavailability gracefully

### Phase 2: Frontend Implementation (Tasks 6-10)

- [x] **Task 2.1: Create the HTML Structure**
  - Created index.html with all required elements
  - Included Plotly.js and linked to script.js

- [x] **Task 2.2: Implement File Upload and Data Fetching**
  - Implemented click event listener for "Visualize Data" button
  - Added fetch API to send PDFs to /process-pdf endpoint
  - Added loading message display during processing

- [ ] **Task 2.3: Populate the Data Selector**
  - Upon receiving successful JSON response from the backend:
    - Iterate through the data to find all unique test_name values
    - For each unique test name, dynamically create and insert a checkbox with corresponding label into the metric selector

- [ ] **Task 2.4: Render the Interactive Chart**
  - Add event listeners to the checkboxes in the metric selector
  - Whenever a checkbox is changed, trigger a function to update the chart
  - This function should filter the main JSON data based on selected tests
  - For each selected test, create a Plotly trace with visit_dates on x-axis and corresponding values on y-axis
  - Use Plotly.newPlot to draw a time-series line or scatter plot

- [x] **Task 2.5: Implement Frontend Error Handling**
  - Added user-friendly error messages for file upload failures
  - Handles server errors gracefully
  - Added validation for file types and sizes on the frontend
  - Implemented "Select All" and "Select None" functionality

### Phase 3: Refinement & Documentation (Tasks 11-14)

- [ ] **Task 3.1: Implement Robust Error Handling**
  - Add comprehensive error handling on both frontend and backend
  - Display user-friendly alerts for file upload failures
  - Handle invalid PDFs and unparseable LLM responses gracefully

- [x] **Task 3.2: Improve User Experience (UX)**
  - Added loading spinners and progress indicators
  - Included clear instructions and tooltips
  - Implemented responsive layout for different screen sizes
  - Added visual feedback for user actions
  - Created responsive Plotly charts
  - Added DataTables for tabular data display
  - Implemented CSV export functionality

- [ ] **Task 3.3: Create Documentation**
  - Write README.md with project description, technology stack, and setup instructions
  - Create USER_GUIDE.md for non-technical users
  - Ensure API documentation is accessible via FastAPI's /docs endpoint

- [ ] **Task 3.4: Testing and Deployment Preparation**
  - Test the application with various PDF formats and content types
  - Optimize performance for large files
  - Prepare deployment configuration and documentation
  - Conduct user acceptance testing

## Project Status (As of 2025-08-21 - Updated)

### Core Functionality Implemented (As of 2025-08-21)

We have successfully implemented all core functionality for the HealthGraph application:

#### Backend
- **PDF Parsing:** The backend processes uploaded PDF files using the Gemini API to extract medical data
- **API Integration:** The `/process-pdf` endpoint returns extracted data as JSON
- **Error Handling:** Robust error handling for API calls, JSON parsing, and quota limits

#### Frontend
- **File Upload:** Users can upload PDF files through a clean interface
- **Data Fetching:** The frontend sends PDFs to the backend and receives parsed data
- **Metric Selection:** Dynamic checkboxes allow users to select metrics for visualization
- **Interactive Charts:** Plotly.js renders interactive time-series charts of health metrics

### Completed Tasks
- Task 1.1: Initialize the Project
- Task 1.2: Create the PDF Processing Endpoint
- Task 1.3: Implement LLM-Powered PDF Parsing
- Task 1.4: Finalize the API Endpoint
- Task 1.5: Add Error Handling and Validation
- Task 2.1: Create the HTML Structure
- Task 2.2: Implement File Upload and Data Fetching
- Task 2.3: Populate the Data Selector
- Task 2.4: Render the Interactive Chart
- Task 2.5: Implement Frontend Error Handling

### Recent Updates
- **Performance Monitoring**: Added a timer to the PDF extraction process to log the time taken for each PDF extraction
- **Error Handling**: Improved backend error logging and validation
- **UI Enhancements**: Added responsive Plotly charts, DataTables, and CSV export
- **UX Improvements**: Implemented loading indicators, tooltips, and responsive design

### Next Steps
- Complete Task 3.1: Implement robust error handling across application
- Begin Task 3.2: Improve User Experience (UX) with loading indicators and responsive design
- Start Task 3.3: Create documentation (README.md, USER_GUIDE.md)

