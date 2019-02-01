export function isModuleState(module) {
    return module.isModule;
}
export const LOADING = "LOADING";
export const ERROR = "@@framework/ERROR";
export const INIT = "INIT";
export const LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
export const VIEW_INVALID = "@@framework/VIEW_INVALID";
export const NSP = "/";
export const MetaData = {
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
        error,
    };
}
export function viewInvalidAction(currentViews) {
    return {
        type: VIEW_INVALID,
        currentViews,
    };
}
export function setAppModuleName(moduleName) {
    MetaData.appModuleName = moduleName;
}
export function delayPromise(second) {
    return (target, propertyKey, descriptor) => {
        const fun = descriptor.value;
        descriptor.value = (...args) => {
            const delay = new Promise(resolve => {
                setTimeout(() => {
                    resolve(true);
                }, second * 1000);
            });
            return Promise.all([delay, fun.apply(target, args)]).then(items => {
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
        const obj = {};
        MetaData.actionCreatorMap[namespace] = obj;
        return obj;
    }
}
export function exportModule(namespace) {
    const actions = getModuleActionCreatorList(namespace);
    return {
        namespace,
        actions,
    };
}
export function warning(...args) {
    if (MetaData.isDev) {
        console.warn(...args);
    }
}
