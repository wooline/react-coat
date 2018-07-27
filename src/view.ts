import { ActionHandler, ActionHandlerList, ActionHandlerMap, INIT_LOCATION_ACTION_NAME, INIT_MODULE_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME, MetaData, Model, NSP } from "./global";

const hasInjected: { [moduleName: string]: boolean } = {};

export function exportViews<T>(views: T, model: Model) {
  const namespace = model.namespace;
  if (!hasInjected[namespace]) {
    const locationChangeHandler = model.listeners[LOCATION_CHANGE_ACTION_NAME];
    if (locationChangeHandler) {
      model.listeners[namespace + NSP + INIT_LOCATION_ACTION_NAME] = locationChangeHandler;
    }
    const actionHandlerList = injectActions(namespace, model.actions as any);
    injectHandlers(namespace, model.listeners as any);
    const actions = getModuleActionCreatorList(namespace);
    Object.keys(actionHandlerList).forEach(key => {
      actions[key] = payload => ({ type: namespace + NSP + key, payload });
    });
    hasInjected[namespace] = true;
    const action = actions[INIT_MODULE_ACTION_NAME]();
    const store = MetaData.singleStore;
    if (store) {
      store.dispatch(action);
    } else {
      MetaData.injectedModules.push(action);
    }
    return views;
  } else {
    throw new Error(`module: ${namespace} has exist!`);
  }
}
export function exportModule<T>(namespace: string) {
  const actions: T = getModuleActionCreatorList(namespace) as any;
  // if (window["Proxy"]) {
  //   actions = new window["Proxy"](
  //     {},
  //     {
  //       get: (target: {}, key: string) => {
  //         return (data: any) => ({ type: namespace + "/" + key, data });
  //       }
  //     }
  //   );
  // } else {
  //   actions = getModuleActions(namespace) as any;
  // }
  return {
    namespace,
    actions,
  };
}
function getModuleActionCreatorList(namespace: string) {
  if (MetaData.actionCreatorMap[namespace]) {
    return MetaData.actionCreatorMap[namespace];
  } else {
    const obj = {};
    MetaData.actionCreatorMap[namespace] = obj;
    return obj;
  }
}
function injectActions(namespace: string, actions: ActionHandlerList) {
  const list: ActionHandlerList = {};
  for (const actionName in actions) {
    if (actions[actionName] && typeof actions[actionName] === "function") {
      const fun = actions[actionName];
      fun.__host__ = actions;
      fun.__isHandler__ = false;
      list[actionName] = fun;
      transformAction(namespace + NSP + actionName, fun, namespace, fun.__isGenerator__ ? MetaData.effectMap : MetaData.reducerMap);
    }
  }
  return list;
}
function injectHandlers(listenerModule: string, handlers: ActionHandlerList) {
  const list: ActionHandlerList = {};
  for (const handlerName in handlers) {
    if (handlers[handlerName] && typeof handlers[handlerName] === "function") {
      const fun = handlers[handlerName];
      fun.__host__ = handlers;
      fun.__isHandler__ = true;
      list[handlerName] = fun;
      transformAction(handlerName, fun, listenerModule, fun.__isGenerator__ ? MetaData.effectMap : MetaData.reducerMap);
    }
  }
  return list;
}
function transformAction(actionName: string, action: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error(`Action duplicate or conflict : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = action;
  //   if (actionHandlerMap === MetaData.effectMap) {
  //     pushSagaName(actionName);
  //   }
}
