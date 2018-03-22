import { combineReducers, Middleware, Store } from "redux";
import { put, takeEvery } from "redux-saga/effects";
import { errorAction, initLocationAction, InitModuleActionName, LocationChangeActionName } from "./actions";
import { initStore, storeHistory } from "./store";
import { ActionsMap } from "./types";

let _store: Store<any> | undefined = undefined;
let lastLocationAction: any;
const sagasMap: ActionsMap = {};
const reducersMap: ActionsMap = {};
const sagaNames: string[] = [];

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

function reducer(state: any = {}, action: { type: string; data?: any }) {
  if (action.type === LocationChangeActionName) {
    lastLocationAction = getActionData(action);
  }
  const item = reducersMap[action.type];
  if (item && _store) {
    const rootState = _store.getState();
    const newState = { ...state };
    Object.keys(item).forEach(namespace => {
      const fun = item[namespace];
      const decorators: [(actionName: string, moduleName: string) => any, (data: any, state: any) => void, any][] | null = fun["__decorators__"];
      if (decorators) {
        decorators.forEach(item => {
          item[2] = item[0](action.type, namespace);
        });
      }
      newState[namespace] = fun(getActionData(action), state[namespace], rootState);
      if (lastLocationAction && action.type === namespace + "/" + InitModuleActionName) {
        // 对异步模块补发一次locationChange
        setTimeout(() => {
          _store && _store.dispatch(initLocationAction(namespace, lastLocationAction));
        }, 0);
      }
      if (decorators) {
        decorators.forEach(item => {
          item[1](item[2], newState[namespace]);
          item[2] = null;
        });
      }
    });
    return newState;
  }
  return state;
}

function* sagaHandler(action: { type: string; data: any }) {
  const item = sagasMap[action.type];
  if (item && _store) {
    const rootState = _store.getState();
    const arr = Object.keys(item);
    for (const moduleName of arr) {
      const fun = item[moduleName];
      const state = rootState.project[moduleName];
      const decorators: [(actionName: string, moduleName: string) => any, (data: any, error?: Error) => void, any][] | null = fun["__decorators__"];
      let err: Error | undefined = undefined;
      if (decorators) {
        decorators.forEach(item => {
          item[2] = item[0](action.type, moduleName);
        });
      }
      try {
        yield* fun(getActionData(action), state, rootState);
      } catch (error) {
        err = error;
      }
      if (err) {
        yield put(errorAction(err));
      }
      if (decorators) {
        decorators.forEach(item => {
          item[1](item[2], err);
          item[2] = null;
        });
      }
    }
  }
}

function* saga() {
  yield takeEvery(sagaNames, sagaHandler);
}

export function buildStore(storeMiddlewares: Middleware[], storeEnhancers: Function[], injectedModules: { type: string }[]) {
  const { store, reducers, sagaMiddleware } = initStore(storeMiddlewares, storeEnhancers);
  _store = store;
  reducers.project = reducer;
  store.replaceReducer(combineReducers(reducers));

  sagaMiddleware.run(saga as any);

  window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) => {
    store.dispatch(errorAction(error || { message }));
  };

  injectedModules.forEach(action => {
    store.dispatch(action);
  });
  injectedModules.length = 0;
  return store;
}
export function getStore() {
  return _store;
}
export { storeHistory, sagasMap, reducersMap, sagaNames };
