const axios = require('axios');

async function consultarCNPJ(cnpj) {
    try {
        const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro na consulta do CNPJ:', error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = {
    consultarCNPJ
};
