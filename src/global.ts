import {RouterState} from "connected-react-router";
import {ComponentType} from "react";
import {History} from "history";
import {Store} from "redux";
import {LoadingState} from "./loading";
export interface ModelStore extends Store {
  reactCoat: {
    history: History;
    prevState: {[key: string]: any};
    currentState: {[key: string]: any};
    reducerMap: ReducerMap;
    effectMap: EffectMap;
    injectedModules: {[namespace: string]: boolean};
    routerInited: boolean;
    currentViews: CurrentViews;
  };
}
export interface CurrentViews {
  [moduleName: string]: {[viewName: string]: number};
}
export interface BaseModuleState {
  isModule?: boolean;
  loading?: {[key: string]: LoadingState};
}

export function isModuleState(module: any): module is BaseModuleState {
  return module.isModule;
}

export type GetModule<M extends Module = Module> = () => M | Promise<M>;

export interface ModuleGetter {
  [moduleName: string]: GetModule;
}

export type ReturnModule<T extends () => any> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : Module;

type ModuleStates<M extends any> = M["model"]["initState"];
type ModuleViews<M extends any> = {[key in keyof M["views"]]?: number};

export type RootState<G extends ModuleGetter = {}, R = RouterState> = {
  router: R;
  views: {[key in keyof G]?: ModuleViews<ReturnModule<G[key]>>};
} & {[key in keyof G]?: ModuleStates<ReturnModule<G[key]>>};

export interface Action {
  type: string;
  priority?: string[];
  payload?: any;
}
export interface ActionCreatorMap {
  [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
  [actionName: string]: ActionCreator;
}
export type ActionCreator = (payload?: any) => Action;

export interface ActionHandler {
  __actionName__: string;
  __isReducer__?: boolean;
  __isEffect__?: boolean;
  __isHandler__?: boolean;
  __decorators__?: Array<[(action: Action, moduleName: string, effectResult: Promise<any>) => any, null | ((status: "Rejected" | "Resolved", beforeResult: any, effectResult: any) => void)]>;
  __decoratorResults__?: any[];
  (payload?: any): any;
}

export interface ReducerHandler extends ActionHandler {
  (payload?: any): BaseModuleState;
}
export interface EffectHandler extends ActionHandler {
  (payload?: any): Promise<any>;
}
export interface ActionHandlerList {
  [actionName: string]: ActionHandler;
}
export interface ActionHandlerMap {
  [actionName: string]: {[moduleName: string]: ActionHandler};
}
export interface ReducerMap extends ActionHandlerMap {
  [actionName: string]: {[moduleName: string]: ReducerHandler};
}
export interface EffectMap extends ActionHandlerMap {
  [actionName: string]: {[moduleName: string]: EffectHandler};
}
export const LOADING = "LOADING";
export const ERROR = "@@framework/ERROR";
export const INIT = "INIT";
export const LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
export const VIEW_INVALID = "@@framework/VIEW_INVALID";
export const NSP = "/";

export const MetaData: {
  isBrowser: boolean;
  isDev: boolean;
  actionCreatorMap: ActionCreatorMap;
  clientStore: ModelStore;
  appModuleName: string;
} = {
  isBrowser: typeof window === "object",
  isDev: process.env.NODE_ENV !== "production",
  actionCreatorMap: {},
  clientStore: null as any,
  appModuleName: null as any,
};

export function isPromise(data: any): data is Promise<any> {
  return typeof data["then"] === "function";
}
export interface Module<M extends Model = Model, VS extends {[key: string]: ComponentType<any>} = {[key: string]: ComponentType<any>}> {
  model: M;
  views: VS;
}

export function errorAction(error: any) {
  return {
    type: ERROR,
    error,
  };
}

export function viewInvalidAction(currentViews: CurrentViews) {
  return {
    type: VIEW_INVALID,
    currentViews,
  };
}
export function setAppModuleName(moduleName: string) {
  MetaData.appModuleName = moduleName;
}

export function delayPromise(second: number) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value;
    descriptor.value = (...args: any[]) => {
      const delay = new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, second * 1000);
      });
      return Promise.all([delay, fun.apply(target, args)]).then(items => {
        return items[1];
      });
    };
  };
}

export function getModuleActionCreatorList(namespace: string) {
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
  if (MetaData.actionCreatorMap[namespace]) {
    return MetaData.actionCreatorMap[namespace];
  } else {
    const obj = {};
    MetaData.actionCreatorMap[namespace] = obj;
    return obj;
  }
}

export interface Model<ModuleState = BaseModuleState> {
  namespace: string;
  initState: ModuleState;
  (store: ModelStore): Promise<any>;
}

export function exportModule<T extends ActionCreatorList>(namespace: string) {
  const actions: T = getModuleActionCreatorList(namespace) as T;
  return {
    namespace,
    actions,
  };
}
export function warning(...args: any[]) {
  if (MetaData.isDev) {
    console.warn(...args);
  }
}
