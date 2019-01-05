"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var connected_react_router_1 = require("connected-react-router");
var global_1 = require("./global");
var loading_1 = require("./loading");
var BaseModuleHandlers = (function () {
    function BaseModuleHandlers(initState, presetData) {
        this.namespace = "";
        this.store = null;
        this.actions = null;
        this.routerActions = connected_react_router_1.routerActions;
        initState.isModule = true;
        this.initState = initState;
    }
    Object.defineProperty(BaseModuleHandlers.prototype, "state", {
        get: function () {
            return this.store.reactCoat.prevState[this.namespace];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseModuleHandlers.prototype, "rootState", {
        get: function () {
            return this.store.reactCoat.prevState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseModuleHandlers.prototype, "currentState", {
        get: function () {
            return this.store.reactCoat.currentState[this.namespace];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseModuleHandlers.prototype, "currentRootState", {
        get: function () {
            return this.store.reactCoat.currentState;
        },
        enumerable: true,
        configurable: true
    });
    BaseModuleHandlers.prototype.dispatch = function (action) {
        return this.store.dispatch(action);
    };
    BaseModuleHandlers.prototype.callThisAction = function (handler) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        var actions = global_1.getModuleActionCreatorList(this.namespace);
        return actions[handler.__actionName__](rest[0]);
    };
    BaseModuleHandlers.prototype.INIT = function (payload) {
        return payload;
    };
    BaseModuleHandlers.prototype.UPDATE = function (payload) {
        return payload;
    };
    BaseModuleHandlers.prototype.LOADING = function (payload) {
        var state = this.state;
        if (!state) {
            return state;
        }
        return tslib_1.__assign({}, state, { loading: tslib_1.__assign({}, state.loading, payload) });
    };
    BaseModuleHandlers.prototype.updateState = function (payload) {
        this.dispatch(this.callThisAction(this.UPDATE, tslib_1.__assign({}, this.state, payload)));
    };
    tslib_1.__decorate([
        reducer
    ], BaseModuleHandlers.prototype, "INIT", null);
    tslib_1.__decorate([
        reducer
    ], BaseModuleHandlers.prototype, "UPDATE", null);
    tslib_1.__decorate([
        reducer
    ], BaseModuleHandlers.prototype, "LOADING", null);
    return BaseModuleHandlers;
}());
exports.BaseModuleHandlers = BaseModuleHandlers;
function logger(before, after) {
    return function (target, key, descriptor) {
        var fun = descriptor.value;
        if (!fun.__decorators__) {
            fun.__decorators__ = [];
        }
        fun.__decorators__.push([before, after]);
    };
}
exports.logger = logger;
function effect(loadingForGroupName, loadingForModuleName) {
    if (loadingForGroupName === undefined) {
        loadingForGroupName = "global";
        loadingForModuleName = global_1.MetaData.appModuleName;
    }
    return function (target, key, descriptor) {
        var fun = descriptor.value;
        fun.__actionName__ = key;
        fun.__isEffect__ = true;
        descriptor.enumerable = true;
        if (loadingForGroupName) {
            var before = function (curAction, moduleName, promiseResult) {
                if (global_1.MetaData.isBrowser) {
                    if (!loadingForModuleName) {
                        loadingForModuleName = moduleName;
                    }
                    loading_1.setLoading(promiseResult, loadingForModuleName, loadingForGroupName);
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
exports.effect = effect;
function reducer(target, key, descriptor) {
    var fun = descriptor.value;
    fun.__actionName__ = key;
    fun.__isReducer__ = true;
    descriptor.enumerable = true;
    return descriptor;
}
exports.reducer = reducer;
