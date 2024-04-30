const knex = require("../config/conexao");
const { jwtPassword } = require("../config/security/jwtPassword");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const validarAutenticacao = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ mensagem: "Usuário não logado" });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ mensagem: "Token não fornecido" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    const decodedToken = jwt.verify(token, jwtSecret);

    if (!decodedToken || !decodedToken.id) {
      return res.status(400).json({ mensagem: "ID do usuário não disponível no token." });
    }
    
    const usuarioLogado = await knex("users").where("user_id", decodedToken.id).first();

    if (!usuarioLogado) {
      return res.status(401).json({ mensagem: "Usuário sem permissão" });
    }

    // A linha abaixo é desnecessária e pode ser removida
    // delete usuarioLogado.senha; // Se você ainda quiser garantir que a senha não seja incluída, faça de forma segura

    req.usuarioLogado = usuarioLogado;

    next();
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ mensagem: "Token inválido" });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ mensagem: "Token expirado" });
    } else {
      return res.status(500).json({ mensagem: "Erro interno do middleware", error: error.message });
    }
  }
};

module.exports = validarAutenticacao;