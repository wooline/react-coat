import { History, LocationDescriptorObject } from "history";
import createHistory from "history/createBrowserHistory";
import { ComponentType } from "react";
import { Middleware, ReducersMapObject, Action } from "redux";
import { delay } from "redux-saga";
import { call, put, cps, fork, take } from "redux-saga/effects";
import { RouterState, routerActions } from "connected-react-router";
import { ERROR_ACTION_NAME, INIT_LOCATION_ACTION_NAME, INIT_MODULE_ACTION_NAME, LOADING_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME, NSP } from "./actions";
import buildApp from "./Application";
import { asyncComponent } from "./asyncImport";
import { injectActions, injectHandlers } from "./inject";
import { LoadingState, setLoading, setLoadingDepthTime, setActions } from "./loading";
import { buildStore, getSingleStore } from "./storeProxy";
import { Model } from "./types";
import { delayPromise, setGenerator } from "./utils";

const injectedModules: Array<{ type: string }> = [];
const hasInjected: { [moduleName: string]: boolean } = {};
const actionsProxy: { [moduleName: string]: { [action: string]: Function } } = {};

setActions(actionsProxy);

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

export class BaseModuleActions {
  protected delay: typeof delay = delay;
  protected take: typeof take = take;
  protected fork: typeof fork = fork;
  protected cps: typeof cps = cps;
  protected call: typeof call = call;
  protected put: typeof put = put;
  protected routerActions = routerActions;
  [INIT_MODULE_ACTION_NAME]({ payload }) {
    return payload;
  }
  [LOADING_ACTION_NAME]({ payload, moduleState }: { payload: { [group: string]: string }; moduleState: any }) {
    return {
      ...moduleState,
      loading: { ...moduleState.loading, ...payload },
    };
  }
}
export class BaseModuleHandlers {
  protected routerActions = routerActions;
  protected fork: typeof fork = fork;
  protected cps: typeof cps = cps;
  protected call: typeof call = call;
  protected put: typeof put = put;
  protected take: typeof take = take;
  protected dispatch(action: { type: string }) {
    getStore().dispatch(action);
  }
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

export type ActionCreator<P> = (
  payload: P,
) => {
  type: string;
  payload: P;
};
export type EmptyActionCreator = () => {
  type: string;
};
function translateMap<T>(ins: T) {
  type Ins = typeof ins;
  type Map = { [K in keyof Ins]: Ins[K] extends () => any ? EmptyActionCreator : Ins[K] extends (data: { payload: infer P }) => any ? ActionCreator<P> : EmptyActionCreator };
  const map = {};
  for (const key in ins as any) {
    if (ins[key]) {
      map[key] = ins[key];
      ins[key].__host__ = ins;
    }
  }
  return map as Map;
}
export function buildModel<S, A, H>(state: S, actionsIns: A, handlersIns: H) {
  const handlers = translateMap(handlersIns) as any;
  const actions = translateMap(actionsIns);
  return { state, actions, handlers };
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
    const action = actions[INIT_MODULE_ACTION_NAME](model.state);
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
  router: RouterState;
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
export { Action, LocationDescriptorObject };
export { asyncComponent, setLoadingDepthTime, setLoading, LoadingState, delayPromise };
export { ERROR_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME };
export { call, put };
