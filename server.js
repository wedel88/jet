require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Tabelle beim Start anlegen
pool.query(`
  CREATE TABLE IF NOT EXISTS highscores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error("DB-Fehler:", err));

// Highscores abrufen
app.get("/highscores", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name, score FROM highscores ORDER BY score DESC LIMIT 10"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
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
    await pool.query(
      "INSERT INTO highscores (name, score) VALUES ($1, $2)",
      [name, score]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Speichern fehlgeschlagen" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
