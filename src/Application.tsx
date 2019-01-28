import {ConnectedRouter} from "connected-react-router";
import createBrowserHistory from "history/createBrowserHistory";
import createMemoryHistory from "history/createMemoryHistory";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {renderToNodeStream, renderToString} from "react-dom/server";
import {Provider} from "react-redux";
import {withRouter} from "react-router-dom";
import {Middleware, ReducersMapObject, StoreEnhancer, Store} from "redux";
import {errorAction, MetaData, Module, ModuleGetter} from "./global";
import {buildStore, RouterParser} from "./store";

export interface StoreOptions {
  reducers?: ReducersMapObject;
  middlewares?: Middleware[];
  enhancers?: StoreEnhancer[];
  routerParser?: RouterParser;
  initData?: any;
}
function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module> {
  return typeof module["then"] === "function";
}
function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module {
  if (moduleName === "router") {
    throw new Error("router is a system module");
  }
  const result = moduleGetter[moduleName]();
  if (isPromiseModule(result)) {
    return result.then(module => {
      moduleGetter[moduleName] = () => module;
      return module;
    });
  } else {
    return result;
  }
}
function getModuleListByNames(moduleNames: string[], moduleGetter: ModuleGetter): Promise<Module[]> {
  const preModules = moduleNames.map(moduleName => {
    const module = getModuleByName(moduleName, moduleGetter);
    if (isPromiseModule(module)) {
      return module;
    } else {
      return Promise.resolve(module);
    }
  });
  return Promise.all(preModules);
}
export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appName: A, storeOptions: StoreOptions = {}, container: string = "root", ssrInitStoreKey: string = "reactCoatInitStore") {
  MetaData.appModuleName = appName;
  const history = createBrowserHistory();
  let initData = {};
  if (storeOptions.initData || window[ssrInitStoreKey]) {
    initData = {...window[ssrInitStoreKey], ...storeOptions.initData};
  }
  const store = buildStore(history, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers, initData, storeOptions.routerParser);
  const preModuleNames: string[] = [appName];
  if (initData) {
    preModuleNames.push(...Object.keys(initData).filter(key => key !== appName && key !== "router"));
  }
  getModuleListByNames(preModuleNames, moduleGetter).then(([appModel]) => {
    appModel.model(store);
    /* 此处没有使用.then，可以让view不必等init初始化完就及时展示出来，不过会导致和server端渲染不一样，以及可能会出现某些问题，待观察 */
    const WithRouter = withRouter(appModel.views.Main);
    const render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
    render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <WithRouter />
        </ConnectedRouter>
      </Provider>,
      document.getElementById(container),
    );
  });
  return store as Store;
}

export function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appName: A,
  initialEntries: string[],
  storeOptions: StoreOptions = {},
  ssrInitStoreKey: string = "reactCoatInitStore",
  renderToStream: boolean = false,
): Promise<{html: string | NodeJS.ReadableStream; data: any; ssrInitStoreKey: string}> {
  MetaData.appModuleName = appName;
  const history = createMemoryHistory({initialEntries});
  const store = buildStore(history, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers, storeOptions.initData, storeOptions.routerParser);
  const appModule = moduleGetter[appName]() as Module;
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
        html: render(
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <appModule.views.Main />
            </ConnectedRouter>
          </Provider>,
        ),
      };
    });
}
