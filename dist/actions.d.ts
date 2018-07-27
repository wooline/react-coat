import { INIT, LOADING, ModuleState, RootState, SET_INIT_DATA } from "./global";
import { CallEffect, call, PutEffect } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { Action } from "redux";
export { PutEffect };
export declare class BaseModuleActions<S extends ModuleState, R extends RootState> {
    protected readonly namespace: string;
    protected readonly initState: S;
    protected call: typeof call;
    protected callPromise: CallPromise;
    protected readonly state: S;
    protected readonly rootState: R;
    protected put(action: Action | S | SagaIterator): PutEffect<any>;
    [SET_INIT_DATA](): S;
    [LOADING](payload: {
        [group: string]: string;
    }): S;
    [INIT](): SagaIterator;
}
export declare function logger(before: (actionName: string, moduleName: string) => void, after: (beforeData: any, data: any) => void): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function loading(loadingForModuleName?: string, loadingForGroupName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): void;
export declare function effect(target: any, key: string, descriptor: PropertyDescriptor): void;
export interface CallProxy<T> extends CallEffect {
    getResponse: () => T;
}
export interface CallPromise {
    <T>(fn: () => Promise<T>): CallProxy<T>;
    <T, R1, A1 extends R1>(fn: (req1: R1) => Promise<T>, arg1: A1): CallProxy<T>;
    <T, R1, R2, A1 extends R1, A2 extends R2>(fn: (req1: R1, req2: R2) => Promise<T>, arg1: A1, arg2: A2): CallProxy<T>;
    <T, R1, R2, R3, A1 extends R1, A2 extends R2, A3 extends R3>(fn: (req1: R1, req2: R2, req3: R3) => Promise<T>, arg1: A1, arg2: A2, arg3: A3): CallProxy<T>;
    <T, R1, R2, R3, R4, A1 extends R1, A2 extends R2, A3 extends R3, A4 extends R4>(fn: (req1: R1, req2: R2, req3: R3, req4: R4) => Promise<T>, arg1: A1, arg2: A2, arg3: A3, arg4: A4): CallProxy<T>;
    <T, R1, R2, R3, R4, R5, A1 extends R1, A2 extends R2, A3 extends R3, A4 extends R4, A5 extends R5>(fn: (req1: R1, req2: R2, req3: R3, req4: R4, req5: R5) => Promise<T>, arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5): CallProxy<T>;
}
export declare const callPromise: CallPromise;
