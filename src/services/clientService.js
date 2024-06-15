const knex = require("../config/conexao");

async function registerCustomer(data) {
    const {
        user_id, profile_type_id, nome, email, razao_social, nome_fantasia, telefone,
        people_type_id, people_category_id, cpf, cnpj, rg, cep, state, city, neighborhood,
        street, number, nacionalidade, profissao, dataDeNascimento
    } = data;

    try {
        await knex.transaction(async trx => {
            console.log("Dados recebidos para registro:", data);

            if (!people_type_id) {
                throw new Error("O tipo de pessoa (people_type_id) é necessário.");
            }

            const peopleRecord = await trx("people").insert({
                user_id,
                profile_type_id,
                people_type_id,
                people_category_id,
                name: nome,
                email,
                phone_number: telefone,
                nacionalidade,
                profissao,
                date_of_birth: dataDeNascimento,
                active: true,
                created_at: new Date(),
                updated_at: new Date()
            }).returning('id');

            const peopleId = peopleRecord[0].id;
            console.log("People ID:", peopleId);

            let companyId = null;
            if (cnpj) {
                const companyRecord = await trx("customer_company").insert({
                    razao_social,
                    nome_fantasia,
                    people_id: peopleId,
                    created_at: new Date(),
                }).returning('id');
                companyId = companyRecord[0].id;
            }

            await trx("customer_addresses").insert({
                company_id: companyId,
                people_id: peopleId,
                cep,
                state,
                city,
                neighborhood,
                street,
                number,
                created_at: new Date(),
                updated_at: new Date()
            });

            if (rg) {
                await trx("customers_documents").insert({
                    people_id: peopleId,
                    document_type_id: "1fff4969-bcd1-4daa-9b9b-b88fc4c3b867",
                    document_number: rg,
                    active: true,
                    created_at: new Date()
                });
            }
            if (cnpj) {
                await trx("customers_documents").insert({
                    company_id: companyId,
                    document_type_id: "20f53e68-22c8-4f6b-9076-d3eb2364fe9f",
                    document_number: cnpj,
                    active: true,
                    created_at: new Date()
                });
            }
            await trx("customers_documents").insert({
                people_id: peopleId,
                document_type_id: "9077d318-d943-4b7a-bfdd-035c85d347a3",
                document_number: cpf,
                active: true,
                created_at: new Date()
            });

        });
        return { mensagem: "Cliente cadastrado com sucesso!" };
    } catch (error) {
        console.error("Erro ao cadastrar cliente:", error);
        throw new Error("Erro ao cadastrar cliente: " + error.message);
    }
}

module.exports = {
    registerCustomer
};
