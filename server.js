import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

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

    const data = await apiRes.json();
    return res.json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "API request failed" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
