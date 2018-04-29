import { History } from "history";
import { Middleware, ReducersMapObject } from "redux";
import { ActionsMap, SingleStore } from "./types";
declare const sagasMap: ActionsMap;
declare const reducersMap: ActionsMap;
declare const sagaNames: string[];
export declare function buildStore(storeHistory: History, reducers: ReducersMapObject, storeMiddlewares: Middleware[], storeEnhancers: Function[], injectedModules: Array<{
    type: string;
}>): SingleStore;
export declare function getSingleStore(): SingleStore | undefined;
export { sagasMap, reducersMap, sagaNames };
