import { History } from "history";
import { Store } from "redux";
import { SagaMiddleware } from "redux-saga";
declare const storeHistory: History;
export declare function initStore(storeMiddlewares: any[], storeEnhancers: Function[]): {
    store: Store<any>;
    reducers: {
        [key: string]: any;
    };
    sagaMiddleware: SagaMiddleware<any>;
};
export { storeHistory };
