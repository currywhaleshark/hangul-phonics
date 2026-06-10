const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 5174);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function resolveRequest(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  const relative = cleanUrl === "/" ? "/worksheets/pilot-a4.html" : cleanUrl;
  const target = path.resolve(root, `.${relative}`);
  if (!target.startsWith(root)) return null;
  return target;
}

const server = http.createServer((req, res) => {
  const target = resolveRequest(req.url || "/");
  if (!target) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(target, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`worksheet preview: http://localhost:${port}/worksheets/pilot-a4.html`);
});
