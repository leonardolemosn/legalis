const bcrypt = require('bcrypt');
const knex = require("../config/conexao");
const { consultaOAB } = require("./oabValidate");
require("dotenv").config();
const jwt = require('jsonwebtoken');

async function registerUser({ user_type_id, nome, email, telefone, senha, oab, cpf, office_id }) {
    const usuarioExistente = await knex("users_documents").where({ document_number: cpf }).first();

    if (usuarioExistente) { 
        throw new Error("Usuário já cadastrado");
    }

    const validarTelefone = await knex("users").where({ phone_number: telefone }).first();

    if (validarTelefone) {
        throw new Error("Telefone informado já cadastrado");
    }

    const validarEmail = await knex("users").where({ email }).first();

    if (validarEmail) {
        throw new Error("Email informado já cadastrado");
    }

    const userType = await knex("users_types").where({ user_type_id: user_type_id }).first();

    if (!userType) {
        throw new Error("Tipo de usuário não encontrado");
    }

    if (oab) {
        const numerosOAB = oab.match(/\d+/g).join('');
        const oabResult = await consultaOAB(nome, numerosOAB);
        if (!oabResult) {
            throw new Error("Advogado não encontrado");
        }

        const nomeSemAcento = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const oabResultSemAcento = oabResult.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (oabResultSemAcento !== nomeSemAcento) {
            throw new Error("OAB não corresponde ao advogado informado");
        }

        const validarOAB = await knex("users_documents").where({ document_number: oab });
        if (validarOAB.length > 0) {
            throw new Error("OAB já cadastrada");
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
        throw new Error("Erro ao cadastrar usuário");
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

    if (office_id) {
        await knex("user_office").insert({
            user_id: user.user_id,
            office_id
        })
    }

    return { mensagem: "Usuário cadastrado com sucesso!" };
}


async function loginUser({ email, senha }) {
    const processandoLogin = await knex("users").where({ email }).first();

    if (!processandoLogin || !(await bcrypt.compare(senha, processandoLogin.password))) {
        throw new Error("Usuário ou senha incorretos");
    }
    const jwtPassword = process.env.JWT_SECRET;
    const token = jwt.sign({ id: processandoLogin.user_id }, jwtPassword, {
        expiresIn: "7d",
    });

    return { token };
}


module.exports = {
    registerUser,
    loginUser
};
