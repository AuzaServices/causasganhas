// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexão com o banco MySQL
const db = mysql.createConnection({
  host: "sql10.freesqldatabase.com",
  user: "sql10799195",         // ← seu usuário do MySQL
  password: "rT9BIiqNUY", // ← sua senha do MySQL
  database: "sql10799195"  // ← nome do banco de dados
});

db.connect(err => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err);
  } else {
    console.log("Conectado ao MySQL!");
  }
});

// Rota de login
app.post("/api/login", (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({ mensagem: "Campos obrigatórios." });
  }

  const query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
  db.query(query, [user, password], (err, results) => {
    if (err) {
      console.error("Erro na consulta:", err);
      return res.status(500).json({ mensagem: "Erro interno no servidor." });
    }

    if (results.length > 0) {
      return res.status(200).json({ sucesso: true, mensagem: "Login autorizado." });
    } else {
      return res.status(401).json({ sucesso: false, mensagem: "Usuário ou senha inválidos." });
    }
  });
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});