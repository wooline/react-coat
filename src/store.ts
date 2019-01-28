import {connectRouter, routerMiddleware} from "connected-react-router";
import {History} from "history";
import {applyMiddleware, compose, createStore, Middleware, ReducersMapObject, StoreEnhancer} from "redux";
import {Action, LOADING, LOCATION_CHANGE, MetaData, ModelStore, NSP, errorAction, viewInvalidAction, VIEW_INVALID} from "./global";

let invalidViewTimer: NodeJS.Timer | null;

function checkInvalidview() {
  invalidViewTimer = null;
  const currentViews = MetaData.clientStore.reactCoat.currentViews;
  const views: typeof currentViews = {};
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

function getActionData(action: Action) {
  const arr = Object.keys(action).filter(key => key !== "type" && key !== "priority" && key !== "time");
  if (arr.length === 0) {
    return undefined;
  } else if (arr.length === 1) {
    return action[arr[0]];
  } else {
    const data = {...action};
    delete data["type"];
    delete data["priority"];
    delete data["time"];
    return data;
  }
}

export type RouterParser<T = any> = (nextRouter: T, prevRouter?: T) => T;

export function buildStore(storeHistory: History, reducersMapObject: ReducersMapObject<any, any> = {}, storeMiddlewares: Middleware[] = [], storeEnhancers: StoreEnhancer[] = [], initData: any = {}, routerParser?: RouterParser): ModelStore {
  let store: ModelStore;
  const combineReducers = (rootState: {[key: string]: any}, action: Action) => {
    if (!store) {
      return rootState;
    }
    const reactCoat = store.reactCoat;
    reactCoat.prevState = rootState;
    const currentState = {...rootState};
    reactCoat.currentState = currentState;

    Object.keys(reducersMapObject).forEach(namespace => {
      currentState[namespace] = reducersMapObject[namespace](currentState[namespace], action);
      if (namespace === "router" && routerParser && rootState.router !== currentState.router) {
        currentState.router = routerParser(currentState.router, rootState.router);
      }
    });
    // 内置 action handler
    if (action.type === VIEW_INVALID) {
      currentState.views = getActionData(action);
    }
    const handlersCommon = reactCoat.reducerMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = reactCoat.reducerMap[action.type.replace(new RegExp(`[^${NSP}]+`), "*")] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList: string[] = action.priority ? [...action.priority] : [];
      handlerModules.forEach(namespace => {
        const fun = handlers[namespace];
        if (fun.__isHandler__) {
          orderList.push(namespace);
        } else {
          orderList.unshift(namespace);
        }
      });
      const moduleNameMap: {[key: string]: boolean} = {};
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
  const effectMiddleware = ({dispatch}: {dispatch: Function}) => (next: Function) => (originalAction: Action) => {
    if (!MetaData.isBrowser) {
      if (originalAction.type.split(NSP)[1] === LOADING) {
        return originalAction;
      }
    }
    // SSR需要数据是单向的，store->view，不能store->view->store->view，而view:ConnectedRouter初始化时会触发一次LOCATION_CHANGE
    if (originalAction.type === LOCATION_CHANGE) {
      if (!store.reactCoat.routerInited) {
        store.reactCoat.routerInited = true;
        return originalAction;
      } else {
        invalidview();
      }
    }
    const action: Action = next(originalAction);
    if (!action) {
      return null;
    }
    const handlersCommon = store.reactCoat.effectMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = store.reactCoat.effectMap[action.type.replace(new RegExp(`[^${NSP}]+`), "*")] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList: string[] = action.priority ? [...action.priority] : [];
      handlerModules.forEach(namespace => {
        const fun = handlers[namespace];
        if (fun.__isHandler__) {
          orderList.push(namespace);
        } else {
          orderList.unshift(namespace);
        }
      });
      const moduleNameMap: {[key: string]: boolean} = {};
      const promiseResults: Array<Promise<any>> = [];
      orderList.forEach(namespace => {
        if (!moduleNameMap[namespace]) {
          moduleNameMap[namespace] = true;
          const fun = handlers[namespace];
          const effectResult = fun(getActionData(action));
          const decorators = fun.__decorators__;
          if (decorators) {
            const results: any[] = [];
            decorators.forEach((decorator, index) => {
              results[index] = decorator[0](action, namespace, effectResult);
            });
            fun.__decoratorResults__ = results;
          }

          effectResult.then(
            (reslove: any) => {
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
            },
            (reject: any) => {
              if (decorators) {
                const results = fun.__decoratorResults__ || [];
                decorators.forEach((decorator, index) => {
                  if (decorator[1]) {
                    decorator[1]("Rejected", results[index], reject);
                  }
                });
                fun.__decoratorResults__ = undefined;
              }
            },
          );
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
    //
    // __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    enhancers.push(window["__REDUX_DEVTOOLS_EXTENSION__"](window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"]));
  }
  store = createStore(combineReducers as any, initData, compose(...enhancers));
  if (store.reactCoat) {
    throw new Error("store enhancers has 'reactCoat' property");
  } else {
    store.reactCoat = {
      history: storeHistory,
      prevState: {router: null as any},
      currentState: {router: null as any},
      reducerMap: {},
      effectMap: {},
      injectedModules: {},
      routerInited: false,
      currentViews: {},
    };
  }
  MetaData.clientStore = store;
  if (MetaData.isBrowser) {
    window.onerror = (evt: Event | string, source?: string, fileno?: number, columnNumber?: number, error?: Error) => {
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
