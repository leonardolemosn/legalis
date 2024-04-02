const axios = require('axios');

async function consultarCEP(cep) {
    try {
        const url = `https://brasilapi.com.br/api/cep/v1/${cep}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro na consulta do CEP:', error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = {
    consultarCEP
};
