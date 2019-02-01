"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isModuleState(module) {
    return module.isModule;
}
exports.isModuleState = isModuleState;
exports.LOADING = "LOADING";
exports.ERROR = "@@framework/ERROR";
exports.INIT = "INIT";
exports.LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
exports.VIEW_INVALID = "@@framework/VIEW_INVALID";
exports.NSP = "/";
exports.MetaData = {
    isBrowser: typeof window === "object",
    isDev: process.env.NODE_ENV !== "production",
    actionCreatorMap: {},
    clientStore: null,
    appModuleName: null,
};
function isPromise(data) {
    return typeof data["then"] === "function";
}
exports.isPromise = isPromise;
function errorAction(error) {
    return {
        type: exports.ERROR,
        error: error,
    };
}
exports.errorAction = errorAction;
function viewInvalidAction(currentViews) {
    return {
        type: exports.VIEW_INVALID,
        currentViews: currentViews,
    };
}
exports.viewInvalidAction = viewInvalidAction;
function setAppModuleName(moduleName) {
    exports.MetaData.appModuleName = moduleName;
}
exports.setAppModuleName = setAppModuleName;
function delayPromise(second) {
    return function (target, propertyKey, descriptor) {
        var fun = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var delay = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(true);
                }, second * 1000);
            });
            return Promise.all([delay, fun.apply(target, args)]).then(function (items) {
                return items[1];
            });
        };
    };
}
exports.delayPromise = delayPromise;
function getModuleActionCreatorList(namespace) {
    if (exports.MetaData.actionCreatorMap[namespace]) {
        return exports.MetaData.actionCreatorMap[namespace];
    }
    else {
        var obj = {};
        exports.MetaData.actionCreatorMap[namespace] = obj;
        return obj;
    }
}
exports.getModuleActionCreatorList = getModuleActionCreatorList;
function exportModule(namespace) {
    var actions = getModuleActionCreatorList(namespace);
    return {
        namespace: namespace,
        actions: actions,
    };
}
exports.exportModule = exportModule;
function warning() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (exports.MetaData.isDev) {
        console.warn.apply(console, args);
    }
}
exports.warning = warning;
