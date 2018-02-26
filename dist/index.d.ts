/// <reference types="react" />
import { ComponentType } from 'react';
import { Store } from 'redux';
import { asyncComponent } from './asyncImport';
import { LoadingState, setLoading } from './loading';
import { Module } from './types.d';
export { setLoading, LoadingState };
export declare function setStore(_store: Store<any>, _reducers: {
    [key: string]: any;
}, _history: any, runSaga: (saga: Function) => void): Store<any>;
export declare function injectModule(module: Module): void;
export { asyncComponent };
export declare function buildActions(namespace: string): {};
export declare function extendState<S>(initState: S): {
    loading: {
        global: string;
    };
} & S;
export declare function extendActions<S, R>(initState: S, actions: R): {
    INIT(data: any, moduleState?: S, rootState?: any): S;
    LOADING(loading: {
        [group: string]: string;
    }, moduleState?: S, rootState?: any): S;
} & R;
export declare function extendHandlers<S, R>(initState: S, handlers: R): R & {};
export declare function createApp(store: Store<any>, component: ComponentType<any>, container: string): void;
