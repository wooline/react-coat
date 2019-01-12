import {ActionHandler, ActionHandlerList, ActionHandlerMap, isPromise, getModuleActionCreatorList, NSP, BaseModuleState, RootState, ModelStore, Model} from "./global";
import {BaseModuleHandlers} from "./actions";

export function exportModel<N extends string>(namespace: N, HandlersClass: {new (presetData?: any): BaseModuleHandlers<BaseModuleState, RootState, N>}): Model {
  return (store: ModelStore) => {
    const hasInjected = store.reactCoat.injectedModules[namespace];
    if (!hasInjected) {
      store.reactCoat.injectedModules[namespace] = true;
      const moduleState: BaseModuleState = store.getState()[namespace];
      const handlers = new HandlersClass(moduleState);
      (handlers as any).namespace = namespace;
      (handlers as any).store = store;
      const actions = injectActions(store, namespace, handlers as any);
      (handlers as any).actions = actions;
      if (!moduleState) {
        const initAction = actions.INIT((handlers as any).initState);
        const action = store.dispatch(initAction);
        if (isPromise(action)) {
          return action;
        } else {
          return Promise.resolve(void 0);
        }
      } else {
        return Promise.resolve(void 0);
      }
    } else {
      return Promise.resolve(void 0);
    }
  };
}
function bindThis(fun: ActionHandler, thisObj: any) {
  const newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(key => {
    newFun[key] = fun[key];
  });

  return newFun as ActionHandler;
}
function injectActions(store: ModelStore, namespace: string, handlers: ActionHandlerList) {
  for (const actionName in handlers) {
    if (typeof handlers[actionName] === "function") {
      let handler = handlers[actionName];
      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, handlers);
        const arr = actionName.split(NSP);
        if (arr[1]) {
          handler.__isHandler__ = true;
          transformAction(actionName, handler, namespace, handler.__isEffect__ ? store.reactCoat.effectMap : store.reactCoat.reducerMap);
        } else {
          handler.__isHandler__ = false;
          transformAction(namespace + NSP + actionName, handler, namespace, handler.__isEffect__ ? store.reactCoat.effectMap : store.reactCoat.reducerMap);
          addModuleActionCreatorList(namespace, actionName);
        }
      }
    }
  }
  return getModuleActionCreatorList(namespace);
}

function transformAction(actionName: string, action: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error(`Action duplicate or conflict : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = action;
}

function addModuleActionCreatorList(namespace: string, actionName: string) {
  const actions = getModuleActionCreatorList(namespace);
  if (!actions[actionName]) {
    actions[actionName] = payload => ({type: namespace + NSP + actionName, payload});
  }
}
