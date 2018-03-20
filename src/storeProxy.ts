import { combineReducers, Middleware, Store } from "redux";
import { put, takeEvery } from "redux-saga/effects";
import { errorAction, LocationChangeActionName } from "./actions";
import { setLoading } from "./loading";
import { initStore, storeHistory } from "./store";
import { ActionsMap } from "./types";

let _store: Store<any> | undefined = undefined;
let routeInited: boolean;
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

function reducer(state: any = {}, action: { type: string; data: any }) {
  if (action.type === LocationChangeActionName) {
    // 为统一同步模块和异步模块，模块被加载时，监听不到当前的locationChange
    if (!routeInited) {
      routeInited = true;
      return state;
    }
  }
  const item = reducersMap[action.type];
  if (item && _store) {
    const rootState = _store.getState();
    const newState = { ...state };
    Object.keys(item).forEach(namespace => {
      newState[namespace] = item[namespace](getActionData(action), state[namespace], rootState);
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
      const loading: string[] | null = fun["__loading__"];
      let loadingCallback: any;
      if (loading) {
        setLoading(
          new Promise<any>((resolve, reject) => {
            loadingCallback = resolve;
          }),
          loading[0],
          loading[1]
        );
      }
      try {
        yield* fun(getActionData(action), rootState[moduleName], rootState);
        if (loadingCallback) {
          loadingCallback(true);
        }
      } catch (error) {
        if (loadingCallback) {
          loadingCallback(true);
        }
        yield put(errorAction(error));
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
