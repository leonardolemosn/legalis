const knex = require("../config/conexao");

async function registerOffice({ cnpj, razao_social, nome_fantasia, cep, state, city, neighborhood, street, number, office_name, parent_office_id }) {
    const timestamp = new Date();
    let officeId = null;

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
            const [updatedOfficeId] = await trx("offices")
                .where({ office_id: cnpjExistente.office_id })
                .update(officeData)
                .returning('office_id');
            officeId = updatedOfficeId.office_id;
        } else {
            const [newOfficeId] = await trx("offices")
                .insert(officeData)
                .returning('office_id');
            officeId = newOfficeId.office_id;
        }

        if (!officeId) {
            throw new Error("Erro ao adicionar/atualizar empresa");
        }

        await trx("users_documents").insert({
            office_id: officeId,
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
            office_id: officeId,
            number,
            created_at: timestamp,
            updated_at: timestamp
        });
    });

    return officeId;
}

module.exports = {
    registerOffice
};
