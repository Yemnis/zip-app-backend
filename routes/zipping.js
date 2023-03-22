const fs = require('fs');
const archiver = require('archiver');

// Limit the maximum file size to 200MB
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;

// Rate limit requests to 1 request per 30 seconds
const REQUESTS_PER_MINUTE = 2;
const REQUEST_INTERVAL_MS = 10000 / REQUESTS_PER_MINUTE;
let lastRequestTimestamp = 0;

// Zipping function
async function zipping(req, res, next) {
  try {
    // Check if enough time has passed since the last request
    const now = Date.now();
    if (now - lastRequestTimestamp < REQUEST_INTERVAL_MS) {
      return res.status(429).send('Too many requests');
    }
    lastRequestTimestamp = now;

    // Check if the file data exists
    const fileData = req.body.file;
    if (!fileData) {
      return res.status(400).send('No file selected');
    }

    // Check if the file size is within the limit
    if (fileData.length > MAX_FILE_SIZE_BYTES) {
      return res.status(401).send(`File size exceeds limit of ${MAX_FILE_SIZE_BYTES} bytes`);
    }

    // Create a temporary file to store the input data
    const tempFilePath = `${__dirname}/temp-file`;
    fs.writeFileSync(tempFilePath, fileData);

    // Create a write stream for the zip file
    const output = fs.createWriteStream(`${__dirname}/output.zip`);
    const archive = archiver('zip');

    // Pipe the archive to the output stream and wait for it to finish
    archive.pipe(output);
    archive.directory(tempFilePath, false);
    await archive.finalize();

    // Send the zip file as a response
    res.sendFile(`${__dirname}/output.zip`, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error sending file');
      } else {
        // Delete the temporary file and the zip file
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(`${__dirname}/output.zip`);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error zipping file');
  }
}

module.exports = zipping
