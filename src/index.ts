import { ComponentType } from "react";
import { Middleware } from "redux";
import { initModuleAction } from "./actions";
import buildApp from "./Application";
import { asyncComponent } from "./asyncImport";
import { injectActions, injectHandlers } from "./inject";
import { LoadingState, setLoading } from "./loading";
import { buildStore, getStore, State, storeHistory } from "./storeProxy";
import { Model } from "./types";
import { assignObject } from "./utils";

const injectedModules: { type: string }[] = [];
const hasInjected: { [moduleName: string]: boolean } = {};
const actionsProxy: { [moduleName: string]: { [action: string]: Function } } = {};

export function buildFacade<T>(namespace: string) {
  let actions: T;
  if (window["Proxy"]) {
    actions = new window["Proxy"](
      {},
      {
        get: (target: {}, key: string) => {
          return (data: any) => ({ type: namespace + "/" + key, data });
        }
      }
    );
  } else {
    actions = getModuleActions(namespace) as any;
  }
  return {
    namespace,
    actions
  };
}

function getModuleActions(namespace: string) {
  const actions = actionsProxy[namespace] || {};
  actionsProxy[namespace] = actions;
  return actions;
}

export function buildState<S>(initState: S) {
  const state = initState as any;
  if (!state.loading) {
    state.loading = {};
  }
  state.loading.global = "";
  return state as S & {
    loading: {
      global: string;
    };
  };
}

export function buildActionByReducer<T, S>(reducer: (data: T, moduleState: S, rootState: any) => S) {
  const fun = reducer as any;
  return fun as (data: T) => { type: string; data: T };
}
export function buildActionByEffect<T, S>(effect: (data: T, moduleState: S, rootState: any) => IterableIterator<any>) {
  const fun = effect as any;
  fun.__effect__ = true;
  return fun as (data: T) => { type: string; data: T };
}
export function buildHandlerByReducer<T, S>(reducer: (data: T, moduleState: S, rootState: any) => S) {
  const fun = reducer as any;
  return fun as (data: T) => { type: string; data: T };
}
export function buildHandlerByEffect<T, S>(effect: (data: T, moduleState: S, rootState: any) => IterableIterator<any>) {
  const fun = effect as any;
  fun.__effect__ = true;
  return fun as (data: T) => { type: string; data: T };
}
export function buildModel<S, A, H>(state: S, initActions: A, initHandlers: H) {
  const actions = extendActions(state, initActions);
  const handlers = extendHandlers(state, initHandlers);
  return { state, actions, handlers };
}

export function buildViews<T>(namespace: string, views: T, model: Model) {
  if (!hasInjected[namespace]) {
    injectActions(namespace, model.actions);
    injectHandlers(namespace, model.handlers);
    const actions = getModuleActions(namespace);
    Object.keys(model.actions).forEach(key => {
      actions[key] = (data: any) => ({ type: namespace + "/" + key, data });
    });
    hasInjected[namespace] = true;
    const action = initModuleAction(namespace);
    const store = getStore();
    if (store) {
      store.dispatch(action);
    } else {
      injectedModules.push(action);
    }
  }
  return views;
}

function extendActions<S, R>(initState: S, actions: R) {
  return assignObject(
    {
      INIT: buildActionByReducer(function(data: any, moduleState: S = initState, rootState?: any): S {
        return initState;
      }),
      LOADING: buildActionByReducer(function(loading: { [group: string]: string }, moduleState: S = initState, rootState?: any): S {
        return {
          ...(moduleState as any),
          loading: { ...(moduleState as any).loading, ...loading }
        };
      })
    },
    actions
  );
}

function extendHandlers<S, R>(initState: S, handlers: R) {
  return assignObject({}, handlers);
}

export function createApp(view: ComponentType<any>, container: string, storeMiddlewares: Middleware[] = [], storeEnhancers: Function[] = []) {
  const store = buildStore(storeMiddlewares, storeEnhancers, injectedModules);
  buildApp(view, container, storeMiddlewares, storeEnhancers, store);
}
export { storeHistory, getStore, asyncComponent, setLoading, LoadingState, State };
