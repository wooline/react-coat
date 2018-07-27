import { ActionHandler, ActionHandlerList, ActionHandlerMap, INIT_LOCATION, INIT, LOCATION_CHANGE, MetaData, Model, NSP } from "./global";
import { Action } from "redux";

const hasInjected: { [moduleName: string]: boolean } = {};

export function exportViews<T>(views: T, model: Model) {
  const namespace = model.namespace;
  if (!hasInjected[namespace]) {
    const locationChangeHandler = model.actions[LOCATION_CHANGE];
    if (locationChangeHandler) {
      model.actions[namespace + NSP + INIT_LOCATION] = locationChangeHandler;
    }
    const actions = getModuleActionCreatorList(namespace);
    injectActions(namespace, model.actions as any, actions);
    hasInjected[namespace] = true;
    const action = actions[INIT]();
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
function injectActions(namespace: string, actions: ActionHandlerList, list: { [actionName: string]: (payload?) => Action }) {
  for (const actionName in actions) {
    if (typeof actions[actionName] === "function") {
      const fun = actions[actionName];
      if (fun.__isReducer__ || fun.__isEffect__) {
        fun.__host__ = actions;
        const arr = actionName.split(NSP);
        if (arr[1]) {
          fun.__isHandler__ = true;
          transformAction(actionName, fun, namespace, fun.__isEffect__ ? MetaData.effectMap : MetaData.reducerMap);
        } else {
          fun.__isHandler__ = false;
          transformAction(namespace + NSP + actionName, fun, namespace, fun.__isEffect__ ? MetaData.effectMap : MetaData.reducerMap);
          list[actionName] = payload => ({ type: namespace + NSP + actionName, payload });
          actions[actionName] = list[actionName] as any;
        }
      }
    }
  }
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
