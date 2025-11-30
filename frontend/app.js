// Global variable to store extracted data
let extractedData = null;
let extractionTimer = null;
let startTime = null;

// Get DOM elements
const pdfUploader = document.getElementById('pdfUploader');
const processBtn = document.getElementById('processBtn');
const statusMessage = document.getElementById('statusMessage');
const timerDisplay = document.getElementById('timerDisplay');
const timerValue = document.getElementById('timerValue');
const chartContainer = document.getElementById('chartContainer');
const exportCsvBtn = document.getElementById('exportCsvBtn');

// Timer functions
function startTimer() {
    timerDisplay.style.display = 'block';
    timerValue.textContent = '0.00';
    startTime = Date.now();
    extractionTimer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timerValue.textContent = elapsed.toFixed(2);
    }, 100);
}

function stopTimer() {
    if (extractionTimer) {
        clearInterval(extractionTimer);
        extractionTimer = null;
    }
}

// Handle file upload and processing
processBtn.addEventListener('click', async () => {
    console.log('1. Visualize data button clicked.');
    const file = pdfUploader.files[0];
    
    if (!file) {
        showStatus('Please select a PDF file first.', 'error');
        console.log('2. No file selected, returning.');
        return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showStatus('File size exceeds 10MB limit.', 'error');
        console.log('3. File size exceeds limit, returning.');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    console.log('4. FormData created.');
    
    try {
        showStatus('Processing PDF... This may take several minutes.', 'info');
        startTimer();
        console.log('5. Starting fetch request.');
        
        const response = await fetch('/process-pdf', {
            method: 'POST',
            body: formData,
        });
        
        console.log('6. Fetch response received:', response);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('7. Server error response:', errorData);
            throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
        }
        extractedData = await response.json();
        console.log('8. Data extracted successfully:', extractedData);
        showStatus('Data extracted successfully!', 'success');
        
        // Show the export CSV button
        exportCsvBtn.style.display = 'block';
        console.log('9. Export CSV button shown.');
        
        // Render the initial chart with all metrics
        renderChart();
        console.log('10. Chart rendered.');
        
        // Populate the data table
        populateDataTable(extractedData);
        console.log('11. Data table populated.');


    } catch (error) {
        console.error('12. Error during PDF processing:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        stopTimer();
        console.log('13. Timer stopped, process finished.');
    }
});

// Show status messages
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = type;
}


// Render the chart with all metrics
function renderChart() {
    if (!extractedData) return;
    
    // Prepare data for Plotly
    const traces = [];
    const dates = extractedData.visits.map(visit => visit.visit_date);
    
    // Collect unique test names
    const testNames = new Set();
    extractedData.visits.forEach(visit => {
        visit.records.forEach(record => {
            testNames.add(record.test_name);
        });
    });
    
    // Create a trace for each metric
    testNames.forEach(metric => {
        const values = extractedData.visits.map(visit => {
            const record = visit.records.find(r => r.test_name === metric);
            return record ? parseFloat(record.value) || 0 : null;
        });
        
        traces.push({
            x: dates,
            y: values,
            type: 'scatter',
            mode: 'lines+markers',
            name: metric
        });
    });
    
    // Layout configuration
    const layout = {
        title: 'Health Metrics Over Time',
        autosize: true, // Enable autosizing
        xaxis: {
            title: 'Date',
            automargin: true // Ensures labels don't get cut off
        },
        yaxis: { title: 'Value' },
        hovermode: 'closest',
        // Add legend instructions as annotation
        annotations: [{
            x: 1,
            y: 1.1,
            xref: 'paper',
            yref: 'paper',
            showarrow: false,
            text: 'Double-click legend to show only one biomarker. Double-click again to show all.',
            font: { size: 12, color: '#666' },
            align: 'right'
        }]
    };

    // Adjust x-axis for single date
    if (dates.length === 1) {
        layout.xaxis.tickmode = 'array';
        layout.xaxis.tickvals = [dates[0]];
        // Optional: Adjust range to center the single date
        const singleDate = new Date(dates[0]);
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
        layout.xaxis.range = [new Date(singleDate.getTime() - oneDay), new Date(singleDate.getTime() + oneDay)];
    }
    
    // Render the chart with responsive config
    Plotly.newPlot('chartContainer', traces, layout, {responsive: true});
}

// Utility function to create DOM elements
function createElement(tag, attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        element[key] = value;
    });
    return element;
}

// Populate the DataTables table
function populateDataTable(data) {
    const tableData = [];
    data.visits.forEach(visit => {
        const visitDate = visit.visit_date;
        visit.records.forEach(record => {
            tableData.push([
                visitDate,
                record.test_name,
                record.value,
                record.unit || '',
                record.reference_range || ''
            ]);
        });
    });

    // Destroy existing DataTable instance if it exists
    if ($.fn.DataTable.isDataTable('#data-table')) {
        $('#data-table').DataTable().destroy();
    }

    $('#data-table').DataTable({
        data: tableData,
        columns: [
            { title: "Date" },
            { title: "Metric" },
            { title: "Value" },
            { title: "Unit" },
            { title: "Reference Range" }
        ],
        paging: true,
        searching: true,
        ordering: true,
        info: true
    });
}

// Add event listener for export button
exportCsvBtn.addEventListener('click', () => {
    exportDataToCsv();
});

// Export data to CSV
function exportDataToCsv() {
    if (!extractedData) {
        showStatus('No data to export.', 'error');
        return;
    }

    let csvContent = "Date,Metric,Value,Unit,Reference Range\n";

    extractedData.visits.forEach(visit => {
        const visitDate = visit.visit_date;
        visit.records.forEach(record => {
            const row = [
                visitDate,
                record.test_name,
                record.value,
                record.unit || '',
                record.reference_range || ''
            ].map(item => `"${String(item).replace(/"/g, '""')}"`).join(','); // Handle commas and quotes
            csvContent += row + "\n";
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'medical_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showStatus('Data exported to CSV successfully!', 'success');
    } else {
        showStatus('Your browser does not support downloading files directly.', 'error');
    }
}