import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1416546195270271006/q4MQMP3hPmqZ467_0CNdOSg9QSg6CfpowuGXuxzXftVB0U0dF_zCfxZ-le5r-eTFVkm8";

app.post("/", async (req, res) => {
  try {
    const { username, message } = req.body;

    let translated = null;

    try {
      const tResponse = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          q: message,
          source: "auto",
          target: "en"
        })
      });

      const data = await tResponse.json();
      if (data?.translatedText && data.translatedText.trim() !== message.trim()) {
        translated = data.translatedText;
      }
    } catch (e) {
      console.error("Translation failed:", e);
    }

    // Build message for Discord
    let content = `**${username}:** ${message}`;
    if (translated) {
      content += `\n*(Translated: ${translated})*`;
    }

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(400).send("Bad Request");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Relay running on port ${port}`));
