require('./helpers/stubDb');
process.env.JWT_SECRET = 'segredo-de-teste';

const { test, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const userModel = require('../src/models/userModel');
const authService = require('../src/services/authService');
const { hashPassword } = require('../src/utils/password');

afterEach(() => mock.restoreAll());

test('login devolve um token com payload { email, role }', async () => {
  const password = await hashPassword('123456');
  mock.method(userModel, 'findByEmail', async () => ({
    id: 1,
    email: 'admin@ifrs.edu.br',
    password,
    role: 'admin',
  }));

  const { token } = await authService.login('admin@ifrs.edu.br', '123456');
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  assert.equal(payload.email, 'admin@ifrs.edu.br');
  assert.equal(payload.role, 'admin');
});

test('login rejeita senha errada com 401', async () => {
  const password = await hashPassword('123456');
  mock.method(userModel, 'findByEmail', async () => ({ email: 'a@a.com', password, role: 'user' }));

  await assert.rejects(() => authService.login('a@a.com', 'errada'), { status: 401 });
});

test('login rejeita usuário inexistente com 401', async () => {
  mock.method(userModel, 'findByEmail', async () => undefined);

  await assert.rejects(() => authService.login('x@x.com', '123456'), { status: 401 });
});

test('login exige email e password (400)', async () => {
  await assert.rejects(() => authService.login('', ''), { status: 400 });
  await assert.rejects(() => authService.login('a@a.com'), { status: 400 });
});

test('register grava a senha com hash e role "user"', async () => {
  mock.method(userModel, 'findByEmail', async () => undefined);
  const create = mock.method(userModel, 'create', async (data) => ({ id: 9, ...data }));

  await authService.register('novo@ifrs.edu.br', 'senha123');

  const saved = create.mock.calls[0].arguments[0];
  assert.equal(saved.role, 'user');
  assert.notEqual(saved.password, 'senha123');
  assert.ok(saved.password.includes(':'));
});

test('register valida e-mail e tamanho da senha (400)', async () => {
  await assert.rejects(() => authService.register('invalido', 'senha123'), { status: 400 });
  await assert.rejects(() => authService.register('a@a.com', '123'), { status: 400 });
});

test('register rejeita e-mail já cadastrado com 409', async () => {
  mock.method(userModel, 'findByEmail', async () => ({ id: 1 }));

  await assert.rejects(() => authService.register('a@a.com', 'senha123'), { status: 409 });
});
