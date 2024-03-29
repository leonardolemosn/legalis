const puppeteer = require('puppeteer');

async function consultaOAB(nome, numeroInscricao) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://cna.oab.org.br/', { waitUntil: 'networkidle0' });
        await page.type('#txtName', nome);
        await page.type('#txtInsc', numeroInscricao);
        await page.click('#btnFind');

        try {
            await page.waitForSelector('.rowName > span:last-child', { visible: true, timeout: 10000 }); // tempo reduzido para teste
            const resultadoNome = await page.evaluate(() => document.querySelector('.rowName > span:last-child').innerText);
            return resultadoNome; // Ou retornar resultadoNome ou outro dado relevante
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.log('Advogado não encontrado.');
                return false; // Indica que o advogado não foi encontrado
            } else {
                throw error; // Outros erros são relançados
            }
        }
    } catch (error) {
        console.error('Erro durante a consulta da OAB:', error);
        throw error; // Relança o erro para tratamento externo
    } finally {
        await browser.close();
    }
}



module.exports = {
    consultaOAB
};