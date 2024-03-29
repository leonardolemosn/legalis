const knex = require("../config/conexao");
const { jwtPassword } = require("../config/security/jwtPassword");
const jwt = require("jsonwebtoken");

const validarAutenticacao = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ mensagem: "Usuário não logado" });
  }
  const token = authorization.split(" ")[1];

  try {
    const { id: usuarioLogadoId } = jwt.verify(token, jwtPassword);
    const usuarioLogado = await knex("users").where("id", usuarioLogadoId);

    if (usuarioLogado.length === 0) {
      return res.status(401).json({ mensagem: "Usuário sem permissão" });
    }
    delete usuarioLogado[0].senha;
    req.usuarioLogado = usuarioLogado[0];

    next();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = validarAutenticacao;
