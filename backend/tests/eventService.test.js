require('./helpers/stubDb');

const { test, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const eventModel = require('../src/models/eventModel');
const volunteerModel = require('../src/models/volunteerModel');
const eventService = require('../src/services/eventService');

const validEvent = {
  title: 'Mutirão',
  description: 'Limpeza',
  event_date: '2026-12-05',
  location: 'Parque',
  max_volunteers: 5,
};

afterEach(() => mock.restoreAll());

test('inscrição é feita quando há vagas', async () => {
  mock.method(eventModel, 'findById', async () => ({ id: 1, max_volunteers: 3, enrolled: 2 }));
  mock.method(volunteerModel, 'findById', async () => ({ id: 5 }));
  const addVolunteer = mock.method(eventModel, 'addVolunteer', async () => {});

  await eventService.registerVolunteer(1, 5);

  assert.deepEqual(addVolunteer.mock.calls[0].arguments, [1, 5]);
});

test('inscrição é bloqueada com 409 quando o evento está lotado', async () => {
  mock.method(eventModel, 'findById', async () => ({ id: 1, max_volunteers: 3, enrolled: 3 }));
  mock.method(volunteerModel, 'findById', async () => ({ id: 5 }));
  const addVolunteer = mock.method(eventModel, 'addVolunteer', async () => {});

  await assert.rejects(() => eventService.registerVolunteer(1, 5), {
    status: 409,
    message: 'Evento lotado',
  });
  assert.equal(addVolunteer.mock.callCount(), 0);
});

test('inscrição duplicada devolve 409', async () => {
  mock.method(eventModel, 'findById', async () => ({ id: 1, max_volunteers: 3, enrolled: 1 }));
  mock.method(volunteerModel, 'findById', async () => ({ id: 5 }));
  mock.method(eventModel, 'addVolunteer', async () => {
    throw Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' });
  });

  await assert.rejects(() => eventService.registerVolunteer(1, 5), {
    status: 409,
    message: 'Voluntário já inscrito neste evento',
  });
});

test('inscrição com evento ou voluntário inexistente devolve 404', async () => {
  mock.method(eventModel, 'findById', async () => undefined);
  await assert.rejects(() => eventService.registerVolunteer(1, 5), { status: 404 });

  mock.restoreAll();
  mock.method(eventModel, 'findById', async () => ({ id: 1, max_volunteers: 3, enrolled: 0 }));
  mock.method(volunteerModel, 'findById', async () => undefined);
  await assert.rejects(() => eventService.registerVolunteer(1, 99), { status: 404 });
});

test('cancelar inscrição inexistente devolve 404', async () => {
  mock.method(eventModel, 'findById', async () => ({ id: 1 }));
  mock.method(eventModel, 'removeVolunteer', async () => false);

  await assert.rejects(() => eventService.unregisterVolunteer(1, 5), { status: 404 });
});

test('criar evento valida os campos obrigatórios (400)', () => {
  assert.throws(() => eventService.create({ ...validEvent, title: '  ' }), { status: 400 });
  assert.throws(() => eventService.create({ ...validEvent, location: undefined }), { status: 400 });
  assert.throws(() => eventService.create({ ...validEvent, event_date: '2026-13-40' }), {
    status: 400,
  });
  assert.throws(() => eventService.create({ ...validEvent, max_volunteers: 0 }), { status: 400 });
});

test('criar evento usa 10 vagas por padrão e limpa os textos', async () => {
  const create = mock.method(eventModel, 'create', async (data) => data);

  await eventService.create({ title: '  Mutirão ', event_date: '2026-12-05', location: ' Parque ' });

  const saved = create.mock.calls[0].arguments[0];
  assert.equal(saved.max_volunteers, 10);
  assert.equal(saved.title, 'Mutirão');
  assert.equal(saved.location, 'Parque');
  assert.equal(saved.description, null);
});

test('atualizar não permite limite menor que o total de inscritos (409)', async () => {
  mock.method(eventModel, 'findById', async () => ({ id: 1, max_volunteers: 10, enrolled: 4 }));
  const update = mock.method(eventModel, 'update', async () => ({}));

  await assert.rejects(() => eventService.update(1, { ...validEvent, max_volunteers: 3 }), {
    status: 409,
  });
  assert.equal(update.mock.callCount(), 0);
});

test('atualizar com limite válido chama o model', async () => {
  mock.method(eventModel, 'findById', async () => ({ id: 1, max_volunteers: 10, enrolled: 4 }));
  const update = mock.method(eventModel, 'update', async () => ({}));

  await eventService.update(1, { ...validEvent, max_volunteers: 4 });

  assert.equal(update.mock.callCount(), 1);
});
