import { SagaIterator } from "redux-saga";
export declare type ActionCreator<P> = (payload: P) => {
    type: string;
    payload: P;
};
export declare type EmptyActionCreator = () => {
    type: string;
};
export declare type ActionsIns<S, Ins> = {
    [K in keyof Ins]: Ins[K] extends () => any ? EmptyActionCreator : Ins[K] extends (data: infer P) => any ? ActionCreator<P> : never;
};
export declare function exportModel<S, A extends {
    [K in keyof A]: (payload?) => S | SagaIterator;
}, H extends {
    [K in keyof H]: (payload?) => S | SagaIterator;
}>(namespace: string, initState: S, actions: A, listeners: H): {
    namespace: string;
    actions: ActionsIns<S, A>;
    listeners: {
        [K in keyof H]: (payload?) => any;
    };
};
