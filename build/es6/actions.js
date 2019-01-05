import * as tslib_1 from "tslib";
import { routerActions } from "connected-react-router";
import { getModuleActionCreatorList, MetaData } from "./global";
import { setLoading } from "./loading";
export class BaseModuleHandlers {
    constructor(initState, presetData) {
        this.namespace = "";
        this.store = null;
        this.actions = null;
        this.routerActions = routerActions;
        initState.isModule = true;
        this.initState = initState;
    }
    get state() {
        return this.store.reactCoat.prevState[this.namespace];
    }
    get rootState() {
        return this.store.reactCoat.prevState;
    }
    get currentState() {
        return this.store.reactCoat.currentState[this.namespace];
    }
    get currentRootState() {
        return this.store.reactCoat.currentState;
    }
    dispatch(action) {
        return this.store.dispatch(action);
    }
    callThisAction(handler, ...rest) {
        const actions = getModuleActionCreatorList(this.namespace);
        return actions[handler.__actionName__](rest[0]);
    }
    INIT(payload) {
        return payload;
    }
    UPDATE(payload) {
        return payload;
    }
    LOADING(payload) {
        const state = this.state;
        if (!state) {
            return state;
        }
        return Object.assign({}, state, { loading: Object.assign({}, state.loading, payload) });
    }
    updateState(payload) {
        this.dispatch(this.callThisAction(this.UPDATE, Object.assign({}, this.state, payload)));
    }
}
tslib_1.__decorate([
    reducer
], BaseModuleHandlers.prototype, "INIT", null);
tslib_1.__decorate([
    reducer
], BaseModuleHandlers.prototype, "UPDATE", null);
tslib_1.__decorate([
    reducer
], BaseModuleHandlers.prototype, "LOADING", null);
export function logger(before, after) {
    return (target, key, descriptor) => {
        const fun = descriptor.value;
        if (!fun.__decorators__) {
            fun.__decorators__ = [];
        }
        fun.__decorators__.push([before, after]);
    };
}
export function effect(loadingForGroupName, loadingForModuleName) {
    if (loadingForGroupName === undefined) {
        loadingForGroupName = "global";
        loadingForModuleName = MetaData.appModuleName;
    }
    return (target, key, descriptor) => {
        const fun = descriptor.value;
        fun.__actionName__ = key;
        fun.__isEffect__ = true;
        descriptor.enumerable = true;
        if (loadingForGroupName) {
            const before = (curAction, moduleName, promiseResult) => {
                if (MetaData.isBrowser) {
                    if (!loadingForModuleName) {
                        loadingForModuleName = moduleName;
                    }
                    setLoading(promiseResult, loadingForModuleName, loadingForGroupName);
                }
            };
            if (!fun.__decorators__) {
                fun.__decorators__ = [];
            }
            fun.__decorators__.push([before, null]);
        }
        return descriptor;
    };
}
export function reducer(target, key, descriptor) {
    const fun = descriptor.value;
    fun.__actionName__ = key;
    fun.__isReducer__ = true;
    descriptor.enumerable = true;
    return descriptor;
}
