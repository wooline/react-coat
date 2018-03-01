import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
const pkg = require("./package.json");
const externals = Object.keys(pkg.dependencies);
externals.push("redux-saga/effects");

export default {
  input: "src/index.tsx",
  output: {
    file: "dist/index.js",
    format: "cjs"
  },
  external: externals,
  plugins: [
    resolve(),
    commonjs({ include: "node_modules/**" }),
    typescript({
      rollupCommonJSResolveHack: true
    })
  ]
};
