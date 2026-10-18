const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  req.body ??= {}; // Express 5 deixa req.body indefinido quando a requisição não tem corpo
  next();
});

app.get('/', (_req, res) => res.json({ message: 'API de Voluntariado IFRS', docs: '/docs' }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/events', eventRoutes);
app.use('/volunteers', volunteerRoutes);

app.use(errorHandler);

module.exports = app;
