/* this test suit is incomplete  2015-12-18 */

const test = require('tap').test;
const request = require('request');
const spawn = require('child_process').spawn;
const path = require('path');

const node = process.execPath;
const defaultUrl = 'http://localhost';
const defaultPort = 8000;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

function startstrat(args) {
  return spawn(node, [require.resolve('../bin/strat.js')].concat(args));
}

function checkServerIsRunning(url, t, _cb) {
  const cb = _cb || (() => {});

  request(url, (err, res) => {
    if (!err && res.statusCode !== 500) {
      t.pass('a successful request from the server was made');
      cb(null, res);
    } else {
      t.fail(`the server could not be reached @ ${url}`);
      cb(err);
    }
  });
}

function tearDown(ps, t) {
  t.tearDown(() => {
    ps.kill('SIGTERM');
  });
}

const getRandomPort = (() => {
  const usedPorts = [];
  return () => {
    const port = getRandomInt(1025, 65536);
    if (usedPorts.indexOf(port) > -1) {
      return getRandomPort();
    }

    usedPorts.push(port);
    return port;
  };
})();

test('setting port via cli - default port', (t) => {
  t.plan(2);

  const port = defaultPort;
  const options = ['.'];
  const strat = startstrat(options);

  tearDown(strat, t);

  strat.stdout.on('data', () => {
    t.pass('strat should be started');
    checkServerIsRunning(`${defaultUrl}:${port}`, t);
  });
});

test('setting port via cli - custom port', (t) => {
  t.plan(2);

  const port = getRandomPort();
  const options = ['.', '--port', port];
  const strat = startstrat(options);

  tearDown(strat, t);

  strat.stdout.on('data', () => {
    t.pass('strat should be started');
    checkServerIsRunning(`${defaultUrl}:${port}`, t);
  });
});

test('setting mimeTypes via cli - directly', (t) => {
  t.plan(3);
  const port = getRandomPort();
  const root = path.resolve(__dirname, 'public/');
  const mimeType = ['--mimeTypes', '{ "application/x-my-type": ["opml"] }'];
  const options = [root, '--port', port].concat(mimeType);

  const strat = startstrat(options);

  // TODO: remove error handler
  tearDown(strat, t);

  strat.stdout.on('data', () => {
    t.pass('strat should be started');
    checkServerIsRunning(`${defaultUrl}:${port}/custom_mime_type.opml`, t, (err, res) => {
      t.equal(res.headers['content-type'], 'application/x-my-type');
    });
  });
});
