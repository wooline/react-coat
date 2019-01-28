import { RouterState } from "connected-react-router";
import { ComponentType } from "react";
import { History } from "history";
import { Store } from "redux";
import { LoadingState } from "./loading";
export interface ModelStore extends Store {
    reactCoat: {
        history: History;
        prevState: {
            [key: string]: any;
        };
        currentState: {
            [key: string]: any;
        };
        reducerMap: ReducerMap;
        effectMap: EffectMap;
        injectedModules: {
            [namespace: string]: boolean;
        };
        routerInited: boolean;
        currentViews: CurrentViews;
    };
}
export interface CurrentViews {
    [moduleName: string]: {
        [viewName: string]: number;
    };
}
export interface BaseModuleState {
    isModule?: boolean;
    loading?: {
        [key: string]: LoadingState;
    };
}
export declare function isModuleState(module: any): module is BaseModuleState;
export declare type GetModule<M extends Module = Module> = () => M | Promise<M>;
export interface ModuleGetter {
    [moduleName: string]: GetModule;
}
export declare type ReturnModule<T extends () => any> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : Module;
declare type ModuleStates<M extends any> = M["model"]["initState"];
declare type ModuleViews<M extends any> = {
    [key in keyof M["views"]]?: number;
};
export declare type RootState<G extends ModuleGetter = {}, R = RouterState> = {
    router: R;
    views: {
        [key in keyof G]?: ModuleViews<ReturnModule<G[key]>>;
    };
} & {
    [key in keyof G]?: ModuleStates<ReturnModule<G[key]>>;
};
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
export declare const VIEW_INVALID = "@@framework/VIEW_INVALID";
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
export declare function viewInvalidAction(currentViews: CurrentViews): {
    type: string;
    currentViews: CurrentViews;
};
export declare function setAppModuleName(moduleName: string): void;
export declare function delayPromise(second: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function getModuleActionCreatorList(namespace: string): ActionCreatorList;
export interface Model<ModuleState = BaseModuleState> {
    namespace: string;
    initState: ModuleState;
    (store: ModelStore): Promise<any>;
}
export declare function exportModule<T extends ActionCreatorList>(namespace: string): {
    namespace: string;
    actions: T;
};
export declare function warning(...args: any[]): void;
export {};
