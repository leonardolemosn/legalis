const knex = require("../config/conexao");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtPassword } = require("../config/security/jwtPassword");
const { consultaOAB } = require("../services/oabValidate");

const registerUser = async (req, res) => {
    const { user_type_id, nome, email, telefone, senha, oab, cpf } = req.body;
    try {
        const usuarioExistente = await knex("users_documents").where({ document_number: cpf }).first();

        if (usuarioExistente) {
            return res.status(400).json({ mensagem: "Usuário já cadastrado" });
        }

        const validarTelefone = await knex("users").where({ phone_number: telefone }).first();

        if (validarTelefone) {
            return res.status(400).json({ mensagem: "Telefone informado já cadastrado" });
        }

        const validarEmail = await knex("users").where({ email }).first();

        if (validarEmail) {
            return res.status(400).json({ mensagem: "Email informado já cadastrado" });
        }

        const userType = await knex("users_types").where({ user_type_id: user_type_id }).first();

        if (!userType) {
            return res.status(404).json({ mensagem: "Tipo de perfil não encontrado" });
        }

        if (oab) {
            const numerosOAB = oab.match(/\d+/g).join('');
            const oabResult = await consultaOAB(nome, numerosOAB);
            if (!oabResult) {
                return res.status(404).json({ mensagem: "Advogado não encontrado" });
            }

            const nomeSemAcento = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const oabResultSemAcento = oabResult.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

            if (oabResultSemAcento !== nomeSemAcento) {
                return res.status(404).json({ mensagem: "OAB não corresponde ao advogado informado" });
            }

            const validarOAB = await knex("users_documents").where({ document_number: oab });
            if (validarOAB.length > 0) {
                return res.status(400).json({ mensagem: "OAB já cadastrada no sistema" });
            }
        }



        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const [user] = await knex("users").insert({

            user_type_id,
            name: nome,
            email,
            phone_number: telefone,
            password: senhaCriptografada,
            active: true,
            created_at: new Date(),
            updated_at: new Date()
        }).returning('user_id');

        if (!user) {
            return res.status(400).json({ mensagem: "Erro ao criar usuário" });
        }

        if (user_type_id === "53dfc840-502e-423a-b281-954dde752230") {
            await knex("users_documents").insert({
                user_id: user.user_id,
                document_type_id: "886b95e6-b4ed-42e8-8233-dbaa4714c2e8",
                document_number: oab,
                active: true,
                created_at: new Date(),
                updated_at: new Date()
            });
        }


        await knex("users_documents").insert({
            user_id: user.user_id,
            document_type_id: "9077d318-d943-4b7a-bfdd-035c85d347a3",
            document_number: cpf,
            active: true,
            created_at: new Date(),
            updated_at: new Date()
        });

        return res.status(200).json({ mensagem: "Usuário e documentos inseridos com sucesso" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: "Server error", error: error.message });
    }
};


module.exports = {
    registerUser
};