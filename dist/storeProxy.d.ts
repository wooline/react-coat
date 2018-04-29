import { History } from "history";
import { Action, Middleware, Store, ReducersMapObject } from "redux";
import { ActionsMap } from "./types";
declare const sagasMap: ActionsMap;
declare const reducersMap: ActionsMap;
declare const sagaNames: string[];
export declare function buildStore(storeHistory: History, reducers: ReducersMapObject, storeMiddlewares: Middleware[], storeEnhancers: Function[], injectedModules: Array<{
    type: string;
}>): Store<any, Action<any>>;
export declare function getStore(): Store<any, Action<any>> | undefined;
export { sagasMap, reducersMap, sagaNames };
