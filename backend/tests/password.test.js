const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('../src/utils/password');

test('o hash não contém a senha em texto puro', async () => {
  const hash = await hashPassword('123456');
  assert.ok(!hash.includes('123456'));
});

test('a mesma senha gera hashes diferentes (salt aleatório)', async () => {
  assert.notEqual(await hashPassword('123456'), await hashPassword('123456'));
});

test('verifyPassword aceita a senha correta', async () => {
  const hash = await hashPassword('minha-senha');
  assert.equal(await verifyPassword('minha-senha', hash), true);
});

test('verifyPassword rejeita senha errada', async () => {
  const hash = await hashPassword('minha-senha');
  assert.equal(await verifyPassword('outra-senha', hash), false);
});

test('verifyPassword rejeita valores armazenados malformados', async () => {
  assert.equal(await verifyPassword('123456', '123456'), false);
  assert.equal(await verifyPassword('123456', ''), false);
  assert.equal(await verifyPassword('123456', undefined), false);
});
