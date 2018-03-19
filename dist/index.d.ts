/// <reference types="node" />
/// <reference types="react" />
import { ComponentType } from "react";
import { Middleware } from "redux";
import { asyncComponent } from "./asyncImport";
import { LoadingState, setLoading } from "./loading";
import { getStore, State, storeHistory } from "./storeProxy";
import { Model } from "./types";
export declare function buildFacade<T>(namespace: string): {
    namespace: string;
    actions: T;
};
export declare function buildState<S>(initState: S): S & {
    loading: {
        global: string;
    };
};
export declare function buildActionByReducer<T, S>(reducer: (data: T, moduleState: S, rootState: any) => S): (data: T) => {
    type: string;
    data: T;
};
export declare function buildActionByEffect<T, S>(effect: (data: T, moduleState: S, rootState: any) => IterableIterator<any>): (data: T) => {
    type: string;
    data: T;
};
export declare function buildHandlerByReducer<T, S>(reducer: (data: T, moduleState: S, rootState: any) => S): (data: T) => {
    type: string;
    data: T;
};
export declare function buildHandlerByEffect<T, S>(effect: (data: T, moduleState: S, rootState: any) => IterableIterator<any>): (data: T) => {
    type: string;
    data: T;
};
export declare function buildModel<S, A, H>(state: S, initActions: A, initHandlers: H): {
    state: S;
    actions: {
        INIT: (data: any) => {
            type: string;
            data: any;
        };
        LOADING: (data: {
            [group: string]: string;
        }) => {
            type: string;
            data: {
                [group: string]: string;
            };
        };
    } & A;
    handlers: H & {};
};
export declare function injectComponents<T>(namespace: string, components: T, module: Model): T;
export declare function createApp(component: ComponentType<any>, container: string, storeMiddlewares?: Middleware[], storeEnhancers?: Function[]): void;
export { storeHistory, getStore, asyncComponent, setLoading, LoadingState, State };
