"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var connected_react_router_1 = require("connected-react-router");
var createBrowserHistory_1 = require("history/createBrowserHistory");
var createMemoryHistory_1 = require("history/createMemoryHistory");
var React = require("react");
var ReactDOM = require("react-dom");
var server_1 = require("react-dom/server");
var react_redux_1 = require("react-redux");
var react_router_dom_1 = require("react-router-dom");
var global_1 = require("./global");
var store_1 = require("./store");
function isPromiseModule(module) {
    return typeof module["then"] === "function";
}
function getModuleByName(moduleName, moduleGetter) {
    if (moduleName === "router") {
        throw new Error("router is a system module");
    }
    var result = moduleGetter[moduleName]();
    if (isPromiseModule(result)) {
        return result.then(function (module) {
            moduleGetter[moduleName] = function () { return module; };
            return module;
        });
    }
    else {
        return result;
    }
}
function getModuleListByNames(moduleNames, moduleGetter) {
    var preModules = moduleNames.map(function (moduleName) {
        var module = getModuleByName(moduleName, moduleGetter);
        if (isPromiseModule(module)) {
            return module;
        }
        else {
            return Promise.resolve(module);
        }
    });
    return Promise.all(preModules);
}
function buildApp(moduleGetter, appName, storeOptions, container, ssrInitStoreKey) {
    if (storeOptions === void 0) { storeOptions = {}; }
    if (container === void 0) { container = "root"; }
    if (ssrInitStoreKey === void 0) { ssrInitStoreKey = "reactCoatInitStore"; }
    global_1.MetaData.appModuleName = appName;
    var history = createBrowserHistory_1.default();
    var initData = {};
    if (storeOptions.initData || window[ssrInitStoreKey]) {
        initData = tslib_1.__assign({}, window[ssrInitStoreKey], storeOptions.initData);
    }
    var store = store_1.buildStore(history, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers, initData, storeOptions.routerParser);
    var preModuleNames = [appName];
    if (initData) {
        preModuleNames.push.apply(preModuleNames, Object.keys(initData).filter(function (key) { return key !== appName && initData[key].isModule; }));
    }
    getModuleListByNames(preModuleNames, moduleGetter).then(function (_a) {
        var appModel = _a[0];
        appModel.model(store);
        var WithRouter = react_router_dom_1.withRouter(appModel.views.Main);
        var app = (React.createElement(react_redux_1.Provider, { store: store },
            React.createElement(connected_react_router_1.ConnectedRouter, { history: history },
                React.createElement(WithRouter, null))));
        if (typeof container === "function") {
            container(app);
        }
        else {
            var render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
            render(app, typeof container === "string" ? document.getElementById(container) : container);
        }
    });
    return store;
}
exports.buildApp = buildApp;
function renderApp(moduleGetter, appName, initialEntries, storeOptions, ssrInitStoreKey, renderToStream) {
    if (storeOptions === void 0) { storeOptions = {}; }
    if (ssrInitStoreKey === void 0) { ssrInitStoreKey = "reactCoatInitStore"; }
    if (renderToStream === void 0) { renderToStream = false; }
    global_1.MetaData.appModuleName = appName;
    var history = createMemoryHistory_1.default({ initialEntries: initialEntries });
    var store = store_1.buildStore(history, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers, storeOptions.initData, storeOptions.routerParser);
    var appModule = moduleGetter[appName]();
    var render = renderToStream ? server_1.renderToNodeStream : server_1.renderToString;
    return appModule
        .model(store)
        .catch(function (err) {
        return store.dispatch(global_1.errorAction(err));
    })
        .then(function () {
        var data = store.getState();
        return {
            ssrInitStoreKey: ssrInitStoreKey,
            data: data,
            html: render(React.createElement(react_redux_1.Provider, { store: store },
                React.createElement(connected_react_router_1.ConnectedRouter, { history: history },
                    React.createElement(appModule.views.Main, null)))),
        };
    });
}
exports.renderApp = renderApp;
