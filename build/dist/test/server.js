"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("index");
var names_1 = require("./modules/names");
var modules_1 = require("./modules");
function render(path) {
    return index_1.renderApp(modules_1.moduleGetter, names_1.ModuleNames.app, [path]);
}
exports.default = render;
