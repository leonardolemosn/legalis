const knex = require("../config/conexao");
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
    const timestamp = new Date();
    let office_id;

    try {
        await knex.transaction(async trx => {
            const cnpjExistente = await trx("users_documents").where({ document_number: cnpj }).first();

            if (cnpjExistente && cnpjExistente.active) {
                throw new Error("CNPJ já cadastrado para uma empresa ativa.");
            }

            const officeData = {
                name: office_name,
                parent_office_id: parent_office_id || null,
                razao_social,
                nome_fantasia,
                active: true,
                created_at: timestamp
            };

            if (cnpjExistente) {
                const updatedOffice = await trx("offices")
                    .where({ office_id: cnpjExistente.office_id })
                    .update(officeData)
                    .returning('office_id');
                office_id = updatedOffice[0]; // Ajuste para acessar o ID corretamente
            } else {
                officeData.created_at = timestamp;
                const [newOffice] = await trx("offices")
                    .insert(officeData)
                    .returning('office_id');
                office_id = newOffice.office_id;
            }

            if (!office_id) {
                throw new Error("Erro ao adicionar/atualizar empresa");
            }

            await trx("users_documents").insert({
                office_id: office_id,
                document_type_id: "20f53e68-22c8-4f6b-9076-d3eb2364fe9f",
                document_number: cnpj,
                active: true,
                created_at: timestamp,
                updated_at: timestamp
            });

            await trx("offices_addresses").insert({
                cep,
                state,
                city,
                neighborhood,
                street,
                office_id: office_id,
                number,
                created_at: timestamp,
                updated_at: timestamp
            });

            // Resposta com office_id
            res.json({ office_id });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Server error", error: error.message });
    }
};

module.exports = {
    registerCompany
};



module.exports = {
    validateCNPJ_CEP,
    registerCompany
};