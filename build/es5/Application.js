import * as tslib_1 from "tslib";
import { ConnectedRouter } from "connected-react-router";
import createBrowserHistory from "history/createBrowserHistory";
import createMemoryHistory from "history/createMemoryHistory";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { renderToNodeStream, renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { withRouter } from "react-router-dom";
import { errorAction, MetaData } from "./global";
import { buildStore } from "./store";
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
export function buildApp(moduleGetter, appName, storeOptions, container, ssrInitStoreKey) {
    if (storeOptions === void 0) { storeOptions = {}; }
    if (container === void 0) { container = "root"; }
    if (ssrInitStoreKey === void 0) { ssrInitStoreKey = "reactCoatInitStore"; }
    MetaData.appModuleName = appName;
    var history = createBrowserHistory();
    var initData = {};
    if (storeOptions.initData || window[ssrInitStoreKey]) {
        initData = tslib_1.__assign({}, window[ssrInitStoreKey], storeOptions.initData);
    }
    var store = buildStore(history, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers, initData, storeOptions.routerParser);
    var preModuleNames = [appName];
    if (initData) {
        preModuleNames.push.apply(preModuleNames, Object.keys(initData).filter(function (key) { return key !== appName && key !== "router"; }));
    }
    getModuleListByNames(preModuleNames, moduleGetter).then(function (_a) {
        var appModel = _a[0];
        appModel.model(store);
        var WithRouter = withRouter(appModel.views.Main);
        var app = (React.createElement(Provider, { store: store },
            React.createElement(ConnectedRouter, { history: history },
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
export function renderApp(moduleGetter, appName, initialEntries, storeOptions, ssrInitStoreKey, renderToStream) {
    if (storeOptions === void 0) { storeOptions = {}; }
    if (ssrInitStoreKey === void 0) { ssrInitStoreKey = "reactCoatInitStore"; }
    if (renderToStream === void 0) { renderToStream = false; }
    MetaData.appModuleName = appName;
    var history = createMemoryHistory({ initialEntries: initialEntries });
    var store = buildStore(history, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers, storeOptions.initData, storeOptions.routerParser);
    var appModule = moduleGetter[appName]();
    var render = renderToStream ? renderToNodeStream : renderToString;
    return appModule
        .model(store)
        .catch(function (err) {
        return store.dispatch(errorAction(err));
    })
        .then(function () {
        var data = store.getState();
        return {
            ssrInitStoreKey: ssrInitStoreKey,
            data: data,
            html: render(React.createElement(Provider, { store: store },
                React.createElement(ConnectedRouter, { history: history },
                    React.createElement(appModule.views.Main, null)))),
        };
    });
}
