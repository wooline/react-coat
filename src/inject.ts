import { Actions, ActionsMap, Module } from "./types.d";

let sagasMap: ActionsMap;
let reducersMap: ActionsMap;
let sagaNames: string[];

const sagaNameMap = {};

export default function(
  _reducersMap: ActionsMap,
  _sagasMap: ActionsMap,
  _sagaNames: string[]
) {
  reducersMap = _reducersMap;
  sagasMap = _sagasMap;
  sagaNames = _sagaNames;
  return injectModule;
}

function pushSagaName(actionName: string) {
  if (!sagaNameMap[actionName]) {
    sagaNameMap[actionName] = true;
    sagaNames.push(actionName);
  }
}

function transformAction(
  actionName: string,
  action: Function,
  listenerModule: string,
  actionsMap: ActionsMap
) {
  if (!actionsMap[actionName]) {
    actionsMap[actionName] = {};
  }
  actionsMap[actionName][listenerModule] = action;
  if (actionsMap === sagasMap) {
    pushSagaName(actionName);
  }
}

function injectActions(namespace: string, actions: Actions) {
  Object.keys(actions).forEach(actionName => {
    if (actionName.substr(0, 1) === "_") {
      transformAction(
        namespace + "/" + actionName,
        actions[actionName],
        namespace,
        sagasMap
      );
    } else {
      transformAction(
        namespace + "/" + actionName,
        actions[actionName],
        namespace,
        reducersMap
      );
    }
  });
}

function injectHandlers(listenerModule: string, handlers: Actions) {
  Object.keys(handlers).forEach(handlerName => {
    if (handlerName.substr(0, 1) === "_") {
      transformAction(
        handlerName.substr(1),
        handlers[handlerName],
        listenerModule,
        sagasMap
      );
    } else {
      transformAction(
        handlerName,
        handlers[handlerName],
        listenerModule,
        reducersMap
      );
    }
  });
}

function injectModule(module: Module) {
  injectActions(module.namespace, module.actions);
  injectHandlers(module.namespace, module.handlers);
}
