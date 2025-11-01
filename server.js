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
  };

  const reqPath = req.url.split("?")[0].replace(/\/$/, "") || "/";
  const fileName = routes[reqPath] || "errorPage.html";

  const filePath = path.join(__dirname, "src", fileName);

  if (filePath) {
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
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});