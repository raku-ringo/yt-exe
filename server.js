app.post("/api/create", async (req, res) => {
  const { url } = req.body;

  try {
    const apiRes = await fetch("https://youtubedl.mq.gy/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const text = await apiRes.text(); // ← まず生のレスポンスを読む
    console.log("API response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Invalid JSON from API", raw: text });
    }

    return res.json(data);

  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "API request failed", detail: err.message });
  }
});
