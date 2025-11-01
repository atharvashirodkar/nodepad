const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  const routes = {
    "/": "index.html",
    "/about": "about.html",
    "/addNotes": "addNotes.html",
    "*": "errorPage.html"
  };

  const filePath = routes[req.url];
  console.log("filepath: ",filePath);
  
  if (filePath) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        return res.end("Error loading page");
      }
      res.end(data);
    });
  }
  else if (filePath) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        return res.end("Error loading page");
      }
      res.end(data);
    });
  }
  else if (filePath) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        return res.end("Error loading page");
      }
      res.end(data);
    });
  }

  const folderName = path.join(__dirname, 'notes');
  fs.mkdir(folderName, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating folder:', err);
      return;
    }

    const filePath = path.join(folderName, 'notes1.txt');

    fs.writeFile(filePath, 'This is a sample.', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }

      console.log('✅ File "notes1.txt" has been saved inside the "notes" folder!');
    });
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});