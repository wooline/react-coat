import { ComponentType } from "react";

import { SagaIterator } from "redux-saga";
export interface SingleStore {
  dispatch: (action: { type: string }) => void;
}

export interface ActionHandler<S> {
  __host__: any;
  __isGenerator__: boolean;
  __isHandler__: boolean;
  __decorators__: Array<[any, any]>;
  (payload?): S | SagaIterator;
}
export interface ActionHandlerList<S> {
  [actionName: string]: ActionHandler<S>;
}
export interface ActionHandlerMap<S> {
  [actionName: string]: { [moduleName: string]: ActionHandler<S> };
}

export interface Views {
  [viewName: string]: ComponentType<any>;
}

export interface Model<S> {
  namespace: string;
  actions: ActionHandlerList<S>;
  handlers: ActionHandlerList<S>;
}

export interface ModuleViews {
  default: Views;
}
