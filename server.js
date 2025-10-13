const express = require("express"),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  mysql = require("mysql2"),
  path = require("path"),
  axios = require("axios"),
  app = express(),
  PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host: "sql5.freesqldatabase.com",
  user: "sql5802663",
  password: "p56QUxpyQI",
  database: "sql5802663"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  } else {
    console.log("✅ Conectado ao MySQL!");
  }
});

// 📍 Rastrear IP e salvar cidade
const IPINFO_TOKEN = "83e6d56256238e";

app.get("/api/rastrear", async (req, res) => {
  const ipRaw = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  const ipPublico = ipRaw.replace("::ffff:", "");

  let cidade = "Desconhecida";
  let estado = "XX";

  try {
    const response = await axios.get(`https://ipinfo.io/${ipPublico}/json?token=${IPINFO_TOKEN}`);
    const data = response.data;
    cidade = data.city?.trim() || "Desconhecida";
    estado = data.region?.trim() || "XX";
  } catch (err) {
    console.warn("❌ Falha ao consultar localização:", err.message);
  }

  try {
    const query = "INSERT INTO rastreamento (ip, cidade, estado) VALUES (?, ?, ?)";
    db.query(query, [ipPublico, cidade, estado], (err) => {
      if (err) {
        console.error("Erro ao salvar rastreamento:", err.message);
        return res.status(500).json({ error: "Erro ao salvar rastreamento" });
      }
      res.status(200).json({ mensagem: "Localização registrada com sucesso", cidade, estado });
    });
  } catch (err) {
    console.error("Erro geral:", err.message);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Cadastro sem criptografia
app.post("/api/cadastro", (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({ mensagem: "Campos obrigatórios." });
  }

  const sql = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";
  db.query(sql, [user, password], (err) => {
    if (err) {
      console.error("❌ Erro ao cadastrar:", err.code, err.sqlMessage);
      return res.status(500).json({ mensagem: "Erro ao salvar no banco." });
    }

    res.status(201).json({ mensagem: "Cadastro feito com sucesso!" });
  });
});

// Login sem criptografia
app.post("/api/login", (req, res) => {
  const { user, password } = req.body;

  db.query("SELECT * FROM usuarios WHERE email = ?", [user], (err, results) => {
    if (err) {
      console.error("❌ Erro na consulta:", err);
      return res.status(500).json({ mensagem: "Erro interno no servidor." });
    }

    if (results.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: "Usuário não encontrado." });
    }

    if (results[0].senha === password) {
      return res.status(200).json({ sucesso: true, mensagem: "Login autorizado." });
    } else {
      return res.status(401).json({ sucesso: false, mensagem: "Senha incorreta." });
    }
  });
});

app.get("/privacidade", (req, res) => {
  res.send(`
    <h1>Política de Privacidade</h1>
    <p>Este site é um projeto pessoal de demonstração. Os dados inseridos (e-mail e senha) são armazenados apenas para fins de teste e não são compartilhados com terceiros.</p>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});