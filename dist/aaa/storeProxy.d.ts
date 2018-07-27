import { History } from "history";
import { Middleware, ReducersMapObject } from "redux";
import { ActionHandlerMap, SingleStore, StoreState, BaseModuleState } from "./types";
declare const sagasMap: ActionHandlerMap<any>;
declare const reducersMap: ActionHandlerMap<any>;
declare const sagaNames: string[];
export declare function getRootState(): StoreState<{}>;
export declare function getModuleState(namespace: string): BaseModuleState;
export declare function getSingleStore(): SingleStore;
export declare function getSagaNames(): string[];
export declare function buildStore(storeHistory: History, reducers: ReducersMapObject, storeMiddlewares: Middleware[], storeEnhancers: Function[], injectedModules: Array<{
    type: string;
}>): SingleStore;
export { sagasMap, reducersMap, sagaNames };
