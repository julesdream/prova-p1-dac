/**
 * Teste automático de todas as rotas da API em execução.
 * Uso: com o back-end rodando, execute `npm run test:api` (opcional: API_URL=http://host:porta).
 * Os dados criados durante o teste são removidos no final, então o script pode ser repetido.
 */
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const unique = Date.now();

let passed = 0;
let failed = 0;

/**
 * Envia uma requisição para a API.
 * @param {string} method - GET, POST, PUT ou DELETE.
 * @param {string} path - Caminho da rota.
 * @param {{token?: string, body?: object}} [options]
 * @returns {Promise<{status: number, data: any}>}
 */
async function call(method, path, { token, body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

/**
 * Compara o status obtido com o esperado e registra o resultado.
 * @param {string} description - O que está sendo testado.
 * @param {{status: number, data: any}} response
 * @param {number} expectedStatus
 * @returns {{status: number, data: any}} A mesma resposta, para reaproveitar os dados.
 */
function expectStatus(description, response, expectedStatus) {
  const ok = response.status === expectedStatus;
  if (ok) passed += 1;
  else failed += 1;
  const detail = ok ? '' : ` (esperado ${expectedStatus}, recebido ${response.status})`;
  console.log(`${ok ? '✅' : '❌'} ${description} -> ${response.status}${detail}`);
  return response;
}

/** @param {string} title */
function section(title) {
  console.log(`\n=== ${title} ===`);
}

async function testAuth() {
  section('AUTH');
  expectStatus('GET / (API no ar)', await call('GET', '/'), 200);

  const admin = expectStatus(
    'POST /auth/login admin',
    await call('POST', '/auth/login', { body: { email: 'admin@ifrs.edu.br', password: '123456' } }),
    200,
  );
  const user = expectStatus(
    'POST /auth/login usuário comum',
    await call('POST', '/auth/login', { body: { email: 'user@ifrs.edu.br', password: '123456' } }),
    200,
  );
  expectStatus(
    'POST /auth/login senha errada',
    await call('POST', '/auth/login', { body: { email: 'admin@ifrs.edu.br', password: 'x' } }),
    401,
  );
  expectStatus('POST /auth/login sem dados', await call('POST', '/auth/login'), 400);

  const email = `teste${unique}@ifrs.edu.br`;
  expectStatus(
    'POST /auth/register novo usuário',
    await call('POST', '/auth/register', { body: { email, password: 'senha123' } }),
    201,
  );
  expectStatus(
    'POST /auth/register e-mail repetido',
    await call('POST', '/auth/register', { body: { email, password: 'senha123' } }),
    409,
  );
  expectStatus(
    'POST /auth/register senha curta',
    await call('POST', '/auth/register', { body: { email: `b${email}`, password: '123' } }),
    400,
  );

  return { adminToken: admin.data?.token, userToken: user.data?.token };
}

/** @param {{adminToken: string, userToken: string}} tokens */
async function testDashboard({ adminToken }) {
  section('DASHBOARD');
  expectStatus('GET /dashboard sem token', await call('GET', '/dashboard'), 401);
  expectStatus(
    'GET /dashboard token inválido',
    await call('GET', '/dashboard', { token: 'token-falso' }),
    401,
  );
  expectStatus('GET /dashboard com token', await call('GET', '/dashboard', { token: adminToken }), 200);
}

/**
 * @param {{adminToken: string, userToken: string}} tokens
 * @returns {Promise<number|undefined>} Id do voluntário criado.
 */
async function testVolunteers({ adminToken, userToken }) {
  section('VOLUNTÁRIOS');
  const email = `voluntario${unique}@email.com`;
  const valid = { name: 'Voluntário de Teste', email, phone: '54999990000' };

  expectStatus('GET /volunteers', await call('GET', '/volunteers', { token: adminToken }), 200);
  expectStatus('GET /volunteers sem token', await call('GET', '/volunteers'), 401);
  expectStatus(
    'POST /volunteers como user (proibido)',
    await call('POST', '/volunteers', { token: userToken, body: valid }),
    403,
  );
  expectStatus(
    'POST /volunteers e-mail inválido',
    await call('POST', '/volunteers', { token: adminToken, body: { name: 'X', email: 'ruim' } }),
    400,
  );

  const created = expectStatus(
    'POST /volunteers como admin',
    await call('POST', '/volunteers', { token: adminToken, body: valid }),
    201,
  );
  expectStatus(
    'POST /volunteers e-mail repetido',
    await call('POST', '/volunteers', { token: adminToken, body: valid }),
    409,
  );

  const id = created.data?.id;
  expectStatus('GET /volunteers/:id', await call('GET', `/volunteers/${id}`, { token: adminToken }), 200);
  expectStatus(
    'GET /volunteers/999999',
    await call('GET', '/volunteers/999999', { token: adminToken }),
    404,
  );
  expectStatus(
    'PUT /volunteers/:id',
    await call('PUT', `/volunteers/${id}`, {
      token: adminToken,
      body: { ...valid, name: 'Voluntário Atualizado' },
    }),
    200,
  );
  return id;
}

/**
 * @param {{adminToken: string, userToken: string}} tokens
 * @returns {Promise<number|undefined>} Id do evento criado (com apenas 1 vaga).
 */
async function testEvents({ adminToken, userToken }) {
  section('EVENTOS');
  const valid = {
    title: `Evento de Teste ${unique}`,
    description: 'Criado pelo script de teste',
    event_date: '2026-12-15',
    location: 'Ginásio',
    max_volunteers: 1,
  };

  expectStatus('GET /events', await call('GET', '/events', { token: adminToken }), 200);
  expectStatus('GET /events sem token', await call('GET', '/events'), 401);
  expectStatus(
    'POST /events como user (proibido)',
    await call('POST', '/events', { token: userToken, body: valid }),
    403,
  );
  expectStatus(
    'POST /events dados faltando',
    await call('POST', '/events', { token: adminToken, body: { description: 'sem título' } }),
    400,
  );
  expectStatus(
    'POST /events data inválida',
    await call('POST', '/events', {
      token: adminToken,
      body: { ...valid, event_date: '31/12/2026' },
    }),
    400,
  );

  const created = expectStatus(
    'POST /events como admin',
    await call('POST', '/events', { token: adminToken, body: valid }),
    201,
  );
  const id = created.data?.id;
  expectStatus('GET /events/:id', await call('GET', `/events/${id}`, { token: adminToken }), 200);
  expectStatus('GET /events/999999', await call('GET', '/events/999999', { token: adminToken }), 404);
  expectStatus(
    'PUT /events/:id',
    await call('PUT', `/events/${id}`, {
      token: adminToken,
      body: { ...valid, title: 'Evento Atualizado' },
    }),
    200,
  );
  return id;
}

/**
 * Testa as inscrições, incluindo a regra de limite de vagas (evento com 1 vaga).
 * @param {{adminToken: string, userToken: string}} tokens
 * @param {number} eventId
 * @param {number} volunteerId
 * @returns {Promise<number|undefined>} Id de um segundo voluntário criado só para o teste de lotação.
 */
async function testEnrollments({ adminToken, userToken }, eventId, volunteerId) {
  section('INSCRIÇÕES (regra de vagas)');
  const enrollPath = `/events/${eventId}/volunteers`;

  expectStatus(
    'POST inscrever voluntário (1ª vaga)',
    await call('POST', enrollPath, { token: userToken, body: { volunteer_id: volunteerId } }),
    201,
  );
  expectStatus(
    'POST inscrever o mesmo voluntário de novo',
    await call('POST', enrollPath, { token: userToken, body: { volunteer_id: volunteerId } }),
    409,
  );

  const second = await call('POST', '/volunteers', {
    token: adminToken,
    body: { name: 'Segundo Voluntário', email: `segundo${unique}@email.com` },
  });
  expectStatus(
    'POST inscrever em evento lotado',
    await call('POST', enrollPath, { token: userToken, body: { volunteer_id: second.data?.id } }),
    409,
  );
  expectStatus(
    'POST inscrever voluntário inexistente',
    await call('POST', enrollPath, { token: userToken, body: { volunteer_id: 999999 } }),
    404,
  );

  const listed = expectStatus('GET inscritos do evento', await call('GET', enrollPath, { token: adminToken }), 200);
  expectStatus('Evento tem exatamente 1 inscrito', { status: listed.data?.length === 1 ? 200 : 0 }, 200);
  expectStatus(
    'DELETE cancelar inscrição como user (proibido)',
    await call('DELETE', `${enrollPath}/${volunteerId}`, { token: userToken }),
    403,
  );
  return second.data?.id;
}

/**
 * Remove tudo o que o teste criou e confirma que sumiu.
 * @param {{adminToken: string}} tokens
 * @param {{eventId: number, volunteerIds: number[]}} created
 */
async function cleanUp({ adminToken }, { eventId, volunteerIds }) {
  section('LIMPEZA (DELETE)');
  expectStatus(
    'DELETE cancelar inscrição como admin',
    await call('DELETE', `/events/${eventId}/volunteers/${volunteerIds[0]}`, { token: adminToken }),
    204,
  );
  for (const id of volunteerIds) {
    expectStatus(`DELETE /volunteers/${id}`, await call('DELETE', `/volunteers/${id}`, { token: adminToken }), 204);
  }
  expectStatus(`DELETE /events/${eventId}`, await call('DELETE', `/events/${eventId}`, { token: adminToken }), 204);
  expectStatus('GET evento excluído', await call('GET', `/events/${eventId}`, { token: adminToken }), 404);
}

async function main() {
  console.log(`Testando a API em ${BASE_URL}`);
  const tokens = await testAuth();
  if (!tokens.adminToken || !tokens.userToken) {
    console.log('\nNão foi possível obter os tokens. Verifique se o banco foi populado (script.sql).');
    process.exit(1);
  }

  await testDashboard(tokens);
  const volunteerId = await testVolunteers(tokens);
  const eventId = await testEvents(tokens);
  const secondVolunteerId = await testEnrollments(tokens, eventId, volunteerId);
  await cleanUp(tokens, { eventId, volunteerIds: [volunteerId, secondVolunteerId] });

  console.log(`\nResultado: ${passed} passaram, ${failed} falharam.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`\n❌ Não foi possível falar com a API em ${BASE_URL}: ${err.message}`);
  console.error('O back-end está rodando? (npm run dev)');
  process.exit(1);
});
