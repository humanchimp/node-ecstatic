import packageJson from "./package.json";
import json from "rollup-plugin-json";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

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
    plugins: [json(), commonjs(), resolve()]
  },
  {
    input: "src/bin.js",
    output: {
      format: "cjs",
      file: 'bin/lib.js',
      sourcemap: true
    },
    plugins: [json(), commonjs(), resolve()]
  }
];
