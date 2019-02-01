const chalk = require("chalk");
const childProcess = require("child_process");
const fs = require("fs-extra");

function spawn(command, args, errorMessage) {
  const isWindows = process.platform === "win32"; // spawn with {shell: true} can solve .cmd resolving, but prettier doesn't run correctly on mac/linux
  const result = childProcess.spawnSync(isWindows ? `${command}.cmd` : command, args, {stdio: "inherit"});
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(chalk`{red.bold ${errorMessage}}`);
    console.error(`non-zero exit code returned, code=${result.status}, command=${command} ${args.join(" ")}`);
    process.exit(1);
  }
}

// function checkCodeStyle() {
//   console.info(chalk`{green.bold [task]} {white.bold check code style}`);
//   return spawn("prettier", ["--config", "webpack/prettier.json", "--list-different", "src/**/*.{ts,tsx,less}"], "check code style failed, please format above files");
// }

function lint() {
  console.info(chalk`{green.bold [task]} {white.bold lint}`);
  return spawn("tslint", ["-c", "tslint.json", "src/**/*.{ts,tsx}"], "lint failed, please fix");
}

function cleanup() {
  console.info(chalk`{green.bold [task]} {white.bold cleanup}`);
  fs.emptyDirSync("build");
}

function test() {
  console.info(chalk`{green.bold [task]} {white.bold test}`);
  return spawn("jest", [], "test failed, please fix");
}

function compile() {
  console.info(chalk`{green.bold [task]} {white.bold compile}`);
  spawn("tsc", ["-p", "tsconfig.build.json", "-target", "ES5", "-outDir", "build/dist", "-module", "CommonJs"], "compile failed, please fix");
  console.info(chalk`{green.bold [task]} {white.bold compile es5}`);
  spawn("tsc", ["-p", "tsconfig.build.json", "-target", "ES5", "-outDir", "build/es5"], "compile failed, please fix");
  console.info(chalk`{green.bold [task]} {white.bold compile es6}`);
  spawn("tsc", ["-p", "tsconfig.build.json", "-target", "ES6", "-outDir", "build/es6"], "compile failed, please fix");
}

function build() {
  cleanup();
  test();
  lint();
  compile();
}

build();
