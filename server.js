const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url'); // Add this
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

      // Better filename sanitization
      const sanitizedTitle = title.replace(/[^a-z0-9\s-]/gi, '_').replace(/\s+/g, '_').toLowerCase();
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
  if (req.method === 'POST' && req.url === '/delete-note') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const parsedData = new URLSearchParams(body);
      const noteId = parsedData.get('noteId');

      if (noteId) {
        const note = getNoteById(noteId);
        const title = note.title.replace(/[^a-z0-9\s-]/gi, '_').replace(/\s+/g, '_').toLowerCase();
        const filePath = path.join(__dirname, 'notes', `${title}.txt`);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting note:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error deleting note');
          } else {
            console.log("Deleted the note:", noteId);
            res.writeHead(302, { 'Location': '/' });
            res.end();
          }
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Note ID is required');
      }
    });
  }

  // Serve HTML files for GET requests
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  const routes = {
    "/": "index.html",
    "/about": "about.html",
    "/addNotes": "addNotes.html",
    "/viewNote": "viewNote.html",
    "/deleteNote": "deleteNote.html"
  };

  const reqPath = req.url.split("?")[0].replace(/\/$/, "") || "/";
  const fileName = routes[reqPath] || "errorPage.html";

  const filePath = path.join(__dirname, "src", fileName);

  // Reusable components/function
  function getNoteById(noteId) {
    if (!noteId) return null;

    const notesFolder = path.join(__dirname, 'notes');
    if (!fs.existsSync(notesFolder)) return null;

    const files = fs.readdirSync(notesFolder);
    const txtFiles = files.filter(file => file.endsWith('.txt'));

    if (!txtFiles[noteId - 1]) return null;

    const notePath = path.join(notesFolder, txtFiles[noteId - 1]);
    const content = fs.readFileSync(notePath, 'utf8');
    const title = txtFiles[noteId - 1].replace('.txt', '').replace(/_/g, ' ');

    return {
      title,
      content,
      filename: txtFiles[noteId - 1]
    };
  }

  function renderNoteHTML(note) {
    if (!note) {
      return '<p class="no-notes">Note not found</p>';
    }

    return `
    <header class="note-header">
      <h1 class="note-title">Title: ${note.title}</h1>
    </header>
    <article class="note-content">
      <p>${note.content}</p>
    </article>
  `;
  }

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

        txtFiles.forEach((file, index) => {
          const notePath = path.join(notesFolder, file);
          const content = fs.readFileSync(notePath, 'utf8');
          const title = file.replace('.txt', '').replace(/_/g, ' ');
          const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;

          notesHTML += `
            <div class="note-card" id="${index + 1}">
              <div class="noteContent">
              <h3 class="note-title">${title}</h3>
              <p class="note-body">${preview}</p>
              </div>
              <div class="action-btn">
              <button class="delete-note" onclick="location.href='/deleteNote?id=${index + 1}'">Delete</button>
              <button class="view-note" onclick="location.href='/viewNote?id=${index + 1}'">View</button>
              </div>
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
    else if (reqPath === "/viewNote") {
      let html = data.toString();

      // Parse the URL to get the note ID
      const parsedUrl = url.parse(req.url, true);
      const noteId = parsedUrl.query.id;

      const note = getNoteById(noteId);
      const noteContent = renderNoteHTML(note);

      // Replace comment in viewNote.html with actual content
      html = html.replace('<!-- NOTE_CONTENT -->', noteContent);
      return res.end(html);
    }
    else if (reqPath == "/deleteNote") {
      let html = data.toString();

      // Parse the URL to get the note ID
      const parsedUrl = url.parse(req.url, true);
      const noteId = parsedUrl.query.id;
      const note = getNoteById(noteId);
      if (!note) {
        noteContent = '<p class="no-notes">Note not found</p>';
      }
      console.log(note);
      console.log(noteId);

      noteContent = `
         <p class="title"><strong>Title:</strong> ${note.title}</p>
        <p class="content"><strong>Content:</strong> ${note.content}</p>
        <div class="action-btn">
          <button class="view-note" onclick="location.href='/'">Back</button>
          <form action="/delete-note" method="POST" style="display: inline;">
            <input type="hidden" name="noteId" value="${noteId}">
            <button type="submit" class="delete-note">Delete Note</button>
          </form>
        </div>
    `;
      // Replace comment in viewNote.html with actual content
      html = html.replace('<!-- NOTE_CONTENT -->', noteContent);
      return res.end(html);

    }

    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});