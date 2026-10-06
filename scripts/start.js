// Native Deno server: starting the assembly needs no package installation.
const root = new URL('../localhost/', import.meta.url);
const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', png: 'image/png', cur: 'image/x-icon' };
const clients = new Set();
export async function handler(request) {
  if (request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(request);
    socket.onopen = () => clients.add(socket);
    socket.onclose = () => clients.delete(socket);
    socket.onmessage = () => {
      for (const client of clients) {
        if (client !== socket && client.readyState === WebSocket.OPEN) client.send('message was received from a client');
      }
    };
    return response;
  }
  let path;
  try { path = decodeURIComponent(new URL(request.url).pathname); }
  catch { return new Response('Invalid path', { status: 400 }); }
  if (path.includes('..') || path.includes('\\')) return new Response('Forbidden', { status: 403 });
  const file = new URL(path === '/' ? 'client.html' : path.slice(1), root);
  if (!file.href.startsWith(root.href)) return new Response('Forbidden', { status: 403 });
  try {
    const body = await Deno.readFile(file);
    return new Response(request.method === 'HEAD' ? null : body, {
      headers: { 'content-type': types[file.pathname.split('.').pop()] || 'application/octet-stream' },
    });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound || error instanceof Deno.errors.IsADirectory) return new Response('Not found', { status: 404 });
    throw error;
  }
}
if (import.meta.main) {
  const port = Number(Deno.env.get('PORT') || 8080);
  Deno.serve({ hostname: '127.0.0.1', port, onListen: () => console.log(`Atomic Automata assembly: http://localhost:${port}`) }, handler);
}
