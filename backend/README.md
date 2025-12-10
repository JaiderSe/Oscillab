# Backend API

This is the backend API for TDR (Time Domain Reflectometry) analysis.

## Installation

1. Navigate to the backend directory.
2. Install dependencies: `pip install -r requirements.txt`

## Running the Server

Run the server with: `python main.py` or `uvicorn main:app --reload`

The server will start on http://localhost:8000

## API Endpoints

### GET /

Returns a welcome message.

**Response:**
```json
{
  "message": "Hello World"
}
```

### POST /upload-csv

Uploads a CSV file and processes it to return time and magnitude arrays.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (UploadFile, CSV file with time and magnitude columns)

**Response:**
```json
{
  "time": [array of floats],
  "magnitude": [array of floats]
}
```

### POST /analyze-tdr

Analyzes TDR data from a CSV file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - file: CSV file (time, magnitude)
  - cable_length: float (physical cable length in meters)
  - z0_expected: float (expected characteristic impedance, default 50)
  - threshold: float (peak detection threshold, default 0.1)

**Response:**
```json
{
  "length_meters": float,
  "error_percent": float,
  "velocity_factor": float,
  "vswr": float,
  "reflection_coefficient": complex,
  "beta": float,
  "alpha": float,
  "Z0": float,
  "load_type": "capacitive" or "inductive",
  "load_value": float,
  "tdr_plot_base64": "base64 encoded PNG image"
}