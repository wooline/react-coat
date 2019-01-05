import { isPromise, getModuleActionCreatorList, NSP } from "./global";
export function exportModel(namespace, HandlersClass) {
    return function (store) {
        var hasInjected = store.reactCoat.injectedModules[namespace];
        if (!hasInjected) {
            store.reactCoat.injectedModules[namespace] = true;
            var moduleState = store.getState()[namespace];
            var handlers = new HandlersClass(moduleState);
            handlers.namespace = namespace;
            handlers.store = store;
            var actions = injectActions(store, namespace, handlers);
            handlers.actions = actions;
            if (!moduleState) {
                var initAction = actions.INIT(handlers.initState);
                var action = store.dispatch(initAction);
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
}
function bindThis(fun, thisObj) {
    var newFun = fun.bind(thisObj);
    Object.keys(fun).forEach(function (key) {
        newFun[key] = fun[key];
    });
    return newFun;
}
function injectActions(store, namespace, handlers) {
    for (var actionName in handlers) {
        if (typeof handlers[actionName] === "function") {
            var handler = handlers[actionName];
            if (handler.__isReducer__ || handler.__isEffect__) {
                handler = bindThis(handler, handlers);
                var arr = actionName.split(NSP);
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
        throw new Error("Action duplicate or conflict : " + actionName + ".");
    }
    actionHandlerMap[actionName][listenerModule] = action;
}
function addModuleActionCreatorList(namespace, actionName) {
    var actions = getModuleActionCreatorList(namespace);
    if (!actions[actionName]) {
        actions[actionName] = function (payload) { return ({ type: namespace + NSP + actionName, payload: payload }); };
    }
}
