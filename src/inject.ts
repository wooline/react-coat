import { reducersMap, sagaNames, sagasMap } from "./storeProxy";
import { Actions, ActionsMap } from "./types";

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
  actionsMap[actionName][listenerModule] = action;
  if (actionsMap === sagasMap) {
    pushSagaName(actionName);
  }
}

export function injectActions(namespace: string, actions: Actions) {
  Object.keys(actions).forEach(actionName => {
    if (actionName.substr(0, 1) === "_") {
      transformAction(namespace + "/" + actionName, actions[actionName], namespace, sagasMap);
    } else {
      transformAction(namespace + "/" + actionName, actions[actionName], namespace, reducersMap);
    }
  });
}

export function injectHandlers(listenerModule: string, handlers: Actions) {
  Object.keys(handlers).forEach(handlerName => {
    if (handlerName.substr(0, 1) === "_") {
      transformAction(handlerName.substr(1), handlers[handlerName], listenerModule, sagasMap);
    } else {
      transformAction(handlerName, handlers[handlerName], listenerModule, reducersMap);
    }
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
