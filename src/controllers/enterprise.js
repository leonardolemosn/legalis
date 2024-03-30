const knex = require("../config/conexao");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtPassword } = require("../config/security/jwtPassword");
const { consultarCNPJ } = require("../services/cnpjValidate");
const { consultarCEP } = require("../services/cepValidate");

const validateCNPJ_CEP = async (req, res) => {
    const { cnpj, cep } = req.body;
    try {
        const cnpjExistente = await knex("users_documents").where({ document_number: cnpj }).first();

        if (cnpjExistente) {
            return res.status(400).json({ mensagem: "Usuário já cadastrado" });
        }

        const dadosCNPJ = await consultarCNPJ(cnpj);

        if (!dadosCNPJ) {
            return res.status(404).json({ error: "Dados do CNPJ não encontrados." });
        }

        if (dadosCNPJ.descricao_situacao_cadastral !== "ATIVA") {
            return res.status(400).json({ error: "A situação cadastral do CNPJ não está ativa." });
        }


        const dadosCEP = await consultarCEP(cep);

        if (!dadosCEP) {
            return res.status(404).json({ error: "Dados do CNPJ não encontrados." });
        }
        res.json({
            dadosCNPJ,
            dadosCEP
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Server error", error: error.message });
    }
};


const registerCompany = async (req, res) => {
    const { cnpj, razao_social, nome_fantasia, cep, state, city, neighborhood, street, number, office_name, parent_office_id } = req.body;

    try {
        const cnpjExistente = await knex("users_documents").where({ document_number: cnpj }).first();

        if (cnpjExistente && cnpjExistente.active === true) {
            return res.status(400).json({ mensagem: "Usuário já cadastrado" });
        } else {
            knex("users_documents").where({ document_number: cnpj, active: false }).delete();
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Server error", error: error.message });
    }
};


module.exports = {
    validateCNPJ_CEP,
    registerCompany
};