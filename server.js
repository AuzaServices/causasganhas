const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

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

// Rota de cadastro com criptografia de senha
app.post("/api/cadastro", async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({ mensagem: "Campos obrigatórios." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";
    db.query(query, [user, hashedPassword], (err, results) => {
      if (err) {
        console.error("❌ Erro ao cadastrar:", err.code, err.sqlMessage);
        return res.status(500).json({ mensagem: "Erro ao salvar no banco." });
      }
      return res.status(201).json({ mensagem: "Cadastro feito com sucesso!" });
    });
  } catch (error) {
    console.error("❌ Erro ao criptografar senha:", error);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});

// Rota de login com verificação de hash
app.post("/api/login", (req, res) => {
  const { user, password } = req.body;

  const query = "SELECT * FROM usuarios WHERE email = ?";
  db.query(query, [user], async (err, results) => {
    if (err) {
      console.error("❌ Erro na consulta:", err);
      return res.status(500).json({ mensagem: "Erro interno no servidor." });
    }

    if (results.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: "Usuário não encontrado." });
    }

    const match = await bcrypt.compare(password, results[0].senha);
    if (match) {
      return res.status(200).json({ sucesso: true, mensagem: "Login autorizado." });
    } else {
      return res.status(401).json({ sucesso: false, mensagem: "Senha incorreta." });
    }
  });
});

// Rota de política de privacidade
app.get("/privacidade", (req, res) => {
  res.send(`
    <h1>Política de Privacidade</h1>
    <p>Este site é um projeto pessoal de demonstração. Os dados inseridos (e-mail e senha) são armazenados apenas para fins de teste e não são compartilhados com terceiros.</p>
  `);
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});