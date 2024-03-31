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

        if (cnpjExistente && cnpjExistente.active === true) {
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
            return res.status(404).json({ error: "Dados do CEP não encontrados." });
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

        if (cnpjExistente && !cnpjExistente.active) {
            await knex("offices")
                .where({ office_id: cnpjExistente.office_id })
                .delete();
            await knex("users_documents").where({ document_number: cnpj }).delete();

        } else if (cnpjExistente) {
            return res.status(400).json({ mensagem: "CNPJ já cadastrado para uma empresa ativa." });
        }

        const [offices] = await knex("offices").insert({
            name: office_name,
            parent_office_id: parent_office_id || null,
            razao_social,
            nome_fantasia,
            active: true
        }).returning('office_id');

        if (!offices) {
            return res.status(404).json({ mensagem: "Erro ao adicionar empresa" });
        }

        if (!offices.office_id) {
            return res.status(400).json({ mensagem: "Identificador do escritório é obrigatório)" });
        }

        await knex("users_documents").insert({
            office_id: offices.office_id,
            document_type_id: "20f53e68-22c8-4f6b-9076-d3eb2364fe9f",
            document_number: cnpj,
            active: true,
            created_at: new Date(),
            updated_at: new Date()
        });

        await knex("offices_addresses").insert({
            cep,
            state,
            city,
            neighborhood,
            street,
            office_id: offices.office_id,
            number,
            created_at: new Date(),
            updated_at: new Date()
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Server error", error: error.message });
    }
};


module.exports = {
    validateCNPJ_CEP,
    registerCompany
};