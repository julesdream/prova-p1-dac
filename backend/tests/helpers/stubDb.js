const path = require('node:path');

// Substitui o módulo de conexão por um stub: os testes unitários nunca acessam o MySQL.
const dbPath = require.resolve(path.join(__dirname, '../../src/config/db.js'));

require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    query: async () => {
      throw new Error('Os testes unitários não devem acessar o banco de dados');
    },
  },
};
