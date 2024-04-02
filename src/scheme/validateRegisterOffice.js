const Joi = require("joi");

// Função para validar CNPJ
const isValidCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) return false;

    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

    return resultado == digitos.charAt(1);
};

const validacaoCadastrarEmpresa = Joi.object({
    cnpj: Joi.string().custom((value, helpers) => {
        if (!isValidCNPJ(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }).required().messages({
        "string.empty": "O campo CNPJ é obrigatório!",
        "any.invalid": "O CNPJ informado é inválido!",
        "any.required": "O campo CNPJ é obrigatório!"
    }),
    razao_social: Joi.string().required().messages({
        "string.empty": "A razão social é obrigatória!",
        "any.required": "A razão social é obrigatória!"
    }),
    nome_fantasia: Joi.string().required().messages({
        "string.empty": "O nome fantasia é obrigatório!",
        "any.required": "O nome fantasia é obrigatório!"
    }),
    cep: Joi.string().pattern(/^\d{5}-?\d{3}$/).required().messages({
        "string.empty": "O CEP é obrigatório!",
        "string.pattern.base": "Formato de CEP inválido!",
        "any.required": "O campo CEP é obrigatório!"
    }),
    state: Joi.string().required().messages({
        "string.empty": "O estado é obrigatório!",
        "any.required": "O campo estado é obrigatório!"
    }),
    city: Joi.string().required().messages({
        "string.empty": "A cidade é obrigatória!",
        "any.required": "O campo cidade é obrigatório!"
    }),
    neighborhood: Joi.string().required().messages({
        "string.empty": "O bairro é obrigatório!",
        "any.required": "O campo bairro é obrigatório!"
    }),
    street: Joi.string().required().messages({
        "string.empty": "A rua é obrigatória!",
        "any.required": "O campo rua é obrigatório!"
    }),
    office_name: Joi.string().required().messages({
        "string.empty": "O bairro é obrigatório!",
        "any.required": "O campo bairro é obrigatório!"
    }),
    number: Joi.string().required().messages({
        "string.empty": "O número é obrigatório!",
        "any.required": "O campo número é obrigatório!"
    }),
    parent_office_id: Joi.string().allow(null, '').optional().messages({
        "string.empty": "O identificador do escritório pai deve ser válido ou nulo!"
    })
});

module.exports = { validacaoCadastrarEmpresa };
