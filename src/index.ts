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

export interface BaseModuleActions {
  [INIT_MODULE_ACTION_NAME]: ActionCreator<"INIT", any>;
  [LOADING_ACTION_NAME]: ActionCreator<"LOADING", { [group: string]: string }>;
}

export function effect(loadingForModuleName: string | null = "app", loadingForGroupName: string = "global") {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value as any;
    setGenerator(fun);
    if (loadingForModuleName !== null) {
      const before = () => {
        let loadingCallback: Function | null = null;
        setLoading(
          new Promise<any>((resolve, reject) => {
            loadingCallback = resolve;
          }),
          loadingForModuleName,
          loadingForGroupName,
        );
        return loadingCallback;
      };
      const after = (resolve, error?) => {
        resolve(error);
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }
      fun.__decorators__.push([before, after]);
    }
  };
}
export function buildlogger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value as any;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after]);
  };
}

export type ActionCreator<T, P> = (
  payload: P,
) => {
  type: T;
  payload: P;
};
function translateMap<T>(cls: new () => T) {
  const ins = new cls();
  type Ins = typeof ins;
  type Map = {
    [K in keyof Ins]: Ins[K] extends (data: null | undefined, ...args) => any
      ? () => {
          type: K;
          payload: null;
        }
      : Ins[K] extends (data: infer P, ...args) => any ? ActionCreator<K, P> : never
  };
  const map = {};
  for (const key in ins as any) {
    if (ins[key]) {
      map[key] = ins[key];
    }
  }
  return map as Map;
}
export function buildModel<S, A, H>(state: S, actionClass: new () => A, handlerClass: new () => H) {
  const handlers = translateMap(handlerClass) as any;
  const actions = translateMap(actionClass);
  actions[INIT_MODULE_ACTION_NAME] = (data: any, moduleState: any, rootState: any) => {
    return data;
  };
  actions[LOADING_ACTION_NAME] = (loading: { [group: string]: string }, moduleState: any, rootState: any) => {
    return {
      ...moduleState,
      loading: { ...moduleState.loading, ...loading },
    };
  };
  type Actions = typeof actions & BaseModuleActions;
  return { state, actions, handlers } as { state: S; actions: Actions; handlers: H };
}

export function buildViews<T>(namespace: string, views: T, model: Model) {
  if (!hasInjected[namespace]) {
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
