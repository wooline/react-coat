import { History } from "history";
import { Action, Middleware, Store, combineReducers } from "redux";
import { put, takeEvery } from "redux-saga/effects";
import { INIT_MODULE_ACTION_NAME, LOCATION_CHANGE_ACTION_NAME, NSP, errorAction, initLocationAction } from "./actions";
import { initStore } from "./store";
import { ActionsMap } from "./types";

let singleStore: Store<any, Action> | undefined;
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
  if (action.type === LOCATION_CHANGE_ACTION_NAME) {
    lastLocationAction = getActionData(action);
  }
  const item = reducersMap[action.type];
  if (item && singleStore) {
    const rootState = singleStore.getState();
    const newState = { ...state };
    Object.keys(item).forEach(namespace => {
      const fun = item[namespace];
      const decorators: Array<[(actionName: string, moduleName: string) => any, (data: any, state: any) => void, any]> | null = fun["__decorators__"];
      if (decorators) {
        decorators.forEach(decorator => {
          decorator[2] = decorator[0](action.type, namespace);
        });
      }
      newState[namespace] = fun(getActionData(action), state[namespace], rootState);
      if (lastLocationAction && action.type === namespace + NSP + INIT_MODULE_ACTION_NAME) {
        // 对异步模块补发一次locationChange
        setTimeout(() => {
          if (singleStore) {
            singleStore.dispatch(initLocationAction(namespace, lastLocationAction));
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

function* sagaHandler(action: { type: string; data: any }) {
  const item = sagasMap[action.type];
  if (item && singleStore) {
    const rootState = singleStore.getState();
    const arr = Object.keys(item);
    for (const moduleName of arr) {
      const fun = item[moduleName];
      const state = rootState.project[moduleName];
      const decorators: Array<[(actionName: string, moduleName: string) => any, (data: any, error?: Error) => void, any]> | null = fun["__decorators__"];
      let err: Error | undefined;
      if (decorators) {
        decorators.forEach(decorator => {
          decorator[2] = decorator[0](action.type, moduleName);
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
        decorators.forEach(decorator => {
          decorator[1](decorator[2], err);
          decorator[2] = null;
        });
      }
    }
  }
}

function* saga() {
  yield takeEvery(sagaNames, sagaHandler);
}

export function buildStore(storeHistory: History, storeMiddlewares: Middleware[], storeEnhancers: Function[], injectedModules: Array<{ type: string }>) {
  const { store, reducers, sagaMiddleware } = initStore(storeMiddlewares, storeEnhancers, storeHistory);
  singleStore = store;
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
  return singleStore;
}
export { sagasMap, reducersMap, sagaNames };
