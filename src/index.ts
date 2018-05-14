import { History } from "history";
import createHistory from "history/createBrowserHistory";
import { ComponentType } from "react";
import { Middleware, ReducersMapObject } from "redux";
import { ERROR_ACTION_NAME, INIT_LOCATION_ACTION_NAME, INIT_MODULE_ACTION_NAME, initModuleAction, LOADING_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME, NSP } from "./actions";
import buildApp from "./Application";
import { asyncComponent } from "./asyncImport";
import { injectActions, injectHandlers } from "./inject";
import { LoadingState, setLoading, setLoadingDepthTime } from "./loading";
import { buildStore, getSingleStore } from "./storeProxy";
import { Model } from "./types";
import { delayPromise, setGenerator } from "./utils";

const injectedModules: Array<{ type: string }> = [];
const hasInjected: { [moduleName: string]: boolean } = {};
const actionsProxy: { [moduleName: string]: { [action: string]: Function } } = {};

let prvHistory: History;
export function buildModule<T>(namespace: string) {
  const actions: T = getModuleActions(namespace) as any;
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
    namespace,
    actions,
  };
}

function getModuleActions(namespace: string) {
  const actions = actionsProxy[namespace] || {};
  actionsProxy[namespace] = actions;
  return actions;
}

export interface BaseModuleState {
  loading: {
    global: LoadingState;
  };
}

export function buildActionByReducer<T, S>(reducer: (data: T, moduleState: S, rootState: any) => S) {
  const fun = reducer as any;
  return fun as T extends null | undefined ? () => { type: string; payload: T } : (payload: T) => { type: string; payload: T };
}
export function buildActionByEffect<T, S>(effect: (data: T, moduleState: S, rootState: any) => IterableIterator<any>) {
  const fun = setGenerator(effect);
  return fun as T extends null | undefined ? () => { type: string; payload: T } : (payload: T) => { type: string; payload: T };
}

export function buildLoading(moduleName: string = "app", group: string = "global") {
  return (target: any, key: string) => {
    const before = () => {
      let loadingCallback: Function | null = null;
      setLoading(
        new Promise<any>((resolve, reject) => {
          loadingCallback = resolve;
        }),
        moduleName,
        group,
      );
      return loadingCallback;
    };
    const after = (resolve, error?) => {
      resolve(error);
    };
    if (!target[key]) {
      target[key] = [];
    }
    target[key].push([before, after]);
  };
}
export function buildlogger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void) {
  return (target: any, key: string) => {
    if (!target[key]) {
      target[key] = [];
    }
    target[key].push([before, after]);
  };
}
function translateMap(cls: any) {
  const ins = new cls();
  const map = {};
  Object.keys(ins).reduce((pre, key) => {
    pre[key] = ins[key];
    return pre;
  }, map);
  const poto = cls.prototype;
  for (const key in poto) {
    if (map[key]) {
      map[key].__decorators__ = poto[key];
    }
  }
  return map as any;
}
export function buildModel<S, A, H>(state: S, actionClass: new () => A, handlerClass: new () => H) {
  const actions: A = translateMap(actionClass);
  const handlers: H = translateMap(handlerClass);
  return { state, actions, handlers };
}

export function buildViews<T>(namespace: string, views: T, model: Model) {
  if (!hasInjected[namespace]) {
    model.actions[INIT_MODULE_ACTION_NAME] = buildActionByReducer(function(data: any, moduleState: any, rootState: any) {
      return data;
    });
    model.actions[LOADING_ACTION_NAME] = buildActionByReducer(function(loading: { [group: string]: string }, moduleState: any, rootState: any) {
      return {
        ...moduleState,
        loading: { ...moduleState.loading, ...loading },
      };
    });
    const locationChangeHandler = model.handlers[LOCATION_CHANGE_ACTION_NAME];
    if (locationChangeHandler) {
      model.handlers[namespace + NSP + INIT_LOCATION_ACTION_NAME] = locationChangeHandler;
    }
    injectActions(namespace, model.actions);
    injectHandlers(namespace, model.handlers);
    const actions = getModuleActions(namespace);
    Object.keys(model.actions).forEach(key => {
      actions[key] = payload => ({ type: namespace + NSP + key, payload });
    });
    hasInjected[namespace] = true;
    const action = initModuleAction(namespace, model.state);
    const store = getSingleStore();
    if (store) {
      store.dispatch(action);
    } else {
      injectedModules.push(action);
    }
  }
  return views;
}

export interface StoreState<P> {
  router: {
    location: {
      pathname: string;
      search: {};
      hash: string;
      key: string;
    };
  };
  project: P;
}
export function getStore() {
  // redux3中Store泛型有一个参数，redux4中变为2个，为兼容此处设为any
  return getSingleStore() as any;
}
export function getHistory() {
  return prvHistory;
}
export function createApp(view: ComponentType<any>, container: string, storeMiddlewares: Middleware[] = [], storeEnhancers: Function[] = [], reducers: ReducersMapObject = {}, storeHistory?: History) {
  prvHistory = storeHistory || createHistory();
  const store = buildStore(prvHistory, reducers, storeMiddlewares, storeEnhancers, injectedModules);
  buildApp(view, container, storeMiddlewares, storeEnhancers, store, prvHistory);
}
export { asyncComponent, setLoadingDepthTime, setLoading, LoadingState, delayPromise };
export { ERROR_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME };
