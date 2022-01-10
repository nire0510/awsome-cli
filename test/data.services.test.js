
const fs = require('fs');

let data;

beforeAll(() => {
  data = JSON.parse(fs.readFileSync('./app/data/services.json'));
});

test('services file is a JSON object', () => {
  expect(typeof data).toBe('object');
});

test('services property is an array with at least 1 object', () => {
  expect(Array.isArray(data.services)).toBeTruthy();
  expect(data.services.length).toBeGreaterThan(0);
});

test('each service has a name and a queries array with at least 1 query', () => {
  expect(data.services.every((service) => service.name &&
    service.queries &&
    Array.isArray(service.queries) &&
    service.queries.length > 0)).toBeTruthy();
});

test('each service query has a description and a command', () => {
  expect(data.services.every((service) => service.queries.every((query) => query.description && query.command))).toBeTruthy();
});

test('each service query command starts with aws', () => {
  expect(data.services.every((service) => service.queries.every((query) => query.command.startsWith('aws ')))).toBeTruthy();
});

test('each service with variables has a variables array', () => {
  const queriesWithVariables = data.services.reduce((a, c) => a.concat(c.queries.filter((q) => /\{\w+\}/.test(q.command))), []);

  expect(queriesWithVariables.every((q) => Array.isArray(q.variables) && q.variables.length)).toBeTruthy();
});
