import { History } from "history";
import { Store } from "redux";
import { SagaMiddleware } from "redux-saga";
export declare function initStore(storeMiddlewares: any[], storeEnhancers: Function[], storeHistory: History): {
    store: Store<any>;
    reducers: {
        [key: string]: any;
    };
    sagaMiddleware: SagaMiddleware<any>;
};
