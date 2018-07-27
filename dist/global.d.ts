/// <reference types="react" />
import { RouterState } from "connected-react-router";
import { History } from "history";
import { ComponentType } from "react";
import { Action, AnyAction, Store } from "redux";
import { TaskCounterState as LoadingState } from "./sprite";
export interface SingleStore {
    dispatch: (action: {
        type: string;
    }) => void;
}
export interface ModuleState {
    loading: {
        global: LoadingState;
    };
}
export interface RootState<P = {}> {
    router: RouterState;
    project: P;
}
export interface ActionCreatorMap {
    [moduleName: string]: {
        [actionName: string]: (payload?) => Action;
    };
}
export interface ActionHandler {
    __host__: any;
    __isReducer__: boolean;
    __isEffect__: boolean;
    __isHandler__: boolean;
    __decorators__: Array<[any, any, any]>;
    (payload?: any): any;
}
export interface ActionHandlerList {
    [actionName: string]: ActionHandler;
}
export interface ActionHandlerMap {
    [actionName: string]: {
        [moduleName: string]: ActionHandler;
    };
}
export interface Model {
    namespace: string;
    actions: {
        [actionName: string]: (payload?) => any;
    };
}
export interface Views {
    [viewName: string]: ComponentType<any>;
}
export interface ModuleViews {
    default: Views;
}
export declare const ERROR = "@@framework/ERROR";
export declare const LOADING = "LOADING";
export declare const SET_INIT_DATA = "SET_INIT_DATA";
export declare const INIT = "INIT";
export declare const INIT_LOCATION = "@@router/LOCATION_CHANGE";
export declare const LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
export declare const NSP = "/";
export declare const MetaData: {
    history: History;
    singleStore: SingleStore;
    rootState: RootState;
    actionCreatorMap: ActionCreatorMap;
    injectedModules: Action[];
    reducerMap: ActionHandlerMap;
    effectMap: ActionHandlerMap;
};
export declare function errorAction(error: any): {
    type: string;
    error: any;
};
export declare function initLocationAction(namespace: string, payload: any): {
    type: string;
    payload: any;
};
export declare function delayPromise(second: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function getStore<S = any, A extends Action = AnyAction>(): Store<S, A>;
export declare function getHistory(): History;
