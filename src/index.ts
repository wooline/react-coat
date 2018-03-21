import { ComponentType } from "react";
import { Middleware } from "redux";
import { ErrorActionName, initModuleAction, InitModuleActionName, LoadingActionName, LocationChangeActionName } from "./actions";
import buildApp from "./Application";
import { asyncComponent } from "./asyncImport";
import { injectActions, injectHandlers } from "./inject";
import { LoadingState, setLoading } from "./loading";
import { buildStore, getStore, storeHistory } from "./storeProxy";
import { Model } from "./types";
import { isGenerator, setGenerator } from "./utils";

const injectedModules: { type: string }[] = [];
const hasInjected: { [moduleName: string]: boolean } = {};
const actionsProxy: { [moduleName: string]: { [action: string]: Function } } = {};

export function buildModule<T>(namespace: string) {
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

export interface BaseState {
  loading: {
    global: string;
  };
}

export function buildActionByReducer<T, S>(reducer: (data: T, moduleState: S, rootState: any) => S) {
  const fun = reducer as any;
  return fun as (data: T) => { type: string; data: T };
}
export function buildActionByEffect<T, S>(effect: (data: T, moduleState: S, rootState: any) => IterableIterator<any>) {
  const fun = setGenerator(effect);
  return fun as (data: T) => { type: string; data: T };
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
        group
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
    const selfInitAction = model.actions[InitModuleActionName] as Function;
    const selfInitHandler = model.handlers[namespace + "/" + InitModuleActionName] as undefined | Function;
    const locationChangeHandler = model.handlers[LocationChangeActionName] as undefined | Function;
    if (locationChangeHandler) {
      if (isGenerator(locationChangeHandler)) {
        if (selfInitHandler) {
          selfInitHandler["__LocationHandler__"] = locationChangeHandler;
        } else {
          model.handlers[namespace + "/" + InitModuleActionName] = locationChangeHandler;
          locationChangeHandler["__LocationHandler__"] = true;
        }
      } else {
        selfInitAction["__decorators__"] = locationChangeHandler["__decorators__"];
        selfInitAction["__LocationHandler__"] = locationChangeHandler;
      }
    }
    injectActions(namespace, model.actions);
    injectHandlers(namespace, model.handlers);
    const actions = getModuleActions(namespace);
    Object.keys(model.actions).forEach(key => {
      actions[key] = (data: any) => ({ type: namespace + "/" + key, data });
    });
    hasInjected[namespace] = true;
    const action = initModuleAction(namespace, model.state);
    const store = getStore();
    if (store) {
      store.dispatch(action);
    } else {
      injectedModules.push(action);
    }
  }
  return views;
}

export class BaseActions<S> {
  INIT = buildActionByReducer(function(data: S, moduleState: S, rootState: any): S {
    return data;
  });
  LOADING = buildActionByReducer(function(loading: { [group: string]: string }, moduleState: S, rootState: any): S {
    return {
      ...(moduleState as any),
      loading: { ...(moduleState as any).loading, ...loading }
    };
  });
}

export interface State {
  router: {
    location: {
      pathname: string;
      search: {};
      hash: string;
      key: string;
    };
  };
  project: {
    app: {
      loading: {
        global: string;
      };
    };
  };
}

export function createApp(view: ComponentType<any>, container: string, storeMiddlewares: Middleware[] = [], storeEnhancers: Function[] = []) {
  const store = buildStore(storeMiddlewares, storeEnhancers, injectedModules);
  buildApp(view, container, storeMiddlewares, storeEnhancers, store);
}
export { storeHistory, getStore, asyncComponent, setLoading, LoadingState };
export { ErrorActionName, InitModuleActionName, LoadingActionName, LocationChangeActionName };
