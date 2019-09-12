import config from "./rollup.config";
import lope from ".";

export default {
  input: ["spec/**.spec.ts"],
  output: {
    format: "cjs",
    file: "test-dist/test.js",
    sourcemap: true,
  },
  plugins: [ ...config.plugins, lope()]
}
