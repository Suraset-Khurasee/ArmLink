import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const port = Number(process.env.PORT || 3000);

let jointState = [0, 0, 0, 0];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": contentTypes[".json"] });
  response.end(JSON.stringify(data));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return JSON.parse(body);
}

async function serveStatic(request, response) {
  const requestedPath = request.url === "/" ? "/index.html" : request.url;
  const filePath = normalize(join(publicDir, requestedPath));
  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/api/joints" && request.method === "GET") {
    sendJson(response, 200, { mode: "mock", joints: jointState });
    return;
  }

  if (url.pathname === "/api/joints" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      if (!Array.isArray(payload.joints) || payload.joints.length !== 7) {
        sendJson(response, 400, { error: "joints must contain seven numeric values" });
        return;
      }

      const nextState = payload.joints.map(Number);
      if (nextState.some((value) => !Number.isFinite(value) || value < -180 || value > 180)) {
        sendJson(response, 400, { error: "joint values must be finite angles from -180 to 180" });
        return;
      }

      jointState = nextState;
      sendJson(response, 200, { mode: "mock", joints: jointState });
    } catch {
      sendJson(response, 400, { error: "invalid JSON request" });
    }
    return;
  }

  if (url.pathname === "/api/hardware/status") {
    sendJson(response, 200, {
      connected: false,
      enabled: false,
      reason: "Hardware integration is intentionally disabled in this UI-only prototype."
    });
    return;
  }

  await serveStatic(request, response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`ArmLink listening on http://localhost:${port}`);
});
