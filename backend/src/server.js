require('dotenv').config();
const app = require('./app');

if (!process.env.JWT_SECRET) {
  console.error('Defina JWT_SECRET no arquivo .env antes de iniciar a API.');
  process.exit(1);
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port} (documentação em /docs)`);
});
