const Joi = require("joi");

// Função para validar CPF
const isValidCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }

    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }

    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.charAt(10));
};

const validacaoCadastrarUsuario = Joi.object({
    nome: Joi.string().required().messages({
        "string.empty": "O campo nome é obrigatório!",
        "string.base": "Formato de nome inválido!",
        "any.required": "O campo nome é obrigatório!",
    }),
    user_type_id: Joi.string().required().valid(
        '53dfc840-502e-423a-b281-954dde752230', 
        '2a8e7948-55e4-4f3e-aaf1-b699d699654f', 
        '4a021d0b-88a5-4f96-8101-0509ea7dcb4a', 
        'd6ab38f4-4567-480f-9553-61928cd86f74', 
        'f7fc995c-4df5-4740-af9e-d4b1fdf56c94'
    ).messages({
        "string.empty": "O campo user_type_id é obrigatório!",
        "any.required": "O campo user_type_id é obrigatório!",
    }),
    oab: Joi.string().pattern(/^[A-Z]{2}\d{4,6}$/).when('user_type_id', {is: '53dfc840-502e-423a-b281-954dde752230',then: Joi.required(),otherwise: Joi.optional()}).messages({
        "string.empty": "O campo OAB é obrigatório para advogados!",
        "string.pattern.base": "Formato de OAB inválido! Deve seguir o padrão UF + Número (ex: SP123456).",
        "any.required": "O campo OAB é obrigatório para advogados!",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Email inválido!",
        "any.required": "O campo email é obrigatório para cadastro com email!",
    }),
    telefone: Joi.string().pattern(/^[1-9][0-9]\d{8,9}$/).required().messages({
        "string.pattern.base": "Formato de telefone inválido! Use o formato brasileiro sem espaços ou símbolos (ex: 81999999999).",
        "any.required": "O campo telefone é obrigatório para cadastro com telefone!",
    }),
    senha: Joi.string().min(6).max(20).required().messages({
        "string.empty": "O campo senha é obrigatório!",
        "string.min": "A senha deve ter no mínimo 6 caracteres",
        "string.max": "A senha deve ter no máximo 20 caracteres",
        "any.required": "O campo senha é obrigatório!",
    }),
    cpf: Joi.string().custom((value, helpers) => {
        if (!isValidCPF(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }).required().messages({
        "any.required": "O campo CPF é obrigatório!",
        "any.invalid": "O CPF informado é inválido!",
    }),
});


const validarLoginUsuario = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Email inválido!",
        "any.required": "O campo email é obrigatório para cadastro com email!",
    }),
    senha: Joi.string().min(6).max(20).required().messages({
        "string.empty": "O campo senha é obrigatório!",
        "string.min": "A senha deve ter no mínimo 6 caracteres",
        "string.max": "A senha deve ter no máximo 20 caracteres",
        "any.required": "O campo senha é obrigatório!",
    }),
});

module.exports = {
    validacaoCadastrarUsuario,
    validarLoginUsuario
};
