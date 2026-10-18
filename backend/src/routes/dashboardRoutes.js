const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

/**
 * @openapi
 * /dashboard:
 *   get:
 *     summary: Resumo do sistema (rota protegida)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Totais de eventos e voluntários
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/', authenticate, controller.show);

module.exports = router;
