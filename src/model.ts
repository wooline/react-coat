import { SagaIterator } from "redux-saga";

export type ActionCreator<P> = (
  payload: P,
) => {
  type: string;
  payload: P;
};
export type EmptyActionCreator = () => {
  type: string;
};

export type ActionsIns<S, Ins> = { [K in keyof Ins]: Ins[K] extends () => any ? EmptyActionCreator : Ins[K] extends (data: infer P) => any ? ActionCreator<P> : never };

export function exportModel<S, A extends { [K in keyof A]: (payload?) => S | SagaIterator }>(namespace: string, initState: S, actions: A): { namespace: string; actions: ActionsIns<S, A> } {
  (actions as any).namespace = namespace;
  (actions as any).initState = initState;
  return { namespace, actions } as any;
}
