import { History } from "history";
import { ComponentType } from "react";
import { Middleware, ReducersMapObject } from "redux";
export declare function createApp(view: ComponentType<any>, container: string, storeMiddlewares?: Middleware[], storeEnhancers?: Function[], reducers?: ReducersMapObject, storeHistory?: History): void;
