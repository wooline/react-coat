import { ComponentType } from 'react';

export type ActionsMap = { [action: string]: { [module: string]: Function } };
export type Actions = { [action: string]: Function } | {};

export interface Module {
  namespace: string;
  components: { [componentName: string]: ComponentType<any> };
  actions: Actions;
  handlers: Actions;
}
