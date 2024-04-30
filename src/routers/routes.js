const express = require("express");
const cors = require("cors");
const routes = express();
const user = require("../controllers/users");
const validarBodyRequisicao = require("../middlewares/validarBodyRequisição");
const { validacaoCadastrarUsuario, validarLoginUsuario } = require("../scheme/validateRegisterUser");
const { validacaoCadastrarEmpresa } = require("../scheme/validateRegisterOffice");
const office = require("../controllers/enterprise");
const validarAutenticacao = require("../middlewares/validateJwtAuthentication.js");
const customer = require("../controllers/clients");



routes.use(cors());

routes.post("/register/user", validarBodyRequisicao(validacaoCadastrarUsuario),user.registerUserController);
routes.post("/validate-cnpj-cep", office.validateCNPJ_CEP);
routes.post("/register-office", validarBodyRequisicao(validacaoCadastrarEmpresa), office.registerCompanyController);
routes.post("/login-user", validarBodyRequisicao(validarLoginUsuario),user.loginUserController)

routes.post("/register/customer", validarAutenticacao, customer.registerCustomerController)

module.exports = routes;