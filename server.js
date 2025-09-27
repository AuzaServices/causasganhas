const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Conexão com o banco MySQL
const db = mysql.createConnection({
  host: "sql10.freesqldatabase.com",
  user: "sql10799195",
  password: "rT9BIiqNUY",
  database: "sql10799195"
});

db.connect(err => {
  if (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  } else {
    console.log("✅ Conectado ao MySQL!");
  }
});

// Rota de cadastro: salva email e senha no banco
app.post("/api/cadastro", (req, res) => {
  const { user, password } = req.body;

  console.log("📥 Dados recebidos:", user, password);

  if (!user || !password) {
    return res.status(400).json({ mensagem: "Campos obrigatórios." });
  }

  const query = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";
  db.query(query, [user, password], (err, results) => {
    if (err) {
      console.error("❌ Erro ao cadastrar:", err);
      return res.status(500).json({ mensagem: "Erro ao salvar no banco." });
    }

    return res.status(201).json({ mensagem: "Cadastro feito com sucesso!" });
  });
});

// Rota de login (opcional)
app.post("/api/login", (req, res) => {
  const { user, password } = req.body;

  const query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
  db.query(query, [user, password], (err, results) => {
    if (err) {
      console.error("❌ Erro na consulta:", err);
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
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});