"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var appModule = require("./app");
exports.moduleGetter = (function (getter) {
    return getter;
})({
    app: function () {
        return appModule;
    },
});
