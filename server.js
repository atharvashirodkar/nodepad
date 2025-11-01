const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  // Handle POST request for saving notes
  if (req.method === 'POST' && req.url === '/save-note') {
    let body = '';

    req.on('data', chunk => body += chunk.toString());

    req.on('end', () => {
      const params = new URLSearchParams(body);
      const title = params.get('noteTitle');
      const noteBody = params.get('noteBody');

      const folderName = path.join(__dirname, 'notes');
      fs.mkdirSync(folderName, { recursive: true });

      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePath = path.join(folderName, `${sanitizedTitle}.txt`);

      fs.writeFile(filePath, noteBody, (err) => {
        if (err) {
          res.statusCode = 500;
          return res.end('Error saving note');
        }

        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
      });
    });
    return;
  }

  // Serve HTML files for GET requests
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

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      return res.end("Error loading page");
    }
    if (reqPath === "/") {
      let html = data.toString();

      // Read notes from folder
      const notesFolder = path.join(__dirname, 'notes');
      let notesHTML = '';

      // Check if notes folder exists
      if (fs.existsSync(notesFolder)) {
        const files = fs.readdirSync(notesFolder);
        const txtFiles = files.filter(file => file.endsWith('.txt'));

        txtFiles.forEach(file => {
          const notePath = path.join(notesFolder, file);
          const content = fs.readFileSync(notePath, 'utf8');
          const title = file.replace('.txt', '').replace(/_/g, ' ');

          notesHTML += `
            <div class="note-card">
              <h3 class="note-title">${title}</h3>
              <p class="note-body">${content}</p>
            </div>
          `;
        });
      }

      // Show message if no notes
      if (notesHTML === '') {
        notesHTML = '<p class="no-notes">No notes yet. Add your first note!</p>';
      }

      // Insert notes into HTML
      html = html.replace('<!-- NOTES -->', notesHTML);

      return res.end(html);
    }
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
