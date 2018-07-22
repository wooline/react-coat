import { routerActions, RouterState } from "connected-react-router";
import { History, LocationDescriptorObject } from "history";
import createHistory from "history/createBrowserHistory";
import { ComponentType } from "react";
import { Action, Middleware, ReducersMapObject } from "redux";
import { delay } from "redux-saga";
import { call, CallEffect, cps, fork, put, take } from "redux-saga/effects";
import { ERROR_ACTION_NAME, INIT_LOCATION_ACTION_NAME, INIT_MODULE_ACTION_NAME, LOADING_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME, NSP } from "./actions";
import buildApp from "./Application";
import { asyncComponent } from "./asyncImport";
import { injectActions, injectHandlers } from "./inject";
import { LoadingState, setActions, setLoading, setLoadingDepthTime } from "./loading";
import { buildStore, getSingleStore, getRootState, getModuleState } from "./storeProxy";
import { BaseModuleState, Model, StoreState } from "./types";
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

export interface CallProxy<T> extends CallEffect {
  getResponse: () => T;
}

export interface CallPromise {
  <T>(fn: () => Promise<T>): CallProxy<T>;
  <T, R1, A1 extends R1>(fn: (req1: R1) => Promise<T>, arg1: A1): CallProxy<T>;
  <T, R1, R2, A1 extends R1, A2 extends R2>(fn: (req1: R1, req2: R2) => Promise<T>, arg1: A1, arg2: A2): CallProxy<T>;
  <T, R1, R2, R3, A1 extends R1, A2 extends R2, A3 extends R3>(fn: (req1: R1, req2: R2, req3: R3) => Promise<T>, arg1: A1, arg2: A2, arg3: A3): CallProxy<T>;
  <T, R1, R2, R3, R4, A1 extends R1, A2 extends R2, A3 extends R3, A4 extends R4>(fn: (req1: R1, req2: R2, req3: R3, req4: R4) => Promise<T>, arg1: A1, arg2: A2, arg3: A3, arg4: A4): CallProxy<T>;
  <T, R1, R2, R3, R4, R5, A1 extends R1, A2 extends R2, A3 extends R3, A4 extends R4, A5 extends R5>(fn: (req1: R1, req2: R2, req3: R3, req4: R4, req5: R5) => Promise<T>, arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5): CallProxy<T>;
}
export const callPromise: CallPromise = (fn: (...args) => any, ...rest) => {
  let response: any;
  const proxy = (...args) => {
    return fn(...args).then(
      res => {
        response = res;
        return response;
      },
      rej => {
        response = rej;
        throw rej;
      },
    );
  };
  const callEffect = (call as any)(proxy, ...rest);
  (callEffect as any).getResponse = () => {
    return response;
  };
  return callEffect;
};
export class BaseModuleActions<State extends BaseModuleState, RootState> {
  protected delay: typeof delay = delay;
  protected take: typeof take = take;
  protected fork: typeof fork = fork;
  protected cps: typeof cps = cps;
  protected put: typeof put = put;
  protected call: typeof call = call;
  protected callPromise: CallPromise = callPromise;
  protected routerActions = routerActions;
  constructor(protected readonly namespace: string, protected readonly initState: State) {}

  protected getState(): State {
    return getModuleState(this.namespace) as any;
  }
  protected getRootState(): RootState {
    return getRootState() as any;
  }
  [INIT_MODULE_ACTION_NAME](): State {
    return this.initState;
  }
  [LOADING_ACTION_NAME](payload: { [group: string]: string }): State {
    const state = this.getState() as any;
    return {
      ...state,
      loading: { ...state.loading, ...payload },
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
type ActionsIns<S, Ins> = { [K in keyof Ins]: Ins[K] extends () => S | IterableIterator<any> ? EmptyActionCreator : Ins[K] extends (data: infer P) => S | IterableIterator<any> ? ActionCreator<P> : never };
// function translateMap<S, Ins>(ins: Ins, isHandler: boolean = false) {
//   type Map = { [K in keyof Ins]: Ins[K] extends () => S | IterableIterator<any> ? EmptyActionCreator : Ins[K] extends (data: infer P) => S | IterableIterator<any> ? ActionCreator<P> : never };
//   const map = {};
//   for (const key in ins as any) {
//     if (ins[key]) {
//       map[key] = ins[key];
//       ins[key].__host__ = ins;
//       ins[key].__handler__ = isHandler;
//     }
//   }
//   return map as Map;
// }
type ActionReducer<State> = { [method: string]: (() => State | IterableIterator<any>)|((payload:any) => State | IterableIterator<any>) }
export function buildModel<S, A extends , H>(initState: S, actions: A, handlers: H): { actions: A extends { getState(): infer S } ? ActionsIns<A, S> : never; handlers: {} } {
  // const handlers = translateMap<S, H>(handlersIns, true) as any;
  // const actions = translateMap<S, A>(actionsIns);
  return { actions, handlers } as any;
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
    const action = actions[INIT_MODULE_ACTION_NAME]();
    const store = getSingleStore();
    if (store) {
      store.dispatch(action);
    } else {
      injectedModules.push(action);
    }
    return views;
  } else {
    throw new Error(`module: ${namespace} has exist!`);
  }
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
export { Action, LocationDescriptorObject, StoreState, BaseModuleState, RouterState };
export { asyncComponent, setLoadingDepthTime, setLoading, LoadingState, delayPromise };
export { ERROR_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME };
export { call, put };
