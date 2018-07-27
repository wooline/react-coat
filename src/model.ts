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

export function exportModel<S, A extends { [K in keyof A]: (payload?) => S | SagaIterator }, H extends { [K in keyof H]: (payload?) => S | SagaIterator }>(
  namespace: string,
  initState: S,
  actions: A,
  listeners: H,
): { namespace: string; actions: ActionsIns<S, A>; listeners: { [K in keyof H]: (payload?) => any } } {
  (actions as any).namespace = namespace;
  (actions as any).initState = initState;
  (listeners as any).namespace = namespace;
  (listeners as any).initState = initState;
  return { namespace, actions, listeners } as any;
}
