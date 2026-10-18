const router = require('express').Router();
const controller = require('../controllers/volunteerController');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * @openapi
 * /volunteers:
 *   get:
 *     summary: Lista todos os voluntários
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de voluntários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Volunteer'
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/', authenticate, controller.list);

/**
 * @openapi
 * /volunteers/{id}:
 *   get:
 *     summary: Busca um voluntário pelo id
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: O voluntário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Volunteer'
 *       404:
 *         description: Voluntário não encontrado
 */
router.get('/:id', authenticate, controller.getOne);

/**
 * @openapi
 * /volunteers:
 *   post:
 *     summary: Cadastra um voluntário (somente admin)
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VolunteerInput'
 *     responses:
 *       201:
 *         description: Voluntário criado
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Usuário não é admin
 *       409:
 *         description: E-mail já cadastrado
 */
router.post('/', authenticate, authorize('admin'), controller.create);

/**
 * @openapi
 * /volunteers/{id}:
 *   put:
 *     summary: Atualiza um voluntário (somente admin)
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VolunteerInput'
 *     responses:
 *       200:
 *         description: Voluntário atualizado
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Usuário não é admin
 *       404:
 *         description: Voluntário não encontrado
 */
router.put('/:id', authenticate, authorize('admin'), controller.update);

/**
 * @openapi
 * /volunteers/{id}:
 *   delete:
 *     summary: Exclui um voluntário (somente admin)
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Voluntário excluído
 *       403:
 *         description: Usuário não é admin
 *       404:
 *         description: Voluntário não encontrado
 */
router.delete('/:id', authenticate, authorize('admin'), controller.remove);

module.exports = router;
