"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("index");
var names_1 = require("./modules/names");
var modules_1 = require("./modules");
index_1.buildApp(modules_1.moduleGetter, names_1.ModuleNames.app);
