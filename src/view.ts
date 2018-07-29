import { ActionCreatorList, ActionHandler, ActionHandlerList, ActionHandlerMap, INIT, INIT_LOCATION, LOCATION_CHANGE, MetaData, Model, NSP, START } from "./global";

const hasInjected: { [moduleName: string]: boolean } = {};

export function exportViews<T>(views: T, model: Model) {
  const namespace = model.namespace;
  if (!hasInjected[namespace]) {
    const locationChangeHandler = model.actions[LOCATION_CHANGE];
    if (locationChangeHandler) {
      model.actions[namespace + NSP + INIT_LOCATION] = locationChangeHandler;
    }
    const actions = getModuleActionCreatorList(namespace);
    injectActions(namespace, model.actions, actions);
    hasInjected[namespace] = true;
    const initAction = actions[INIT]();
    const startAction = actions[START]();
    const store = MetaData.singleStore;
    if (store) {
      store.dispatch(initAction);
      store.dispatch(startAction);
    } else {
      MetaData.injectedModules.push(initAction, startAction);
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
function bindThis(fun: ActionHandler, thisObj) {
  const newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(key => {
    newFun[key] = fun[key];
  });

  return newFun as ActionHandler;
}
function injectActions(namespace: string, actions: ActionHandlerList, list: ActionCreatorList) {
  for (const actionName in actions) {
    if (typeof actions[actionName] === "function") {
      let handler = actions[actionName];
      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, actions);
        const arr = actionName.split(NSP);
        if (arr[1]) {
          handler.__isHandler__ = true;
          transformAction(actionName, handler, namespace, handler.__isEffect__ ? MetaData.effectMap : MetaData.reducerMap);
        } else {
          handler.__isHandler__ = false;
          transformAction(namespace + NSP + actionName, handler, namespace, handler.__isEffect__ ? MetaData.effectMap : MetaData.reducerMap);
          list[actionName] = payload => ({ type: namespace + NSP + actionName, payload });
          (actions as ActionCreatorList)[actionName] = list[actionName];
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
