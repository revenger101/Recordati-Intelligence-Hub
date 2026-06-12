const { spawn } = require('child_process');
const fs = require('fs');
const log = fs.createWriteStream('c:/Users/USER/Desktop/PFE BA/Project 2/web/server_error.log');

const server = spawn('node', ['server.js'], {
  cwd: 'c:/Users/USER/Desktop/PFE BA/Project 2/web'
});

server.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  log.write(`stdout: ${data}\n`);
});

server.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
  log.write(`stderr: ${data}\n`);
});

server.on('close', (code) => {
  log.write(`child process exited with code ${code}\n`);
});
