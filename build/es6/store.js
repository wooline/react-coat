import { connectRouter, routerMiddleware } from "connected-react-router";
import { applyMiddleware, compose, createStore } from "redux";
import { LOADING, LOCATION_CHANGE, MetaData, NSP, errorAction, viewInvalidAction, VIEW_INVALID } from "./global";
let invalidViewTimer;
function checkInvalidview() {
    invalidViewTimer = null;
    const currentViews = MetaData.clientStore.reactCoat.currentViews;
    const views = {};
    for (const moduleName in currentViews) {
        if (currentViews.hasOwnProperty(moduleName)) {
            const element = currentViews[moduleName];
            for (const viewname in element) {
                if (element[viewname]) {
                    if (!views[moduleName]) {
                        views[moduleName] = {};
                    }
                    views[moduleName][viewname] = element[viewname];
                }
            }
        }
    }
    MetaData.clientStore.dispatch(viewInvalidAction(views));
}
export function invalidview() {
    if (!invalidViewTimer) {
        invalidViewTimer = setTimeout(checkInvalidview, 4);
    }
}
function getActionData(action) {
    const arr = Object.keys(action).filter(key => key !== "type" && key !== "priority" && key !== "time");
    if (arr.length === 0) {
        return undefined;
    }
    else if (arr.length === 1) {
        return action[arr[0]];
    }
    else {
        const data = Object.assign({}, action);
        delete data["type"];
        delete data["priority"];
        delete data["time"];
        return data;
    }
}
function simpleEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }
    else if (typeof obj1 !== typeof obj2 || typeof obj1 !== "object") {
        return false;
    }
    else {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        else {
            for (const key of keys1) {
                if (!simpleEqual(obj1[key], obj2[key])) {
                    return false;
                }
            }
            return true;
        }
    }
}
export function buildStore(storeHistory, reducersMapObject = {}, storeMiddlewares = [], storeEnhancers = [], initData = {}, routerParser) {
    let store;
    const combineReducers = (rootState, action) => {
        if (!store) {
            return rootState;
        }
        const reactCoat = store.reactCoat;
        reactCoat.prevState = rootState;
        const currentState = Object.assign({}, rootState);
        reactCoat.currentState = currentState;
        if (!currentState.views) {
            currentState.views = {};
        }
        Object.keys(reducersMapObject).forEach(namespace => {
            currentState[namespace] = reducersMapObject[namespace](currentState[namespace], action);
            if (namespace === "router" && routerParser && rootState.router !== currentState.router) {
                currentState.router = routerParser(currentState.router, rootState.router);
            }
        });
        if (action.type === VIEW_INVALID) {
            const views = getActionData(action);
            if (!simpleEqual(currentState.views, views)) {
                currentState.views = views;
            }
        }
        const handlersCommon = reactCoat.reducerMap[action.type] || {};
        const handlersEvery = reactCoat.reducerMap[action.type.replace(new RegExp(`[^${NSP}]+`), "*")] || {};
        const handlers = Object.assign({}, handlersCommon, handlersEvery);
        const handlerModules = Object.keys(handlers);
        if (handlerModules.length > 0) {
            const orderList = action.priority ? [...action.priority] : [];
            handlerModules.forEach(namespace => {
                const fun = handlers[namespace];
                if (fun.__isHandler__) {
                    orderList.push(namespace);
                }
                else {
                    orderList.unshift(namespace);
                }
            });
            const moduleNameMap = {};
            orderList.forEach(namespace => {
                if (!moduleNameMap[namespace]) {
                    moduleNameMap[namespace] = true;
                    const fun = handlers[namespace];
                    currentState[namespace] = fun(getActionData(action));
                }
            });
        }
        const changed = Object.keys(rootState).length !== Object.keys(currentState).length || Object.keys(rootState).some(namespace => rootState[namespace] !== currentState[namespace]);
        reactCoat.prevState = changed ? currentState : rootState;
        return reactCoat.prevState;
    };
    const effectMiddleware = ({ dispatch }) => (next) => (originalAction) => {
        if (!MetaData.isBrowser) {
            if (originalAction.type.split(NSP)[1] === LOADING) {
                return originalAction;
            }
        }
        if (originalAction.type === LOCATION_CHANGE) {
            if (!store.reactCoat.routerInited) {
                store.reactCoat.routerInited = true;
                return originalAction;
            }
            else {
                invalidview();
            }
        }
        const action = next(originalAction);
        if (!action) {
            return null;
        }
        const handlersCommon = store.reactCoat.effectMap[action.type] || {};
        const handlersEvery = store.reactCoat.effectMap[action.type.replace(new RegExp(`[^${NSP}]+`), "*")] || {};
        const handlers = Object.assign({}, handlersCommon, handlersEvery);
        const handlerModules = Object.keys(handlers);
        if (handlerModules.length > 0) {
            const orderList = action.priority ? [...action.priority] : [];
            handlerModules.forEach(namespace => {
                const fun = handlers[namespace];
                if (fun.__isHandler__) {
                    orderList.push(namespace);
                }
                else {
                    orderList.unshift(namespace);
                }
            });
            const moduleNameMap = {};
            const promiseResults = [];
            orderList.forEach(namespace => {
                if (!moduleNameMap[namespace]) {
                    moduleNameMap[namespace] = true;
                    const fun = handlers[namespace];
                    const effectResult = fun(getActionData(action));
                    const decorators = fun.__decorators__;
                    if (decorators) {
                        const results = [];
                        decorators.forEach((decorator, index) => {
                            results[index] = decorator[0](action, namespace, effectResult);
                        });
                        fun.__decoratorResults__ = results;
                    }
                    effectResult.then((reslove) => {
                        if (decorators) {
                            const results = fun.__decoratorResults__ || [];
                            decorators.forEach((decorator, index) => {
                                if (decorator[1]) {
                                    decorator[1]("Resolved", results[index], reslove);
                                }
                            });
                            fun.__decoratorResults__ = undefined;
                        }
                        return reslove;
                    }, (reject) => {
                        if (decorators) {
                            const results = fun.__decoratorResults__ || [];
                            decorators.forEach((decorator, index) => {
                                if (decorator[1]) {
                                    decorator[1]("Rejected", results[index], reject);
                                }
                            });
                            fun.__decoratorResults__ = undefined;
                        }
                    });
                    promiseResults.push(effectResult);
                }
            });
            if (promiseResults.length) {
                return Promise.all(promiseResults);
            }
        }
        return action;
    };
    if (reducersMapObject.router) {
        throw new Error("the reducer name 'router' is not allowed");
    }
    reducersMapObject.router = connectRouter(storeHistory);
    const enhancers = [applyMiddleware(...[effectMiddleware, routerMiddleware(storeHistory), ...storeMiddlewares]), ...storeEnhancers];
    if (MetaData.isBrowser && MetaData.isDev && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
        enhancers.push(window["__REDUX_DEVTOOLS_EXTENSION__"](window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"]));
    }
    store = createStore(combineReducers, initData, compose(...enhancers));
    if (store.reactCoat) {
        throw new Error("store enhancers has 'reactCoat' property");
    }
    else {
        store.reactCoat = {
            history: storeHistory,
            prevState: { router: null },
            currentState: { router: null },
            reducerMap: {},
            effectMap: {},
            injectedModules: {},
            routerInited: false,
            currentViews: {},
        };
    }
    MetaData.clientStore = store;
    if (MetaData.isBrowser) {
        window.onerror = (evt, source, fileno, columnNumber, error) => {
            store.dispatch(errorAction(error || evt));
        };
        if ("onunhandledrejection" in window) {
            window.onunhandledrejection = error => {
                store.dispatch(errorAction(error.reason));
            };
        }
    }
    return store;
}
