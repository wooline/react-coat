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
  actions: Actions;
  handlers: Actions;
}

export interface ModuleViews {
  default: Views;
}
