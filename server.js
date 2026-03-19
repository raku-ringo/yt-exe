import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

// public フォルダを静的配信
app.use(express.static("public"));

// __dirname を ES Module で使うための処理
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ルートアクセスで index.html を返す
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// youtubedl.mq.gy の API を代理で叩く
app.post("/api/create", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "YouTube URL is required" });
  }

  try {
    const apiRes = await fetch("https://youtubedl.mq.gy/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    // 生レスポンスをログに出す（原因調査用）
    const text = await apiRes.text();
    console.log("API raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Invalid JSON from API",
        raw: text
      });
    }

    return res.json(data);

  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({
      error: "API request failed",
      detail: err.message
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
