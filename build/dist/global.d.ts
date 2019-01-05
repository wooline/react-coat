import { RouterState } from "connected-react-router";
import { ComponentType } from "react";
import { History } from "history";
import { Store } from "redux";
import { LoadingState } from "./loading";
export interface ModelStore extends Store {
    reactCoat: {
        history: History;
        prevState: RootState;
        currentState: RootState;
        reducerMap: ReducerMap;
        effectMap: EffectMap;
        injectedModules: {
            [namespace: string]: boolean;
        };
        routerInited: boolean;
    };
}
export interface BaseModuleState {
    isModule?: boolean;
    loading?: {
        [key: string]: LoadingState;
    };
}
export declare function isModuleState(module: any): module is BaseModuleState;
export interface RootState<R = RouterState> {
    router: R;
}
export interface Action {
    type: string;
    priority?: string[];
    payload?: any;
}
export interface ActionCreatorMap {
    [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
    [actionName: string]: ActionCreator;
}
export declare type ActionCreator = (payload?: any) => Action;
export interface ActionHandler {
    __actionName__: string;
    __isReducer__?: boolean;
    __isEffect__?: boolean;
    __isHandler__?: boolean;
    __decorators__?: Array<[(action: Action, moduleName: string, effectResult: Promise<any>) => any, null | ((status: "Rejected" | "Resolved", beforeResult: any, effectResult: any) => void)]>;
    __decoratorResults__?: any[];
    (payload?: any): any;
}
export interface ReducerHandler extends ActionHandler {
    (payload?: any): BaseModuleState;
}
export interface EffectHandler extends ActionHandler {
    (payload?: any): Promise<any>;
}
export interface ActionHandlerList {
    [actionName: string]: ActionHandler;
}
export interface ActionHandlerMap {
    [actionName: string]: {
        [moduleName: string]: ActionHandler;
    };
}
export interface ReducerMap extends ActionHandlerMap {
    [actionName: string]: {
        [moduleName: string]: ReducerHandler;
    };
}
export interface EffectMap extends ActionHandlerMap {
    [actionName: string]: {
        [moduleName: string]: EffectHandler;
    };
}
export declare const LOADING = "LOADING";
export declare const ERROR = "@@framework/ERROR";
export declare const INIT = "INIT";
export declare const LOCATION_CHANGE = "@@router/LOCATION_CHANGE";
export declare const NSP = "/";
export declare const MetaData: {
    isBrowser: boolean;
    isDev: boolean;
    actionCreatorMap: ActionCreatorMap;
    clientStore: ModelStore;
    appModuleName: string;
};
export declare function isPromise(data: any): data is Promise<any>;
export interface Module<M extends Model = Model, VS extends {
    [key: string]: ComponentType<any>;
} = {
    [key: string]: ComponentType<any>;
}> {
    model: M;
    views: VS;
}
export declare function errorAction(error: any): {
    type: string;
    error: any;
};
export declare function setAppModuleName(moduleName: string): void;
export declare function delayPromise(second: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function getModuleActionCreatorList(namespace: string): ActionCreatorList;
export declare type Model = (store: ModelStore) => Promise<any>;
export declare function exportModule<T extends ActionCreatorList>(namespace: string): {
    namespace: string;
    actions: T;
};
export declare function warning(...args: any[]): void;
