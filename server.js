import express from "express";
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ルートで index.html を返す
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// WebSocket 接続
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("download", async (data) => {
    const { url } = data;

    try {
      // youtubedl.mq.gy の API を叩く
      const apiRes = await fetch("https://youtubedl.mq.gy/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const text = await apiRes.text();
      console.log("API raw response:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        socket.emit("error", {
          error: "Invalid JSON from API",
          raw: text
        });
        return;
      }

      // クライアントに結果を送信
      socket.emit("done", json);

    } catch (err) {
      console.error("Fetch error:", err);
      socket.emit("error", { error: "API request failed", detail: err.message });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log("Server running on port " + port));
