import { History } from "history";
import { routerMiddleware, routerReducer } from "react-router-redux";
import { applyMiddleware, combineReducers, compose, createStore, Store, Action } from "redux";
import createSagaMiddleware, { SagaMiddleware } from "redux-saga";

const reducers: { [key: string]: any } = {
  router: routerReducer,
};
const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware();
let devtools = (options: any) => (noop: any) => noop;
if (process.env.NODE_ENV !== "production" && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
  devtools = window["__REDUX_DEVTOOLS_EXTENSION__"];
}
export function initStore(storeMiddlewares: any[], storeEnhancers: Function[], storeHistory: History) {
  const routingMiddleware = routerMiddleware(storeHistory);
  const middlewares = [...storeMiddlewares, routingMiddleware, sagaMiddleware];
  const enhancers = [...storeEnhancers, applyMiddleware(...middlewares), devtools(window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"])];
  const store: Store<any, Action> = createStore(combineReducers(reducers), {}, compose(...enhancers));
  return { store, reducers, sagaMiddleware };
}
