# File Zipping API

This API allows users to upload a file, zip it on the server, and download the zipped file.

## Prerequisites

- Node.js installed on your local machine
- Dependencies installed:
  - express
  - cors
  - fs
  - archiver
  - multer

## Installation

1. Install the required dependencies with: `npm install express cors fs archiver multer --save`


## Running the API locally

1. Create a file named `app.js` in your project directory and copy the provided code into it.
2. In your terminal, navigate to the project directory and run the following command to start the server: `node app.js`
3. The server will start on port 6060, and you should see the message "Server started on port 6060" in your terminal.

## API Endpoints

- POST `/`: Upload and zip a file
- Accepts a `multipart/form-data` request containing a single file with the key "file".
- Returns a JSON object containing the download URL for the zipped file.
- GET `/output.zip`: Download the zipped file

## How it works

- The API uses the `express`, `cors`, `fs`, `archiver`, and `multer` packages.
- The `multer` package is used to handle `multipart/form-data` requests and store the uploaded file in memory.
- When a file is uploaded to the POST `/` endpoint, the server saves it as a temporary file.
- The server creates a zip archive, adds the uploaded file to it, and saves the archive as `output.zip`.
- The server responds with a JSON object containing the download URL for the zipped file.
- The temporary file is deleted after being added to the zip archive.
