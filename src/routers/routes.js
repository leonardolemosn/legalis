const express = require("express");
const cors = require("cors");
const routes = express();
const user = require("../controllers/users");
const validarBodyRequisicao = require("../middlewares/validarBodyRequisição");
const validateRegisterUser = require("../scheme/validateRegisterUser");



routes.use(cors());

routes.post("/register/user", validarBodyRequisicao(validateRegisterUser),user.registerUser);

module.exports = routes;