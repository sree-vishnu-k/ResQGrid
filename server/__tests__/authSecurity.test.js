const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../index');
const { users, seed } = require('../dataAccess');

let server;
let baseUrl;

test.before(async () => {
  await seed();
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function api(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

test('1. Unauthenticated request to protected route returns 401 (No guest bypass)', async () => {
  const res = await api('/api/habitations');
  assert.strictEqual(res.status, 401, 'Protected route must reject request with no token');
  assert.strictEqual(res.data.success, false);
});

test('2. Demo credentials endpoint does not leak passwords', async () => {
  const res = await api('/api/auth/demo');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.data.accounts, [], 'Demo accounts must be empty when ALLOW_DEMO_LOGIN is disabled');
});

test('3. New user registration sets status to pending', async () => {
  const testEmail = `applicant_${Date.now()}@ResQGrid.gov.in`;
  const regRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Officer',
      email: testEmail,
      password: 'StrongPassword@123',
      role: 'field_officer',
      designation: 'Sub Inspector',
      district: 'Wayanad',
    }),
  });

  assert.strictEqual(regRes.status, 201);
  assert.strictEqual(regRes.data.success, true);
  assert.strictEqual(regRes.data.user.status, 'pending');

  // Attempt login before approval
  const loginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'StrongPassword@123',
    }),
  });

  assert.strictEqual(loginRes.status, 403, 'Pending user must not be allowed to log in');
  assert.match(loginRes.data.message, /pending/i);

  // Admin logs in
  const adminLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@ResQGrid.gov.in',
      password: 'Admin@12345',
    }),
  });
  assert.strictEqual(adminLogin.status, 200);
  const adminToken = adminLogin.data.token;

  // Admin approves the user
  const approveRes = await api(`/api/users/${regRes.data.user.id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(approveRes.status, 200);
  assert.strictEqual(approveRes.data.success, true);

  // User logs in again after approval
  const postApprovalLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'StrongPassword@123',
    }),
  });

  assert.strictEqual(postApprovalLogin.status, 200, 'Approved user must be able to log in');
  assert.ok(postApprovalLogin.data.token, 'Token must be issued');
});
