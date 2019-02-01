import { isPromise, getModuleActionCreatorList, NSP } from "./global";
export function exportModel(namespace, HandlersClass, initState) {
    const fun = (store) => {
        const hasInjected = store.reactCoat.injectedModules[namespace];
        if (!hasInjected) {
            store.reactCoat.injectedModules[namespace] = true;
            const moduleState = store.getState()[namespace];
            const handlers = new HandlersClass(initState, moduleState);
            handlers.namespace = namespace;
            handlers.store = store;
            const actions = injectActions(store, namespace, handlers);
            handlers.actions = actions;
            if (!moduleState) {
                const initAction = actions.INIT(handlers.initState);
                const action = store.dispatch(initAction);
                if (isPromise(action)) {
                    return action;
                }
                else {
                    return Promise.resolve(void 0);
                }
            }
            else {
                return Promise.resolve(void 0);
            }
        }
        else {
            return Promise.resolve(void 0);
        }
    };
    fun.namespace = namespace;
    fun.initState = initState;
    return fun;
}
function bindThis(fun, thisObj) {
    const newFun = fun.bind(thisObj);
    Object.keys(fun).forEach(key => {
        newFun[key] = fun[key];
    });
    return newFun;
}
function injectActions(store, namespace, handlers) {
    for (const actionName in handlers) {
        if (typeof handlers[actionName] === "function") {
            let handler = handlers[actionName];
            if (handler.__isReducer__ || handler.__isEffect__) {
                handler = bindThis(handler, handlers);
                const arr = actionName.split(NSP);
                if (arr[1]) {
                    handler.__isHandler__ = true;
                    transformAction(actionName, handler, namespace, handler.__isEffect__ ? store.reactCoat.effectMap : store.reactCoat.reducerMap);
                }
                else {
                    handler.__isHandler__ = false;
                    transformAction(namespace + NSP + actionName, handler, namespace, handler.__isEffect__ ? store.reactCoat.effectMap : store.reactCoat.reducerMap);
                    addModuleActionCreatorList(namespace, actionName);
                }
            }
        }
    }
    return getModuleActionCreatorList(namespace);
}
function transformAction(actionName, action, listenerModule, actionHandlerMap) {
    if (!actionHandlerMap[actionName]) {
        actionHandlerMap[actionName] = {};
    }
    if (actionHandlerMap[actionName][listenerModule]) {
        throw new Error(`Action duplicate or conflict : ${actionName}.`);
    }
    actionHandlerMap[actionName][listenerModule] = action;
}
function addModuleActionCreatorList(namespace, actionName) {
    const actions = getModuleActionCreatorList(namespace);
    if (!actions[actionName]) {
        actions[actionName] = payload => ({ type: namespace + NSP + actionName, payload });
    }
}
