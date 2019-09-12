import packageJson from "./package.json";
import json from "rollup-plugin-json";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import { builtinModules } from "module";

const plugins = [json(), commonjs(), resolve()];
const external = [].concat(
  builtinModules,
  Object.keys(packageJson.dependencies),
  Object.keys(packageJson.devDependencies)
);

export default [
  {
    input: "src/lib.js",
    output: [
      {
        format: "cjs",
        file: packageJson.main,
        sourcemap: true
      },
      {
        format: "esm",
        file: packageJson.module,
        sourcemap: true
      }
    ],
    plugins,
    external
  },
  {
    input: "src/bin.js",
    output: {
      format: "cjs",
      file: "dist/bin/lib.js",
      sourcemap: true
    },
    plugins,
    external
  }
];
