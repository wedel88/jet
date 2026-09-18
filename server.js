require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Verbindet sich über die Render Database URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Erforderlich für externe Render-Postgres-Verbindungen
});

// Tabelle beim Start automatisch anlegen (falls nicht vorhanden)
pool.query(`
  CREATE TABLE IF NOT EXISTS highscores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error("Fehler beim Erstellen der Tabelle:", err));

// 1. Highscores abrufen
app.get("/highscores", async (req, res) => {
  try {
    const result = await pool.query("SELECT name, score FROM highscores ORDER BY score DESC LIMIT 10");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Laden der Highscores" });
  }
});

// 2. Highscore speichern
app.post("/highscores", async (req, res) => {
  try {
    const { name, score } = req.body;
    await pool.query("INSERT INTO highscores (name, score) VALUES ($1, $2)", [name, score]);
    res.json({ message: "Highscore erfolgreich gespeichert!" });
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Speichern" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));