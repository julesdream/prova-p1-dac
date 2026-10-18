const router = require('express').Router();
const authController = require('../controllers/authController');

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@ifrs.edu.br
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado. O token contém o payload { email, role }.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Dados ausentes
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Cadastra um novo usuário comum (role "user")
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: novo@ifrs.edu.br
 *               password:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: E-mail inválido ou senha com menos de 6 caracteres
 *       409:
 *         description: E-mail já cadastrado
 */
router.post('/register', authController.register);

module.exports = router;
