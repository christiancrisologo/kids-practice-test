import { spawn } from 'child_process';

const COUNT = process.env.COUNT || '100';
const IDLE_MS = parseInt(process.env.IDLE_MS || '5000', 10);

const bin = './node_modules/.bin/tsx';
const args = ['scripts/test-generate-math.ts'];

const child = spawn(bin, args, {
  env: { ...process.env, COUNT },
  stdio: ['ignore', 'pipe', 'pipe']
});

let lastActivity = Date.now();
let lastUsingTemplate: string | null = null;
let lastQLine: string | null = null;

function checkIdle() {
  const now = Date.now();
  if (now - lastActivity > IDLE_MS) {
    console.error(`\nNo output for ${IDLE_MS}ms — terminating child process`);
    if (lastQLine) console.error('Last question line seen:', lastQLine);
    if (lastUsingTemplate) console.error('Last template used:', lastUsingTemplate);
    child.kill('SIGTERM');
    clearInterval(idleInterval);
  }
}

const idleInterval = setInterval(checkIdle, 500);

function handleData(chunk: Buffer) {
  const text = chunk.toString();
  process.stdout.write(text);
  lastActivity = Date.now();

  // split into lines and inspect
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith('[MathGen] using template')) {
      lastUsingTemplate = line;
    }
    const qMatch = line.match(/^\[Q(\d+)\]/);
    if (qMatch) {
      lastQLine = line;
    }
    if (line.startsWith('Generated')) {
      // finished normally, clear interval
      clearInterval(idleInterval);
    }
  }
}

child.stdout.on('data', handleData);
child.stderr.on('data', (c) => {
  const text = c.toString();
  process.stderr.write(text);
  lastActivity = Date.now();
});

child.on('exit', (code, signal) => {
  clearInterval(idleInterval);
  console.log(`\nChild exited with code=${code} signal=${signal}`);
  if (signal === 'SIGTERM') {
    console.log('Process was terminated due to inactivity.');
  }
});
