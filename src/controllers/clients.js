const { registerCustomer } = require("../services/clientService");

const registerCustomerController = async (req, res) => {
    try {
        const user_id = req.usuarioLogado.user_id;
        const data = {...req.body, user_id};
        const client = await registerCustomer(data)
        res.status(200).json({ mensagem: "Cliente inseridos com sucesso", client });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Server error", error: error.message });
    }
};


module.exports = {
    registerCustomerController
};