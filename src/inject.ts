import { reducersMap, sagaNames, sagasMap } from "./storeProxy";
import { Actions, ActionsMap } from "./types";
import { isGenerator } from "./utils";

const sagaNameMap = {};

function pushSagaName(actionName: string) {
  if (!sagaNameMap[actionName]) {
    sagaNameMap[actionName] = true;
    sagaNames.push(actionName);
  }
}

function transformAction(actionName: string, action: Function, listenerModule: string, actionsMap: ActionsMap) {
  if (!actionsMap[actionName]) {
    actionsMap[actionName] = {};
  }
  if (actionsMap[actionName][listenerModule]) {
    throw new Error(`Action duplicate or conflict : ${actionName}.`);
  }
  actionsMap[actionName][listenerModule] = action;
  if (actionsMap === sagasMap) {
    pushSagaName(actionName);
  }
}

export function injectActions(namespace: string, actions: Actions) {
  Object.keys(actions).forEach(actionName => {
    transformAction(actionName, actions[actionName], namespace, isGenerator(actions[actionName]) ? sagasMap : reducersMap);
  });
}

export interface BaseState {
  loading: {
    global: string;
  };
}
export interface BaseAction {
  INIT(data: any, moduleState?: any, rootState?: any): any;
  LOADING(loading: { [group: string]: string }, moduleState?: any, rootState?: any): any;
}
export interface BaseHandlers {}
