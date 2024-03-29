const joi = require("joi");

const validarBodyRequisicao = (joiSchema) => async (req, res, next) => {
  try {
    await joiSchema.validateAsync(req.body);
    next();
  } catch (error) {
    res.status(500).json({ mensagem: error.message });
  }
};

module.exports = validarBodyRequisicao;
