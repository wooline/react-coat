import { reducersMap, sagaNames, sagasMap } from "./storeProxy";
import { NSP } from "./actions";
import { ActionHandlerList, ActionHandlerMap, ActionHandler } from "./types";
import { isGenerator } from "./utils";

const sagaNameMap = {};

function pushSagaName(actionName: string) {
  if (!sagaNameMap[actionName]) {
    sagaNameMap[actionName] = true;
    sagaNames.push(actionName);
  }
}

function transformAction(actionName: string, action: ActionHandler<any>, listenerModule: string, actionHandlerMap: ActionHandlerMap<any>) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error(`Action duplicate or conflict : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = action;
  if (actionHandlerMap === sagasMap) {
    pushSagaName(actionName);
  }
}

export function injectActions(namespace: string, actions: ActionHandlerList<any>) {
  const list: ActionHandlerList<any> = {};
  for (const actionName in actions) {
    if (actions[actionName] && typeof actions[actionName] === "function") {
      const fun = actions[actionName];
      fun.__host__ = actions;
      fun.__isHandler__ = false;
      list[actionName] = fun;
      transformAction(namespace + NSP + actionName, fun, namespace, isGenerator(fun) ? sagasMap : reducersMap);
    }
  }
  return list;
}
export function injectHandlers(listenerModule: string, handlers: ActionHandlerList<any>) {
  const list: ActionHandlerList<any> = {};
  for (const handlerName in handlers) {
    if (handlers[handlerName] && typeof handlers[handlerName] === "function") {
      const fun = handlers[handlerName];
      fun.__host__ = handlers;
      fun.__isHandler__ = true;
      list[handlerName] = fun;
      transformAction(handlerName, fun, listenerModule, isGenerator(fun) ? sagasMap : reducersMap);
    }
  }
  return list;
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
