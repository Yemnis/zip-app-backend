const express = require('express');
const cors = require('cors');
const fs = require('fs');
const archiver = require('archiver');
const multer = require('multer'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

var corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
};

//DDos Protection middleware below. the requestLimit const can be adjusted from 50 to any other number.
//Clamscan can also be used to create a new middleware that will check for malicious files. For more info check:https://www.npmjs.com/package/clamscan
const requestLimit = 50;
const timeLimit = 60000;
let requestTimestamps = [];

// Define a middleware function to limit the number of requests. This has been tested and it works
const limitRequests = (req, res, next) => {
  const currentTime = new Date().getTime();

  // Remove timestamps older than 1 minute
  requestTimestamps = requestTimestamps.filter(timestamp => currentTime - timestamp < timeLimit);

  // If the number of requests in the last minute is less than the limit, allow the request
  if (requestTimestamps.length < requestLimit) {
    requestTimestamps.push(currentTime);
    next();
  } else {
    return res.status(429).send("Stop Spamming Pls Lol");
  }
};


// Route for zipping a file
app.post('/', cors(corsOptions), limitRequests, upload.single('file'), async (req, res) => {
  try {
    const file = req.file; // Use req.file instead of req.body.file
    if (!file) {
      return res.status(400).send('No file selected');
    }

    const tempFilePath = `${__dirname}/temp-file`;
    fs.writeFileSync(tempFilePath, file.buffer); 

    const output = fs.createWriteStream(`${__dirname}/output.zip`);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Set the compression level to maximum (9)
    });

    archive.pipe(output);
    archive.file(tempFilePath, { name: file.originalname })
    .finalize();

    output.on('close', () => {
      const downloadUrl = `http://localhost:6060/output.zip`;
      res.json({ downloadUrl }); // Return the JSON containing the download URL

      // Delete the temporary file
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error zipping file');
  }
});


// Route for downloading the zipped file
app.get('/output/:filename', limitRequests, cors(corsOptions), async (req, res) => {
  const compressedFilename = req.params.filename;
  const originalFilename = decodeURIComponent(compressedFilename).replace('-compressed.zip', '');
  const zipPath = `${__dirname}/output.zip`;

  res.download(zipPath, `${originalFilename}-compressed.zip`, (err) => {
    if (!err) {
      fs.unlinkSync(zipPath);
    }
  });
});



app.listen(6060, () => {
  console.log('Server started on port 6060');
});

