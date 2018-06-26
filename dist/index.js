'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var reactRedux = require('react-redux');
var ReactDOM = _interopDefault(require('react-dom'));
var reactRouterDom = require('react-router-dom');
var connectedReactRouter = require('connected-react-router');
var redux = require('redux');
var effects = require('redux-saga/effects');
var createSagaMiddleware = require('redux-saga');
var createSagaMiddleware__default = _interopDefault(createSagaMiddleware);
var createHistory = _interopDefault(require('history/createBrowserHistory'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

var ERROR_ACTION_NAME = "@@framework/ERROR";
var LOADING_ACTION_NAME = "LOADING";
var INIT_MODULE_ACTION_NAME = "INIT";
var INIT_LOCATION_ACTION_NAME = "@@router/LOCATION_CHANGE";
var LOCATION_CHANGE_ACTION_NAME = "@@router/LOCATION_CHANGE";
var NSP = "/";
function errorAction(error) {
    return {
        type: ERROR_ACTION_NAME,
        error: error,
    };
}
function initLocationAction(namespace, payload) {
    return {
        type: namespace + NSP + INIT_LOCATION_ACTION_NAME,
        payload: payload,
    };
}

var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            message: "",
        };
        return _this;
    }
    Component.prototype.render = function () {
        if (this.state.message) {
            return React.createElement("div", null,
                "failed to render, error: ",
                this.state.message);
        }
        return this.props.children;
    };
    Component.prototype.componentDidCatch = function (error) {
        this.setState({ message: error.message });
        this.props.dispatch(errorAction(error));
    };
    return Component;
}(React.PureComponent));
var mapDispatchToProps = function (dispatch) {
    return {
        dispatch: dispatch,
    };
};
var ErrorBoundary = reactRedux.connect(null, mapDispatchToProps)(Component);

function buildApp(view, container, storeMiddlewares, storeEnhancers, store, history) {
    var WithRouter = reactRouterDom.withRouter(view);
    ReactDOM.render(React.createElement(reactRedux.Provider, { store: store },
        React.createElement(ErrorBoundary, null,
            React.createElement(connectedReactRouter.ConnectedRouter, { history: history },
                React.createElement(WithRouter, null)))), document.getElementById(container));
}

function emptyObject(obj) {
    var arr = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            arr.push(key);
        }
    }
    arr.forEach(function (key) {
        delete obj[key];
    });
    return obj;
}
function findIndexInArray(arr, fun) {
    for (var i = 0, k = arr.length; i < k; i++) {
        if (fun(arr[i])) {
            return i;
        }
    }
    return -1;
}
var TaskCountEvent = "TaskCountEvent";
var PEvent = /** @class */ (function () {
    function PEvent(name, data, bubbling) {
        if (bubbling === void 0) { bubbling = false; }
        this.name = name;
        this.data = data;
        this.bubbling = bubbling;
    }
    PEvent.prototype.setTarget = function (target) {
        this.target = target;
    };
    PEvent.prototype.setCurrentTarget = function (target) {
        this.currentTarget = target;
    };
    return PEvent;
}());
var PDispatcher = /** @class */ (function () {
    function PDispatcher(parent) {
        this.parent = parent;
        this.storeHandlers = {};
    }
    PDispatcher.prototype.addListener = function (ename, handler) {
        var dictionary = this.storeHandlers[ename];
        if (!dictionary) {
            this.storeHandlers[ename] = dictionary = [];
        }
        dictionary.push(handler);
        return this;
    };
    PDispatcher.prototype.removeListener = function (ename, handler) {
        if (!ename) {
            emptyObject(this.storeHandlers);
        }
        else {
            var handlers = this.storeHandlers;
            if (handlers.propertyIsEnumerable(ename)) {
                var dictionary = handlers[ename];
                if (!handler) {
                    delete handlers[ename];
                }
                else {
                    var n = dictionary.indexOf(handler);
                    if (n > -1) {
                        dictionary.splice(n, 1);
                    }
                    if (dictionary.length === 0) {
                        delete handlers[ename];
                    }
                }
            }
        }
        return this;
    };
    PDispatcher.prototype.dispatch = function (evt) {
        if (!evt.target) {
            evt.setTarget(this);
        }
        evt.setCurrentTarget(this);
        var dictionary = this.storeHandlers[evt.name];
        if (dictionary) {
            for (var i = 0, k = dictionary.length; i < k; i++) {
                dictionary[i](evt);
            }
        }
        if (this.parent && evt.bubbling) {
            this.parent.dispatch(evt);
        }
        return this;
    };
    PDispatcher.prototype.setParent = function (parent) {
        this.parent = parent;
        return this;
    };
    return PDispatcher;
}());
var TaskCounter = /** @class */ (function (_super) {
    __extends(TaskCounter, _super);
    function TaskCounter(deferSecond) {
        var _this = _super.call(this) || this;
        _this.deferSecond = deferSecond;
        _this.list = [];
        return _this;
    }
    TaskCounter.prototype.addItem = function (promise, note) {
        var _this = this;
        if (note === void 0) { note = ""; }
        if (!this.list.some(function (item) { return item.promise === promise; })) {
            this.list.push({ promise: promise, note: note });
            promise.then(function (value) { return _this.completeItem(promise); }, function (reason) { return _this.completeItem(promise); });
            if (this.list.length === 1) {
                this.dispatch(new PEvent(TaskCountEvent, "Start"));
                this.ctimer = window.setTimeout(function () {
                    _this.ctimer = 0;
                    if (_this.list.length > 0) {
                        _this.dispatch(new PEvent(TaskCountEvent, "Depth"));
                    }
                }, this.deferSecond * 1000);
            }
        }
        return promise;
    };
    TaskCounter.prototype.completeItem = function (promise) {
        var i = findIndexInArray(this.list, function (item) { return item.promise === promise; });
        if (i > -1) {
            this.list.splice(i, 1);
            if (this.list.length === 0) {
                if (this.ctimer) {
                    clearTimeout(this.ctimer);
                    this.ctimer = 0;
                }
                this.dispatch(new PEvent(TaskCountEvent, "Stop"));
            }
        }
        return this;
    };
    return TaskCounter;
}(PDispatcher));

