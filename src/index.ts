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

export function buildFacade(namespace: string) {
  // const proxy = actionsMap[namespace].reduce((prev, key) => {
  //   prev[key] = true;
  //   return prev;
  // }, {});
  // const actions = new Proxy(proxy, {
  //   get: (target: {}, key: string) => {
  //     return (data: any) => ({ type: namespace + "/" + key, data });
  //   }
  // }) as T;
  const actions = getModuleActions(namespace);
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
  return fun as (data: T) => { type: string; data: T };
}

export function buildModel<S, A, H>(state: S, initActions: A, initHandlers: H) {
  const actions = extendActions(state, initActions);
  const handlers = extendHandlers(state, initHandlers);
  return { state, actions, handlers };
}

export function injectComponents<T>(namespace: string, components: T, module: Model) {
  if (!hasInjected[namespace]) {
    injectActions(namespace, module.actions);
    injectHandlers(namespace, module.handlers);
    const actions = getModuleActions(namespace);
    Object.keys(module.actions).forEach(key => {
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
  return components;
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

export function createApp(component: ComponentType<any>, container: string, storeMiddlewares: Middleware[] = [], storeEnhancers: Function[] = []) {
  const store = buildStore(storeMiddlewares, storeEnhancers, injectedModules);
  buildApp(component, container, storeMiddlewares, storeEnhancers, store);
}
export { storeHistory, getStore, asyncComponent, setLoading, LoadingState, State };
