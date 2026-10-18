process.env.JWT_SECRET = 'segredo-de-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { authenticate, authorize } = require('../src/middlewares/auth');

const sign = (payload, options) => jwt.sign(payload, process.env.JWT_SECRET, options);
const requestWith = (authorization) => ({ headers: authorization ? { authorization } : {} });

test('authenticate rejeita requisição sem token (401)', () => {
  assert.throws(() => authenticate(requestWith(), {}, () => {}), { status: 401 });
});

test('authenticate rejeita token inválido (401)', () => {
  assert.throws(() => authenticate(requestWith('Bearer abc.def.ghi'), {}, () => {}), {
    status: 401,
  });
});

test('authenticate rejeita token assinado com outro segredo (401)', () => {
  const forged = jwt.sign({ email: 'a@a.com', role: 'admin' }, 'outro-segredo');
  assert.throws(() => authenticate(requestWith(`Bearer ${forged}`), {}, () => {}), {
    status: 401,
  });
});

test('authenticate rejeita token expirado (401)', () => {
  const expired = sign({ email: 'a@a.com', role: 'user' }, { expiresIn: -10 });
  assert.throws(() => authenticate(requestWith(`Bearer ${expired}`), {}, () => {}), {
    status: 401,
  });
});

test('authenticate aceita token válido e preenche req.user', () => {
  const token = sign({ email: 'a@a.com', role: 'user' }, { expiresIn: '1h' });
  const req = requestWith(`Bearer ${token}`);
  let called = false;

  authenticate(req, {}, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.user.email, 'a@a.com');
  assert.equal(req.user.role, 'user');
});

test('authorize("admin") bloqueia usuário comum (403) e libera admin', () => {
  const guard = authorize('admin');

  assert.throws(() => guard({ user: { role: 'user' } }, {}, () => {}), { status: 403 });

  let called = false;
  guard({ user: { role: 'admin' } }, {}, () => {
    called = true;
  });
  assert.equal(called, true);
});
