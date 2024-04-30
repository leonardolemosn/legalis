const knex = require("../config/conexao");
const { consultarCNPJ } = require("../services/cnpjValidate");
const { consultarCEP } = require("../services/cepValidate");
const { registerUser } = require("../services/userService");
const { registerOffice } = require("../services/officeService")

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


const registerCompanyController = async (req, res) => {
    try {
        const officeId = await registerOffice(req.body);
        if (!officeId) {
            return res.status(400).json({ mensagem: "Erro ao registrar o escritório" });
        }

        const user = await registerUser({...req.body, office_id: officeId});

        res.status(200).json({ mensagem: "Escritório e usuário registrados com sucesso", officeId, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Server error", error: error.message });
    }
};


module.exports = {
    registerCompanyController,
    validateCNPJ_CEP
};