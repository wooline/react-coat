"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var connected_react_router_1 = require("connected-react-router");
var redux_1 = require("redux");
var global_1 = require("./global");
var invalidViewTimer;
function checkInvalidview() {
    invalidViewTimer = null;
    var currentViews = global_1.MetaData.clientStore.reactCoat.currentViews;
    var views = {};
    for (var moduleName in currentViews) {
        if (currentViews.hasOwnProperty(moduleName)) {
            var element = currentViews[moduleName];
            for (var viewname in element) {
                if (element[viewname]) {
                    if (!views[moduleName]) {
                        views[moduleName] = {};
                    }
                    views[moduleName][viewname] = element[viewname];
                }
            }
        }
    }
    global_1.MetaData.clientStore.dispatch(global_1.viewInvalidAction(views));
}
function invalidview() {
    if (!invalidViewTimer) {
        invalidViewTimer = setTimeout(checkInvalidview, 4);
    }
}
exports.invalidview = invalidview;
function getActionData(action) {
    var arr = Object.keys(action).filter(function (key) { return key !== "type" && key !== "priority" && key !== "time"; });
    if (arr.length === 0) {
        return undefined;
    }
    else if (arr.length === 1) {
        return action[arr[0]];
    }
    else {
        var data = tslib_1.__assign({}, action);
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
        var keys1 = Object.keys(obj1);
        var keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        else {
            for (var _i = 0, keys1_1 = keys1; _i < keys1_1.length; _i++) {
                var key = keys1_1[_i];
                if (!simpleEqual(obj1[key], obj2[key])) {
                    return false;
                }
            }
            return true;
        }
    }
}
function buildStore(storeHistory, reducersMapObject, storeMiddlewares, storeEnhancers, initData, routerParser) {
    if (reducersMapObject === void 0) { reducersMapObject = {}; }
    if (storeMiddlewares === void 0) { storeMiddlewares = []; }
    if (storeEnhancers === void 0) { storeEnhancers = []; }
    if (initData === void 0) { initData = {}; }
    var store;
    var combineReducers = function (rootState, action) {
        if (!store) {
            return rootState;
        }
        var reactCoat = store.reactCoat;
        reactCoat.prevState = rootState;
        var currentState = tslib_1.__assign({}, rootState);
        reactCoat.currentState = currentState;
        if (!currentState.views) {
            currentState.views = {};
        }
        Object.keys(reducersMapObject).forEach(function (namespace) {
            currentState[namespace] = reducersMapObject[namespace](currentState[namespace], action);
            if (namespace === "router" && routerParser && rootState.router !== currentState.router) {
                currentState.router = routerParser(currentState.router, rootState.router);
            }
        });
        if (action.type === global_1.VIEW_INVALID) {
            var views = getActionData(action);
            if (!simpleEqual(currentState.views, views)) {
                currentState.views = views;
            }
        }
        var handlersCommon = reactCoat.reducerMap[action.type] || {};
        var handlersEvery = reactCoat.reducerMap[action.type.replace(new RegExp("[^" + global_1.NSP + "]+"), "*")] || {};
        var handlers = tslib_1.__assign({}, handlersCommon, handlersEvery);
        var handlerModules = Object.keys(handlers);
        if (handlerModules.length > 0) {
            var orderList_1 = action.priority ? action.priority.slice() : [];
            handlerModules.forEach(function (namespace) {
                var fun = handlers[namespace];
                if (fun.__isHandler__) {
                    orderList_1.push(namespace);
                }
                else {
                    orderList_1.unshift(namespace);
                }
            });
            var moduleNameMap_1 = {};
            orderList_1.forEach(function (namespace) {
                if (!moduleNameMap_1[namespace]) {
                    moduleNameMap_1[namespace] = true;
                    var fun = handlers[namespace];
                    currentState[namespace] = fun(getActionData(action));
                }
            });
        }
        var changed = Object.keys(rootState).length !== Object.keys(currentState).length || Object.keys(rootState).some(function (namespace) { return rootState[namespace] !== currentState[namespace]; });
        reactCoat.prevState = changed ? currentState : rootState;
        return reactCoat.prevState;
    };
    var effectMiddleware = function (_a) {
        var dispatch = _a.dispatch;
        return function (next) { return function (originalAction) {
            if (!global_1.MetaData.isBrowser) {
                if (originalAction.type.split(global_1.NSP)[1] === global_1.LOADING) {
                    return originalAction;
                }
            }
            if (originalAction.type === global_1.LOCATION_CHANGE) {
                if (!store.reactCoat.routerInited) {
                    store.reactCoat.routerInited = true;
                    return originalAction;
                }
                else {
                    invalidview();
                }
            }
            var action = next(originalAction);
            if (!action) {
                return null;
            }
            var handlersCommon = store.reactCoat.effectMap[action.type] || {};
            var handlersEvery = store.reactCoat.effectMap[action.type.replace(new RegExp("[^" + global_1.NSP + "]+"), "*")] || {};
            var handlers = tslib_1.__assign({}, handlersCommon, handlersEvery);
            var handlerModules = Object.keys(handlers);
            if (handlerModules.length > 0) {
                var orderList_2 = action.priority ? action.priority.slice() : [];
                handlerModules.forEach(function (namespace) {
                    var fun = handlers[namespace];
                    if (fun.__isHandler__) {
                        orderList_2.push(namespace);
                    }
                    else {
                        orderList_2.unshift(namespace);
                    }
                });
                var moduleNameMap_2 = {};
                var promiseResults_1 = [];
                orderList_2.forEach(function (namespace) {
                    if (!moduleNameMap_2[namespace]) {
                        moduleNameMap_2[namespace] = true;
                        var fun_1 = handlers[namespace];
                        var effectResult_1 = fun_1(getActionData(action));
                        var decorators_1 = fun_1.__decorators__;
                        if (decorators_1) {
                            var results_1 = [];
                            decorators_1.forEach(function (decorator, index) {
                                results_1[index] = decorator[0](action, namespace, effectResult_1);
                            });
                            fun_1.__decoratorResults__ = results_1;
                        }
                        effectResult_1.then(function (reslove) {
                            if (decorators_1) {
                                var results_2 = fun_1.__decoratorResults__ || [];
                                decorators_1.forEach(function (decorator, index) {
                                    if (decorator[1]) {
                                        decorator[1]("Resolved", results_2[index], reslove);
                                    }
                                });
                                fun_1.__decoratorResults__ = undefined;
                            }
                            return reslove;
                        }, function (reject) {
                            if (decorators_1) {
                                var results_3 = fun_1.__decoratorResults__ || [];
                                decorators_1.forEach(function (decorator, index) {
                                    if (decorator[1]) {
                                        decorator[1]("Rejected", results_3[index], reject);
                                    }
                                });
                                fun_1.__decoratorResults__ = undefined;
                            }
                        });
                        promiseResults_1.push(effectResult_1);
                    }
                });
                if (promiseResults_1.length) {
                    return Promise.all(promiseResults_1);
                }
            }
            return action;
        }; };
    };
    if (reducersMapObject.router) {
        throw new Error("the reducer name 'router' is not allowed");
    }
    reducersMapObject.router = connected_react_router_1.connectRouter(storeHistory);
    var enhancers = [redux_1.applyMiddleware.apply(void 0, [effectMiddleware, connected_react_router_1.routerMiddleware(storeHistory)].concat(storeMiddlewares))].concat(storeEnhancers);
    if (global_1.MetaData.isBrowser && global_1.MetaData.isDev && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
        enhancers.push(window["__REDUX_DEVTOOLS_EXTENSION__"](window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"]));
    }
    store = redux_1.createStore(combineReducers, initData, redux_1.compose.apply(void 0, enhancers));
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
    global_1.MetaData.clientStore = store;
    if (global_1.MetaData.isBrowser) {
        window.onerror = function (evt, source, fileno, columnNumber, error) {
            store.dispatch(global_1.errorAction(error || evt));
        };
        if ("onunhandledrejection" in window) {
            window.onunhandledrejection = function (error) {
                store.dispatch(global_1.errorAction(error.reason));
            };
        }
    }
    return store;
}
exports.buildStore = buildStore;
