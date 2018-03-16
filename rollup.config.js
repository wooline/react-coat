import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import uglify from "rollup-plugin-uglify";
import tslint from "rollup-plugin-tslint";

const env = process.env.NODE_ENV;
const pkg = require("./package.json");
const externals = Object.keys(Object.assign({}, pkg.dependencies, pkg.glbDependencies));

const config = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true
  },
  external: id => {
    return externals.some(item => id.startsWith(item));
  },
  plugins: [
    resolve(),
    commonjs({ include: "node_modules/**" }),
    tslint(),
    typescript({
      rollupCommonJSResolveHack: true
    })
  ]
};

if (env === "production") {
  config.output.file = "dist/index.min.js";
  config.output.sourcemap = false;
  config.plugins.push(uglify());
}

export default config;
