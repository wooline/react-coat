import { RouterState } from "connected-react-router";
import { History } from "history";
import { Action, AnyAction, Store } from "redux";
export interface SingleStore {
  dispatch: (action: { type: string }) => void;
}
export interface BaseModuleState {
  loading: {};
}
export interface RootState<P = {}> {
  router: RouterState;
  project: P;
}

export interface ActionCreatorMap {
  [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
  [actionName: string]: ActionCreator;
}
export type ActionCreator = (payload?) => Action;

export interface ActionHandler {
  __actionName__: string;
  __isReducer__?: boolean;
  __isEffect__?: boolean;
  __isHandler__?: boolean;
  __decorators__?: Array<[(action: Action, moduleName: string) => any, any, any]>;
  (payload?): any;
}

export interface ActionHandlerList {
  [actionName: string]: ActionHandler;
}
export interface ActionHandlerMap {
  [actionName: string]: { [moduleName: string]: ActionHandler };
}

export const ERROR = "@@framework/ERROR";

export const INIT_LOCATION = "@@router/LOCATION_CHANGE";
export const LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
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
  rootState: { project: {}, router: null },
  singleStore: null,
};

export function errorAction(error: any) {
  return {
    type: ERROR,
    error,
  };
}

export function initLocationAction(namespace: string, payload: any) {
  return {
    type: namespace + NSP + INIT_LOCATION,
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
export function getModuleActionCreatorList(namespace: string) {
  if (MetaData.actionCreatorMap[namespace]) {
    return MetaData.actionCreatorMap[namespace];
  } else {
    const obj = {};
    MetaData.actionCreatorMap[namespace] = obj;
    return obj;
  }
}
