require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Supabase-Client mit den Daten aus deinem Dashboard initialisieren
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

// Highscores abrufen
app.get("/highscores", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("highscores")
      .select("name, score")
      .order("score", { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Fehler beim Laden:", err);
    res.status(500).json([]);
  }
});

// Highscore speichern
app.post("/highscores", async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || score === undefined) {
      return res.status(400).json({ error: "Ungültige Daten" });
    }

    const { error } = await supabase
      .from("highscores")
      .insert([{ name, score }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
    res.status(500).json({ error: "Speichern fehlgeschlagen" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
