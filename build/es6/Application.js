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
    const result = moduleGetter[moduleName]();
    if (isPromiseModule(result)) {
        return result.then(module => {
            moduleGetter[moduleName] = () => module;
            return module;
        });
    }
    else {
        return result;
    }
}
function getModuleListByNames(moduleNames, moduleGetter) {
    const preModules = moduleNames.map(moduleName => {
        const module = getModuleByName(moduleName, moduleGetter);
        if (isPromiseModule(module)) {
            return module;
        }
        else {
            return Promise.resolve(module);
        }
    });
    return Promise.all(preModules);
}
export function buildApp(moduleGetter, appName, storeOptions = {}, container = "root", ssrInitStoreKey = "reactCoatInitStore") {
    MetaData.appModuleName = appName;
    const history = createBrowserHistory();
    let initData = {};
    if (storeOptions.initData || window[ssrInitStoreKey]) {
        initData = Object.assign({}, window[ssrInitStoreKey], storeOptions.initData);
    }
    const store = buildStore(history, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers, initData, storeOptions.routerParser);
    const preModuleNames = [appName];
    if (initData) {
        preModuleNames.push(...Object.keys(initData).filter(key => key !== appName && initData[key].isModule));
    }
    getModuleListByNames(preModuleNames, moduleGetter).then(([appModel]) => {
        appModel.model(store);
        const WithRouter = withRouter(appModel.views.Main);
        const app = (React.createElement(Provider, { store: store },
            React.createElement(ConnectedRouter, { history: history },
                React.createElement(WithRouter, null))));
        if (typeof container === "function") {
            container(app);
        }
        else {
            const render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
            render(app, typeof container === "string" ? document.getElementById(container) : container);
        }
    });
    return store;
}
export function renderApp(moduleGetter, appName, initialEntries, storeOptions = {}, ssrInitStoreKey = "reactCoatInitStore", renderToStream = false) {
    MetaData.appModuleName = appName;
    const history = createMemoryHistory({ initialEntries });
    const store = buildStore(history, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers, storeOptions.initData, storeOptions.routerParser);
    const appModule = moduleGetter[appName]();
    const render = renderToStream ? renderToNodeStream : renderToString;
    return appModule
        .model(store)
        .catch(err => {
        return store.dispatch(errorAction(err));
    })
        .then(() => {
        const data = store.getState();
        return {
            ssrInitStoreKey,
            data,
            html: render(React.createElement(Provider, { store: store },
                React.createElement(ConnectedRouter, { history: history },
                    React.createElement(appModule.views.Main, null)))),
        };
    });
}
