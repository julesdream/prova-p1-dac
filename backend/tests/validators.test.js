const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseId, isValidEmail, isValidDate, cleanText } = require('../src/utils/validators');

test('parseId converte inteiros positivos', () => {
  assert.equal(parseId('7'), 7);
  assert.equal(parseId(3), 3);
});

test('parseId rejeita valores inválidos com 400', () => {
  for (const value of ['abc', '0', '-1', '1.5', undefined, null]) {
    assert.throws(() => parseId(value), { status: 400, message: 'id inválido' });
  }
});

test('isValidEmail', () => {
  assert.equal(isValidEmail('ana@email.com'), true);
  assert.equal(isValidEmail('ana@email'), false);
  assert.equal(isValidEmail('ana email@x.com'), false);
  assert.equal(isValidEmail(undefined), false);
});

test('isValidDate aceita apenas datas reais AAAA-MM-DD', () => {
  assert.equal(isValidDate('2026-12-15'), true);
  assert.equal(isValidDate('2026-02-30'), false);
  assert.equal(isValidDate('15/12/2026'), false);
  assert.equal(isValidDate(20261215), false);
});

test('cleanText remove espaços e ignora não-textos', () => {
  assert.equal(cleanText('  oi  '), 'oi');
  assert.equal(cleanText(undefined), '');
  assert.equal(cleanText(42), '');
});
