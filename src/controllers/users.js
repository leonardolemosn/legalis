const { registerUser, loginUser } = require("../services/userService");

const registerUserController = async (req, res) => {
    try {
        const user = await registerUser(req.body);
        res.status(200).json({ mensagem: "Usuário e documentos inseridos com sucesso", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Server error", error: error.message });
    }
};

const loginUserController = async (req, res) => {
    try {
        const login = await loginUser(req.body);
        res.status(200).json({ mensagem: "Usuário logado com sucesso", login})
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Server error", error: error.message })
    }
};

module.exports = {
    registerUserController,
    loginUserController
};

