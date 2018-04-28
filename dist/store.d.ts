import { History } from "history";
import { Store, Action } from "redux";
import { SagaMiddleware } from "redux-saga";
export declare function initStore(storeMiddlewares: any[], storeEnhancers: Function[], storeHistory: History): {
    store: Store<any, Action<any>>;
    reducers: {
        [key: string]: any;
    };
    sagaMiddleware: SagaMiddleware<any>;
};
