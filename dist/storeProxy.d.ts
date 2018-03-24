import { History } from "history";
import { Middleware, Store } from "redux";
import { ActionsMap } from "./types";
declare const sagasMap: ActionsMap;
declare const reducersMap: ActionsMap;
declare const sagaNames: string[];
export declare function buildStore(storeHistory: History, storeMiddlewares: Middleware[], storeEnhancers: Function[], injectedModules: {
    type: string;
}[]): Store<any>;
export declare function getStore(): Store<any> | undefined;
export { sagasMap, reducersMap, sagaNames };
