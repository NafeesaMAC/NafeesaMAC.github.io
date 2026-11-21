// Local preview: builds in dev mode, serves dist/ and rebuilds when sources change.
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const ROOT = resolve('dist');
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.xml': 'application/xml',
  '.txt': 'text/plain', '.pdf': 'application/pdf', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

const build = () => spawnSync(process.execPath, ['build.mjs', '--dev'], { stdio: 'inherit' });
build();

let timer;
for (const target of ['build.mjs', 'lib', 'content', 'data', 'assets']) {
  watch(target, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = resolve(ROOT, '.' + path);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) {
      if (!path.endsWith('/')) return res.writeHead(301, { location: path + '/' }).end();
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
  }
}).listen(PORT, () => console.log(`Preview at http://localhost:${PORT}`));
