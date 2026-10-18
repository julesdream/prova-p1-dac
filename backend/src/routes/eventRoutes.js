const router = require('express').Router();
const controller = require('../controllers/eventController');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * @openapi
 * /events:
 *   get:
 *     summary: Lista todos os eventos
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos (com o total de inscritos em "enrolled")
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/', authenticate, controller.list);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Busca um evento pelo id
 *     tags: [Events]
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
 *         description: O evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento não encontrado
 */
router.get('/:id', authenticate, controller.getOne);

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Cadastra um novo evento (somente admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       201:
 *         description: Evento criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário não é admin
 */
router.post('/', authenticate, authorize('admin'), controller.create);

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     summary: Atualiza um evento (somente admin)
 *     tags: [Events]
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
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       200:
 *         description: Evento atualizado
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Usuário não é admin
 *       404:
 *         description: Evento não encontrado
 *       409:
 *         description: Limite de vagas menor que o total de inscritos
 */
router.put('/:id', authenticate, authorize('admin'), controller.update);

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Exclui um evento (somente admin)
 *     tags: [Events]
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
 *         description: Evento excluído
 *       403:
 *         description: Usuário não é admin
 *       404:
 *         description: Evento não encontrado
 */
router.delete('/:id', authenticate, authorize('admin'), controller.remove);

/**
 * @openapi
 * /events/{id}/volunteers:
 *   get:
 *     summary: Lista os voluntários inscritos em um evento
 *     tags: [Events]
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
 *         description: Voluntários inscritos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Volunteer'
 *       404:
 *         description: Evento não encontrado
 */
router.get('/:id/volunteers', authenticate, controller.listVolunteers);

/**
 * @openapi
 * /events/{id}/volunteers:
 *   post:
 *     summary: Inscreve um voluntário em um evento (respeita o limite de vagas)
 *     tags: [Events]
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
 *             type: object
 *             required: [volunteer_id]
 *             properties:
 *               volunteer_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Voluntário inscrito
 *       404:
 *         description: Evento ou voluntário não encontrado
 *       409:
 *         description: Evento lotado ou voluntário já inscrito
 */
router.post('/:id/volunteers', authenticate, controller.registerVolunteer);

/**
 * @openapi
 * /events/{id}/volunteers/{volunteerId}:
 *   delete:
 *     summary: Cancela a inscrição de um voluntário (somente admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: volunteerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Inscrição cancelada
 *       403:
 *         description: Usuário não é admin
 *       404:
 *         description: Evento ou inscrição não encontrada
 */
router.delete(
  '/:id/volunteers/:volunteerId',
  authenticate,
  authorize('admin'),
  controller.unregisterVolunteer,
);

module.exports = router;
