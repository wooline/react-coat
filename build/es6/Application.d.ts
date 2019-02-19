/// <reference types="node" />
import { ReactElement } from "react";
import { Middleware, ReducersMapObject, StoreEnhancer, Store } from "redux";
import { ModuleGetter } from "./global";
import { RouterParser } from "./store";
export interface StoreOptions {
    reducers?: ReducersMapObject;
    middlewares?: Middleware[];
    enhancers?: StoreEnhancer[];
    routerParser?: RouterParser;
    initData?: any;
}
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appName: A, storeOptions?: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void), ssrInitStoreKey?: string): Store<any, import("redux").AnyAction>;
export declare function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appName: A, initialEntries: string[], storeOptions?: StoreOptions, ssrInitStoreKey?: string, renderToStream?: boolean): Promise<{
    html: string | NodeJS.ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
