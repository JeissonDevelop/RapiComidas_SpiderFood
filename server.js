const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/translate", async (req, res) => {
  const { text, target_lang } = req.body;
  try {
    const params = new URLSearchParams();
    params.append("text", text);
    params.append("target_lang", target_lang);

    const response = await axios.post(
      "https://api-free.deepl.com/v1/translate",
      params,
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${process.env.VITE_DEEPL_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
