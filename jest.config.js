module.exports = {
  roots: ["<rootDir>/test"],
  testRegex: "\\.test\\.tsx?$",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsConfig: "./tsconfig.jest.json",
      diagnostics: true,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  moduleDirectories: ["node_modules", "src"],
  setupFiles: ["./test/setup.js"],
  testURL: "http://localhost/",
};
