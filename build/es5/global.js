export function isModuleState(module) {
    return module.isModule;
}
export var LOADING = "LOADING";
export var ERROR = "@@framework/ERROR";
export var INIT = "INIT";
export var LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
export var NSP = "/";
export var MetaData = {
    isBrowser: typeof window === "object",
    isDev: process.env.NODE_ENV !== "production",
    actionCreatorMap: {},
    clientStore: null,
    appModuleName: null,
};
export function isPromise(data) {
    return typeof data["then"] === "function";
}
export function errorAction(error) {
    return {
        type: ERROR,
        error: error,
    };
}
export function setAppModuleName(moduleName) {
    MetaData.appModuleName = moduleName;
}
export function delayPromise(second) {
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
export function getModuleActionCreatorList(namespace) {
    if (MetaData.actionCreatorMap[namespace]) {
        return MetaData.actionCreatorMap[namespace];
    }
    else {
        var obj = {};
        MetaData.actionCreatorMap[namespace] = obj;
        return obj;
    }
}
export function exportModule(namespace) {
    var actions = getModuleActionCreatorList(namespace);
    return {
        namespace: namespace,
        actions: actions,
    };
}
export function warning() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (MetaData.isDev) {
        console.warn.apply(console, args);
    }
}