var prevRootState = {};
var singleStore;
var sagasMap = {};
var reducersMap = {};
var sagaNames = [];
function getActionData(action) {
    var arr = Object.keys(action).filter(function (key) { return key !== "type"; });
    if (arr.length === 0) {
        return undefined;
    }
    else if (arr.length === 1) {
        return action[arr[0]];
    }
    else {
        var data = __assign({}, action);
        delete data["type"];
        return data;
    }
}
function reducer(state, action) {
    if (state === void 0) { state = {}; }
    // if (action.type === LOCATION_CHANGE_ACTION_NAME) {
    //   lastLocationAction = getActionData(action);
    // }
    var item = reducersMap[action.type];
    if (item && singleStore) {
        var rootState_1 = prevRootState;
        var newState_1 = __assign({}, state);
        Object.keys(item).forEach(function (namespace) {
            var fun = item[namespace];
            var decorators = fun["__decorators__"];
            if (decorators) {
                decorators.forEach(function (decorator) {
                    decorator[2] = decorator[0](action.type, namespace);
                });
            }
            newState_1[namespace] = fun.call(fun["__host__"], { payload: getActionData(action), moduleState: state[namespace], rootState: rootState_1 });
            if (action.type === namespace + NSP + INIT_MODULE_ACTION_NAME) {
                // 对模块补发一次locationChange
                setTimeout(function () {
                    if (singleStore) {
                        singleStore.dispatch(initLocationAction(namespace, rootState_1.router));
                    }
                }, 0);
            }
            if (decorators) {
                decorators.forEach(function (decorator) {
                    decorator[1](decorator[2], newState_1[namespace]);
                    decorator[2] = null;
                });
            }
        });
        return newState_1;
    }
    return state;
}
function sagaHandler(action) {
    var item, rootState, arr, _loop_1, _i, arr_1, moduleName;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                item = sagasMap[action.type];
                if (!(item && singleStore)) return [3 /*break*/, 4];
                rootState = prevRootState;
                arr = Object.keys(item);
                _loop_1 = function (moduleName) {
                    var fun, state, decorators, err, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                fun = item[moduleName];
                                state = rootState.project[moduleName];
                                decorators = fun["__decorators__"];
                                if (decorators) {
                                    decorators.forEach(function (decorator) {
                                        decorator[2] = decorator[0](action.type, moduleName);
                                    });
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [5 /*yield**/, __values(fun.call(fun["__host__"], { payload: getActionData(action), moduleState: state, rootState: rootState }))];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _a.sent();
                                err = error_1;
                                return [3 /*break*/, 4];
                            case 4:
                                if (!err) return [3 /*break*/, 6];
                                return [4 /*yield*/, effects.put(errorAction(err))];
                            case 5:
                                _a.sent();
                                _a.label = 6;
                            case 6:
                                if (decorators) {
                                    decorators.forEach(function (decorator) {
                                        decorator[1](decorator[2], err);
                                        decorator[2] = null;
                                    });
                                }
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, arr_1 = arr;
                _a.label = 1;
            case 1:
                if (!(_i < arr_1.length)) return [3 /*break*/, 4];
                moduleName = arr_1[_i];
                return [5 /*yield**/, _loop_1(moduleName)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
function saga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects.takeEvery(sagaNames, sagaHandler)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function rootReducer(combineReducer) {
    return function (state, action) {
        prevRootState = state || {};
        return combineReducer(state, action);
    };
}
function buildStore(storeHistory, reducers, storeMiddlewares, storeEnhancers, injectedModules) {
    var devtools = function (options) { return function (noop) { return noop; }; };
    if (process.env.NODE_ENV !== "production" && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
        devtools = window["__REDUX_DEVTOOLS_EXTENSION__"];
    }
    if (reducers.router || reducers.project) {
        throw new Error("the reducer name 'router' 'project' is not allowed");
    }
    reducers.project = reducer;
    var routingMiddleware = connectedReactRouter.routerMiddleware(storeHistory);
    var sagaMiddleware = createSagaMiddleware__default();
    var middlewares = storeMiddlewares.concat([routingMiddleware, sagaMiddleware]);
    var enhancers = storeEnhancers.concat([redux.applyMiddleware.apply(void 0, middlewares), devtools(window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"])]);
    var store = redux.createStore(rootReducer(connectedReactRouter.connectRouter(storeHistory)(redux.combineReducers(reducers))), {}, redux.compose.apply(void 0, enhancers));
    singleStore = store;
    sagaMiddleware.run(saga);
    window.onerror = function (message, filename, lineno, colno, error) {
        store.dispatch(errorAction(error || { message: message }));
    };
    injectedModules.forEach(function (action) {
        store.dispatch(action);
    });
    injectedModules.length = 0;
    return store;
}
function getSingleStore() {
    return singleStore;
}

var loadings = {};
var actions;
var depthTime = 2;
function setLoadingDepthTime(second) {
    depthTime = second;
}
function setActions(moduleActions) {
    actions = moduleActions;
}
function setLoading(item, namespace, group) {
    if (namespace === void 0) { namespace = "app"; }
    if (group === void 0) { group = "global"; }
    var key = namespace + "/" + group;
    if (!loadings[key]) {
        loadings[key] = new TaskCounter(depthTime);
        loadings[key].addListener(TaskCountEvent, function (e) {
            var store = getSingleStore();
            if (store) {
                store.dispatch(actions[namespace][LOADING_ACTION_NAME]((_a = {}, _a[group] = e.data, _a)));
            }
            var _a;
        });
    }
    loadings[key].addItem(item);
    return item;
}

var defaultLoadingComponent = function () { return React.createElement("div", { className: "react-coat-asyncComponent-loading" }, "Loading..."); };
var defaultErrorComponent = function (props) {
    return React.createElement("div", { className: "react-coat-asyncComponent-error" },
        "Error: ",
        props.message);
};
function asyncComponent(resolve, componentName, defLoadingComponent, ErrorComponent) {
    if (componentName === void 0) { componentName = "Main"; }
    if (defLoadingComponent === void 0) { defLoadingComponent = defaultLoadingComponent; }
    if (ErrorComponent === void 0) { ErrorComponent = defaultErrorComponent; }
    var AsyncComponent = /** @class */ (function (_super) {
        __extends(AsyncComponent, _super);
        function AsyncComponent(props, context) {
            var _this = _super.call(this, props, context) || this;
            _this.LoadingComponent = defLoadingComponent;
            _this.ErrorComponent = ErrorComponent;
            _this.state = {
                Component: null,
            };
            return _this;
        }
        AsyncComponent.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return nextState.Component !== this.state.Component;
        };
        AsyncComponent.prototype.componentDidMount = function () {
            var _this = this;
            var promise = resolve()
                .then(function (module) {
                var Component = module.default[componentName];
                _this.setState({
                    Component: Component,
                });
            })
                .catch(function (errorData) {
                _this.errorMessage = errorData.message;
                var Component = _this.ErrorComponent;
                _this.props.dispatch(errorAction(errorData));
                _this.setState({
                    Component: Component,
                });
            });
            setLoading(promise);
        };
        AsyncComponent.prototype.render = function () {
            var Component = this.state.Component;
            var LoadingComponent = this.LoadingComponent;
            if (Component) {
                if (Component === this.ErrorComponent) {
                    return React.createElement(Component, __assign({ message: this.errorMessage }, this.props));
                }
                else {
                    return React.createElement(Component, __assign({}, this.props));
                }
            }
            else {
                return React.createElement(LoadingComponent, __assign({}, this.props));
            }
        };
        return AsyncComponent;
    }(React.Component));
    var mapDispatchToProps = function (dispatch) {
        return {
            dispatch: dispatch,
        };
    };
    return reactRedux.connect(null, mapDispatchToProps)(AsyncComponent);
}

// export function assignObject<T, U>(target: T, source: U): T & U {
//   for (const key in source) {
//     if (source.hasOwnProperty(key)) {
//       (target as any)[key] = source[key];
//     }
//   }
//   return target as T & U;
// }
function isGenerator(fun) {
    return Boolean(fun["__generator__"]);
}
function setGenerator(fun) {
    fun["__generator__"] = true;
    return fun;
}
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

var sagaNameMap = {};
function pushSagaName(actionName) {
    if (!sagaNameMap[actionName]) {
        sagaNameMap[actionName] = true;
        sagaNames.push(actionName);
    }
}
function transformAction(actionName, action, listenerModule, actionsMap) {
    if (!actionsMap[actionName]) {
        actionsMap[actionName] = {};
    }
    if (actionsMap[actionName][listenerModule]) {
        throw new Error("Action duplicate or conflict : " + actionName + ".");
    }
    actionsMap[actionName][listenerModule] = action;
    if (actionsMap === sagasMap) {
        pushSagaName(actionName);
    }
}
function injectActions(namespace, actions) {
    Object.keys(actions).forEach(function (actionName) {
        transformAction(namespace + NSP + actionName, actions[actionName], namespace, isGenerator(actions[actionName]) ? sagasMap : reducersMap);
    });
}
function injectHandlers(listenerModule, handlers) {
    Object.keys(handlers).forEach(function (handlerName) {
        transformAction(handlerName, handlers[handlerName], listenerModule, isGenerator(handlers[handlerName]) ? sagasMap : reducersMap);
    });
}

var injectedModules = [];
var hasInjected = {};
var actionsProxy = {};
setActions(actionsProxy);
var prvHistory;
function buildModule(namespace) {
    var actions = getModuleActions(namespace);
    // if (window["Proxy"]) {
    //   actions = new window["Proxy"](
    //     {},
    //     {
    //       get: (target: {}, key: string) => {
    //         return (data: any) => ({ type: namespace + "/" + key, data });
    //       }
    //     }
    //   );
    // } else {
    //   actions = getModuleActions(namespace) as any;
    // }
    return {
        namespace: namespace,
        actions: actions,
    };
}
function getModuleActions(namespace) {
    var actions = actionsProxy[namespace] || {};
    actionsProxy[namespace] = actions;
    return actions;
}
var BaseModuleActions = /** @class */ (function () {
    function BaseModuleActions() {
        this.delay = createSagaMiddleware.delay;
        this.take = effects.take;
        this.fork = effects.fork;
        this.cps = effects.cps;
        this.call = effects.call;
        this.put = effects.put;
        this.routerActions = connectedReactRouter.routerActions;
    }
    BaseModuleActions.prototype[INIT_MODULE_ACTION_NAME] = function (_a) {
        var payload = _a.payload;
        return payload;
    };
    BaseModuleActions.prototype[LOADING_ACTION_NAME] = function (_a) {
        var payload = _a.payload, moduleState = _a.moduleState;
        return __assign({}, moduleState, { loading: __assign({}, moduleState.loading, payload) });
    };
    return BaseModuleActions;
}());
var BaseModuleHandlers = /** @class */ (function () {
    function BaseModuleHandlers() {
        this.routerActions = connectedReactRouter.routerActions;
        this.fork = effects.fork;
        this.cps = effects.cps;
        this.call = effects.call;
        this.put = effects.put;
        this.take = effects.take;
    }
    BaseModuleHandlers.prototype.dispatch = function (action) {
        getStore().dispatch(action);
    };
    return BaseModuleHandlers;
}());
function effect(loadingForModuleName, loadingForGroupName) {
    if (loadingForModuleName === void 0) { loadingForModuleName = "app"; }
    if (loadingForGroupName === void 0) { loadingForGroupName = "global"; }
    return function (target, key, descriptor) {
        var fun = descriptor.value;
        setGenerator(fun);
        if (loadingForModuleName !== null) {
            var before = function () {
                var loadingCallback = null;
                setLoading(new Promise(function (resolve, reject) {
                    loadingCallback = resolve;
                }), loadingForModuleName, loadingForGroupName);
                return loadingCallback;
            };
            var after = function (resolve, error) {
                resolve(error);
            };
            if (!fun.__decorators__) {
                fun.__decorators__ = [];
            }
            fun.__decorators__.push([before, after]);
        }
    };
}
function buildlogger(before, after) {
    return function (target, key, descriptor) {
        var fun = descriptor.value;
        if (!fun.__decorators__) {
            fun.__decorators__ = [];
        }
        fun.__decorators__.push([before, after]);
    };
}
function translateMap(ins) {
    var map = {};
    for (var key in ins) {
        if (ins[key]) {
            map[key] = ins[key];
            ins[key].__host__ = ins;
        }
    }
    return map;
}
function buildModel(state, actionsIns, handlersIns) {
    var handlers = translateMap(handlersIns);
    var actions = translateMap(actionsIns);
    return { state: state, actions: actions, handlers: handlers };
}
function buildViews(namespace, views, model) {
    if (!hasInjected[namespace]) {
        var locationChangeHandler = model.handlers[LOCATION_CHANGE_ACTION_NAME];
        if (locationChangeHandler) {
            model.handlers[namespace + NSP + INIT_LOCATION_ACTION_NAME] = locationChangeHandler;
        }
        injectActions(namespace, model.actions);
        injectHandlers(namespace, model.handlers);
        var actions_1 = getModuleActions(namespace);
        Object.keys(model.actions).forEach(function (key) {
            actions_1[key] = function (payload) { return ({ type: namespace + NSP + key, payload: payload }); };
        });
        hasInjected[namespace] = true;
        var action = actions_1[INIT_MODULE_ACTION_NAME](model.state);
        var store = getSingleStore();
        if (store) {
            store.dispatch(action);
        }
        else {
            injectedModules.push(action);
        }
    }
    return views;
}
function getStore() {
    // redux3中Store泛型有一个参数，redux4中变为2个，为兼容此处设为any
    return getSingleStore();
}
function getHistory() {
    return prvHistory;
}
function createApp(view, container, storeMiddlewares, storeEnhancers, reducers, storeHistory) {
    if (storeMiddlewares === void 0) { storeMiddlewares = []; }
    if (storeEnhancers === void 0) { storeEnhancers = []; }
    if (reducers === void 0) { reducers = {}; }
    prvHistory = storeHistory || createHistory();
    var store = buildStore(prvHistory, reducers, storeMiddlewares, storeEnhancers, injectedModules);
    buildApp(view, container, storeMiddlewares, storeEnhancers, store, prvHistory);
}

exports.call = effects.call;
exports.put = effects.put;
exports.buildModule = buildModule;
exports.BaseModuleActions = BaseModuleActions;
exports.BaseModuleHandlers = BaseModuleHandlers;
exports.effect = effect;
exports.buildlogger = buildlogger;
exports.buildModel = buildModel;
exports.buildViews = buildViews;
exports.getStore = getStore;
exports.getHistory = getHistory;
exports.createApp = createApp;
exports.asyncComponent = asyncComponent;
exports.setLoadingDepthTime = setLoadingDepthTime;
exports.setLoading = setLoading;
exports.delayPromise = delayPromise;
exports.ERROR_ACTION_NAME = ERROR_ACTION_NAME;
exports.LOCATION_CHANGE_ACTION_NAME = LOCATION_CHANGE_ACTION_NAME;
//# sourceMappingURL=index.js.map
