import { History } from "history";
import { Middleware, ReducersMapObject, StoreEnhancer } from "redux";
import { ModelStore } from "./global";
export declare function invalidview(): void;
export declare type RouterParser<T = any> = (nextRouter: T, prevRouter?: T) => T;
export declare function buildStore(storeHistory: History, reducersMapObject?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[], initData?: any, routerParser?: RouterParser): ModelStore;
