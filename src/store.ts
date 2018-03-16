import { History } from "history";
import createHistory from "history/createBrowserHistory";
import { routerMiddleware, routerReducer } from "react-router-redux";
import { applyMiddleware, combineReducers, compose, createStore, Store } from "redux";
import createSagaMiddleware, { SagaMiddleware } from "redux-saga";

const storeHistory: History = createHistory();
const routingMiddleware = routerMiddleware(storeHistory);

const reducers: { [key: string]: any } = {
  router: routerReducer
};
const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware();
let devtools = (options: any) => (noop: any) => noop;
if (process.env.NODE_ENV !== "production" && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
  devtools = window["__REDUX_DEVTOOLS_EXTENSION__"];
}
export function initStore(storeMiddlewares: any[], storeEnhancers: Function[]) {
  const middlewares = [...storeMiddlewares, routingMiddleware, sagaMiddleware];
  const enhancers = [...storeEnhancers, applyMiddleware(...middlewares), devtools(window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"])];
  const store: Store<any> = createStore<{}>(combineReducers(reducers), {}, compose(...enhancers));
  return { store, reducers, sagaMiddleware };
}
export { storeHistory };
