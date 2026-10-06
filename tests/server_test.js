import { handler } from '../scripts/start.js';

function assert(value, message) { if (!value) throw new Error(message); }
Deno.test('serves entry point and local UI module with browser MIME types', async () => {
  const page = await handler(new Request('http://localhost/'));
  assert(page.status === 200 && (await page.text()).includes('client.module.js'), 'entry point missing');
  const module = await handler(new Request('http://localhost/assembly-ui.js'));
  assert(module.headers.get('content-type') === 'text/javascript', 'module MIME type');
  assert((await module.text()).includes('setupAssemblyUI'), 'module missing');
});
Deno.test('rejects traversal and returns 404 for missing assets', async () => {
  for (const path of ['/%2e%2e%2fAGENTS.md', '/%5cAGENTS.md']) {
    assert((await handler(new Request(`http://localhost${path}`))).status === 403, 'traversal accepted');
  }
  assert((await handler(new Request('http://localhost/missing.js'))).status === 404, 'missing asset status');
});
