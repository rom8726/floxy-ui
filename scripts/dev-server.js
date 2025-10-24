const { spawn } = require('child_process');
const path = require('path');

const serverProcess = spawn('npx', ['tsc', '-p', 'tsconfig.server.json', '--watch'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

serverProcess.on('close', (code) => {
  console.log(`TypeScript compilation process exited with code ${code}`);
});

// Start the compiled server
setTimeout(() => {
  const server = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}, 2000);
