import { RouterState } from "connected-react-router";
import { History } from "history";
import { ComponentType } from "react";
import { Action, AnyAction, Store } from "redux";
import { TaskCounterState as LoadingState } from "./sprite";
export interface SingleStore {
  dispatch: (action: { type: string }) => void;
}
export interface ModuleState {
  loading: {
    global: LoadingState;
  };
}
export interface RootState<P extends { [moduleName: string]: ModuleState } = {}> {
  router: RouterState;
  project: P;
}

export interface ActionCreatorMap {
  [moduleName: string]: { [actionName: string]: (payload?) => Action };
}

export interface ActionHandler {
  __host__: any;
  __isGenerator__: boolean;
  __isHandler__: boolean;
  __decorators__: Array<[any, any, any]>;
  (payload?): any;
}
export interface ActionHandlerList {
  [actionName: string]: ActionHandler;
}
export interface ActionHandlerMap {
  [actionName: string]: { [moduleName: string]: ActionHandler };
}
export interface Model {
  namespace: string;
  actions: { [actionName: string]: (payload?) => any };
  listeners: { [actionName: string]: (payload?) => any };
}
export interface Views {
  [viewName: string]: ComponentType<any>;
}
export interface ModuleViews {
  default: Views;
}
export const ERROR_ACTION_NAME = "@@framework/ERROR";
export const LOADING_ACTION_NAME = "LOADING";
export const INIT_MODULE_ACTION_NAME = "INIT";
export const INIT_LOCATION_ACTION_NAME = "@@router/LOCATION_CHANGE";
export const LOCATION_CHANGE_ACTION_NAME = "@@router/LOCATION_CHANGE";
export const NSP = "/";

export const MetaData: {
  history: History;
  singleStore: SingleStore;
  rootState: RootState;
  actionCreatorMap: ActionCreatorMap;
  injectedModules: Action[];
  reducerMap: ActionHandlerMap;
  effectMap: ActionHandlerMap;
} = {
  history: null,
  reducerMap: {},
  effectMap: {},
  injectedModules: [],
  actionCreatorMap: {},
  rootState: null,
  singleStore: null,
};

export function errorAction(error: any) {
  return {
    type: ERROR_ACTION_NAME,
    error,
  };
}

export function initLocationAction(namespace: string, payload: any) {
  return {
    type: namespace + NSP + INIT_LOCATION_ACTION_NAME,
    payload,
  };
}
export function delayPromise(second: number) {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value;
    descriptor.value = (...args) => {
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
export function getStore<S = any, A extends Action = AnyAction>(): Store<S, A> {
  return MetaData.singleStore as any;
}
export function getHistory(): History {
  return MetaData.history;
}
