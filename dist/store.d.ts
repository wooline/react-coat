import { History } from "history";
import { AnyAction, Middleware, ReducersMapObject, Store } from "redux";
export declare function buildStore(storeHistory: History, reducers: ReducersMapObject, storeMiddlewares: Middleware[], storeEnhancers: Function[]): Store<any, AnyAction>;
