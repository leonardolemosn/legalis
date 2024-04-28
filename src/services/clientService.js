const knex = require("../config/conexao");
require("dotenv").config();

async function registerCustomer({ user_id, profile_type_id, nome, email, razao_social, nome_fantasia, telefone, cpf, cnpj, rg, cep, state, city, neighborhood, street, number, estado_civil, nacionalidade, profissao, dataDeNascimento }) {

    await knex.transaction(async trx => {
        const pessoaExistente = await trx("customer_documents").where({ document_number: cpf }).first();
        if (pessoaExistente) {
            throw new Error("Usuário já cadastrado");
        }

        const validarTelefone = await trx("people").where({ phone_number: telefone }).first();
        if (validarTelefone) {
            throw new Error("Telefone informado já cadastrado");
        }

        const validarEmail = await trx("people").where({ email }).first();
        if (validarEmail) {
            throw new Error("Email informado já cadastrado");
        }

        const [people] = await trx("people").insert({
            user_id,
            name: nome,
            email,
            phone_number: telefone,
            nacionalidade,
            estado_civil,
            profissao,
            date_of_birth: dataDeNascimento,
            profile_type_id,
            active: true,
            created_at: new Date(),
            updated_at: new Date()
        }).returning('id');

        if (!people) {
            throw new Error("Erro ao cadastrar cliente");
        }

        let company = null;
        if (profile_type_id === "b12c7a51-f992-4067-895f-17ea018c3b92") {
            const companyResult = await trx("customer_company").insert({
                corporate_name: razao_social,
                trade_name: nome_fantasia,
                people_id: people,
                created_at: new Date()
            }).returning('id');

            company = companyResult.length > 0 ? companyResult[0] : null;
            if (!company) {
                throw new Error("Erro ao cadastrar empresa.");
            }
        }
        
        await trx("customer_addresses").insert({
            company_id: company,
            people_id: people,
            cep,
            state,
            city,
            neighborhood,
            street,
            number,
            created_at: new Date(),
            updated_at: new Date()
        });

        if (profile_type_id === "2bc770c0-f6ce-4948-b567-c1a3f37c82a7") {
            await trx("customer_documents").insert({
                people_id: people,
                document_type_id: "1fff4969-bcd1-4daa-9b9b-b88fc4c3b867",
                document_number: rg,
                active: true,
                created_at: new Date()
            });
        }

        if (profile_type_id === "b12c7a51-f992-4067-895f-17ea018c3b92") {
            await trx("customer_documents").insert({
                company_id: company,
                document_type_id: "20f53e68-22c8-4f6b-9076-d3eb2364fe9f",
                document_number: cnpj,
                active: true,
                created_at: new Date()
            });
        }

        await trx("customer_documents").insert({
            user_id: people,
            document_type_id: "9077d318-d943-4b7a-bfdd-035c85d347a3",
            document_number: cpf,
            active: true,
            created_at: new Date()
        });
    });
    return { mensagem: "Cliente cadastrado com sucesso!" };
}



module.exports = {
    registerCustomer
};