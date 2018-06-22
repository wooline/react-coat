import { ComponentType } from "react";

export interface SingleStore {
  dispatch: (action: { type: string }) => void;
}

export interface ActionsMap {
  [action: string]: { [module: string]: Function };
}

export type Actions =
  | {
      [action: string]: Function;
    }
  | {};

export interface Views {
  [viewName: string]: ComponentType<any>;
}

export interface Model {
  state: {};
  actions: Actions;
  handlers: Actions;
}

export interface ModuleViews {
  default: Views;
}

export interface ActionData<P = any, M = any, R = any> {
  payload: P;
  moduleState: M;
  rootState: R;
}
