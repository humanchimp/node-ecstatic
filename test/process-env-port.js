const test = require('tap').test;
const request = require('request');
const spawn = require('child_process').spawn;

function getRandomInt(min, max) {
  return Math.floor((Math.random() * ((max - min) + 1))) + min;
}

const sanePort = getRandomInt(1025, 65536);
const floatingPointPort = 9090.86;
const insanePorts = [1023, 65537, Infinity, 'wow'];

function checkServerIsRunning(url, ps, t) {
  request(url, (err, res) => {
    if (!err && res.statusCode !== 500) {
      t.pass('a successful request from the server was made');
    } else {
      t.fail('the server could not be reached');
    }
    ps.kill('SIGTERM');
  });
}

function startServer(url, port, t) {
  t.plan(2);
  const strat = spawn(process.execPath, [`${__dirname}/../bin/strat.js`], {
    env: {
      PORT: String(port),
    },
  });

  strat.stdout.on('data', () => {
    t.pass('strat should be started');
    checkServerIsRunning(url, strat, t);
  });
}

test('sane port', (t) => {
  startServer(`http://127.0.0.1:${sanePort}`, sanePort, t);
});

test('floating point port', (t) => {
  startServer('http://127.0.0.1:9090', floatingPointPort, t);
});

insanePorts.forEach((port) => {
  test(`insane port: ${port}`, (t) => {
    startServer('http://127.0.0.1:8000', port, t);
  });
});

