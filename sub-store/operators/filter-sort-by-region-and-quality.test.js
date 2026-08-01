const assert = require('node:assert/strict');
const test = require('node:test');

const { canonicalConnectionJson, operator } = require('./filter-sort-by-region-and-quality');

function proxy(name, overrides = {}) {
  return {
    name,
    type: 'ss',
    server: 'edge.example.com',
    port: 443,
    cipher: 'aes-128-gcm',
    password: 'secret',
    ...overrides,
  };
}

test('removes aliases with identical connection parameters', async () => {
  const result = await operator([
    proxy('PH 01'),
    proxy('PH 03', { _provider: 'runtime-only' }),
  ]);

  assert.deepEqual(result.map((item) => item.name), ['PH 01']);
});

test('retains nodes when a connection parameter differs', async () => {
  const result = await operator([
    proxy('US node'),
    proxy('US node', { port: 8443 }),
    proxy('US node', { password: 'different' }),
  ]);

  assert.deepEqual(result.map((item) => item.name), ['US node', 'US node #2', 'US node #3']);
});

test('uses the port hopping range as the durable connection identity', async () => {
  const first = proxy('hy2-a', {
    type: 'hysteria2',
    port: 20001,
    ports: '20000-20100',
  });
  const second = { ...first, name: 'hy2-b', port: 20099 };

  assert.equal(canonicalConnectionJson(first, true), canonicalConnectionJson(second, true));
  assert.equal((await operator([first, second])).length, 1);
});
