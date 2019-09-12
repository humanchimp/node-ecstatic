import defaults from "./strat/defaults.json";
import strat from "..";
import http from "http";
import minimist from "minimist";
import aliases from "./strat/aliases";

const opts = minimist(process.argv.slice(2), {
  alias: aliases,
  default: defaults,
  boolean: Object.keys(defaults).filter(
    key => typeof defaults[key] === "boolean"
  )
});
const envPORT = parseInt(process.env.PORT, 10);
const port =
  envPORT > 1024 && envPORT <= 65536 ? envPORT : opts.port || opts.p || 8000;
const host = process.env.HOST || opts.host || "0.0.0.0";
const dir = opts.root || opts._[0] || process.cwd();

if (opts.help || opts.h) {
  console.error("usage: strat [dir] {options} --port PORT");
  console.error("see https://npm.im/strat for more docs");
} else {
  const server = http.createServer(strat(dir, opts)).listen(port, host, () => {
    const bind = server.address();
    console.log(`strat serving ${dir} at http://${bind.address}:${bind.port}`);
  });
}
