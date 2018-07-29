import { connectRouter, routerMiddleware } from "connected-react-router";
import { History } from "history";
import { Action, AnyAction, applyMiddleware, combineReducers, compose, createStore, Middleware, ReducersMapObject, Store } from "redux";
import createSagaMiddleware, { SagaMiddleware } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";
import { errorAction, initLocationAction, INIT_LOCATION, MetaData, NSP, STARTED } from "./global";

function hasLocationChangeHandler(moduleName: string) {
  const actionName = moduleName + NSP + INIT_LOCATION;
  return !!MetaData.effectMap[actionName] || !!MetaData.reducerMap[actionName];
}
function getActionData(action: {}) {
  const arr = Object.keys(action).filter(key => key !== "type");
  if (arr.length === 0) {
    return undefined;
  } else if (arr.length === 1) {
    return action[arr[0]];
  } else {
    const data = { ...action };
    delete data["type"];
    return data;
  }
}
function rootReducer(combineReducer: Function) {
  return (state: any | undefined, action: Action) => {
    MetaData.rootState = state || {};
    MetaData.rootState = combineReducer(state, action);
    return MetaData.rootState;
  };
}
function reducer(state: any = {}, action: Action) {
  const item = MetaData.reducerMap[action.type];
  if (item && MetaData.singleStore) {
    const newState = { ...state };
    const list: string[] = [];
    Object.keys(item).forEach(namespace => {
      const fun = item[namespace];
      if (fun.__isHandler__) {
        list.push(namespace);
      } else {
        list.unshift(namespace);
      }
    });
    list.forEach(namespace => {
      const fun = item[namespace];
      const decorators: Array<[(action: Action, moduleName: string) => any, (data: any, state: any) => void, any]> = fun.__decorators__;
      if (decorators) {
        decorators.forEach(decorator => {
          decorator[2] = decorator[0](action, namespace);
        });
      }
      const result = fun(getActionData(action));
      newState[namespace] = result;
      MetaData.rootState = { ...MetaData.rootState, project: { ...MetaData.rootState.project, [namespace]: result } };
      if (action.type === namespace + NSP + STARTED) {
        // 对模块补发一次locationChange
        setTimeout(() => {
          if (MetaData.singleStore && hasLocationChangeHandler(namespace)) {
            MetaData.singleStore.dispatch(initLocationAction(namespace, MetaData.rootState.router));
          }
        }, 0);
      }
      if (decorators) {
        decorators.forEach(decorator => {
          decorator[1](decorator[2], newState[namespace]);
          decorator[2] = null;
        });
      }
    });
    return newState;
  }
  return state;
}
function* effect(action: Action) {
  const item = MetaData.effectMap[action.type];
  if (item && MetaData.singleStore) {
    const list: string[] = [];
    Object.keys(item).forEach(namespace => {
      const fun = item[namespace];
      if (fun.__isHandler__) {
        list.push(namespace);
      } else {
        list.unshift(namespace);
      }
    });
    for (const moduleName of list) {
      const fun = item[moduleName];
      const decorators: Array<[(action: Action, moduleName: string) => any, (data: any, error?: Error) => void, any]> | null = fun.__decorators__;
      let err: Error | undefined;
      if (decorators) {
        decorators.forEach(decorator => {
          decorator[2] = decorator[0](action, moduleName);
        });
      }
      try {
        yield* fun(getActionData(action));
      } catch (error) {
        err = error;
      }
      if (err) {
        yield put(errorAction(err));
      }
      if (decorators) {
        decorators.forEach(decorator => {
          decorator[1](decorator[2], err);
          decorator[2] = null;
        });
      }
    }
  }
}
function* saga() {
  yield takeEvery("*", effect);
}
export function buildStore(storeHistory: History, reducers: ReducersMapObject, storeMiddlewares: Middleware[], storeEnhancers: Function[]) {
  let devtools = (options: any) => (noop: any) => noop;
  if (process.env.NODE_ENV !== "production" && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
    devtools = window["__REDUX_DEVTOOLS_EXTENSION__"];
  }
  if (reducers.router || reducers.project) {
    throw new Error("the reducer name 'router' 'project' is not allowed");
  }
  reducers.project = reducer;
  const routingMiddleware = routerMiddleware(storeHistory);
  const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware();
  const middlewares = [...storeMiddlewares, routingMiddleware, sagaMiddleware];
  const enhancers = [...storeEnhancers, applyMiddleware(...middlewares), devtools(window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"])];
  const store: Store<any, AnyAction> = createStore(rootReducer(connectRouter(storeHistory)(combineReducers(reducers))), {}, compose(...enhancers));
  MetaData.singleStore = store;
  sagaMiddleware.run(saga);
  window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) => {
    store.dispatch(errorAction(error || { message }));
  };

  MetaData.injectedModules.forEach(action => {
    store.dispatch(action);
  });
  MetaData.injectedModules.length = 0;
  return store;
}
