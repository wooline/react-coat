import React, { ComponentType } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { withRouter } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import { combineReducers, Store } from "redux";
import { put, takeEvery } from "redux-saga/effects";
import { errorAction, initModuleAction } from "./actions";
import { asyncComponent } from "./asyncImport";
import ErrorBoundary from "./ErrorBoundary";
import getInjector from "./inject";
import {
  LoadingState,
  setLoading,
  setStore as setLoadingStore
} from "./loading";

import { ActionsMap, Module } from "./types.d";

export { setLoading, LoadingState };

let store: Store<any>;
let history: any;
const sagasMap: ActionsMap = {};
const reducersMap: ActionsMap = {};
const sagaNames: string[] = [];

const injector = getInjector(reducersMap, sagasMap, sagaNames);

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
  const item = reducersMap[action.type];
  if (item) {
    const rootState = store.getState();
    const newState = { ...state };
    Object.keys(item).forEach(namespace => {
      newState[namespace] = item[namespace](
        getActionData(action),
        state[namespace],
        rootState
      );
    });
    return newState;
  }
  return state;
}
export function setStore(
  _store: Store<any>,
  _reducers: { [key: string]: any },
  _history: any,
  runSaga: (saga: Function) => void
) {
  _reducers.project = reducer;
  _store.replaceReducer(combineReducers(_reducers));
  function* sagaHandler(action: { type: string; data: any }) {
    const item = sagasMap[action.type];
    if (item) {
      const rootState = store.getState();
      const arr = Object.keys(item);
      for (const moduleName of arr) {
        try {
          yield* item[moduleName](
            getActionData(action),
            rootState[moduleName],
            rootState
          );
        } catch (error) {
          yield put(errorAction(error));
        }
      }
    }
  }
  function* saga() {
    yield takeEvery(sagaNames, sagaHandler);
  }
  runSaga(saga);
  store = _store;
  history = _history;
  setLoadingStore(store);
  return store;
}

// export type LocationHandler = (data: any) => string | boolean | { type: string, data: any };

// const locationHandlers: { [namespace: string]: LocationHandler } = {};

// function checkLocation(namespace: string) {
//   const handler = locationHandlers[namespace];
//   if (handler) {
//     const location = store.getState()['router']['location'];
//     const saga = handler(location);
//     if (typeof saga === "object") {
//       store.dispatch({ type: namespace + "/__startup", data: saga });
//     } else if (typeof saga === "string") {
//       store.dispatch({ type: namespace + "/" + saga, data: location });
//     } else if (saga) {
//       store.dispatch({ type: namespace + "/__startup", data: location });
//     }
//   }
// }

// function checkLocationHandelr(namespace?: string) {
//   if (namespace) {// 新加载的模块在本轮来不及监听location，所以会补充一次
//     checkLocation(namespace);
//   } else {
//     Object.keys(locationHandlers).forEach(checkLocation);
//   }
// }
// let locationHasInited = false;

// export function reducerHandler(state: any = {}, action: { type: string, data: any }) {
//   if (action.type === "@@router/LOCATION_CHANGE") {
//     locationHasInited = true;
//     setTimeout(() => checkLocationHandelr(), 0);
//   } else {
//     const fun = reducersMap[action.type];
//     const namespace = action.type.split("/")[0];
//     if (fun) {
//       return { ...state, [namespace]: fun(getActionData(action), state[namespace], store.getState()) };
//     }
//   }
//   return state;
// }

const hasInjected: { [moduleName: string]: boolean } = {};

export function injectModule(module: Module) {
  const namespace = module.namespace;
  if (!hasInjected[namespace]) {
    injector(module);
    hasInjected[namespace] = true;
    store.dispatch(initModuleAction(namespace));
  }
}

export { asyncComponent };

export function buildActions(namespace: string) {
  return new Proxy(
    {},
    {
      get: (target: {}, key: string) => {
        return (data: any) => ({ type: namespace + "/" + key, data });
      }
    }
  );
}

export function extendState<S>(initState: S) {
  return Object.assign(
    {
      loading: {
        global: ""
      }
    },
    initState
  );
}
export function extendActions<S, R>(initState: S, actions: R) {
  return Object.assign(
    {
      INIT(data: any, moduleState: S = initState, rootState?: any): S {
        return initState;
      },
      LOADING(
        loading: { [group: string]: string },
        moduleState: S = initState,
        rootState?: any
      ): S {
        return {
          ...(moduleState as any),
          loading: { ...(moduleState as any).loading, ...loading }
        };
      }
    },
    actions
  );
}

export function extendHandlers<S, R>(initState: S, handlers: R) {
  return Object.assign({}, handlers);
}

window.onerror = (
  message: string,
  filename?: string,
  lineno?: number,
  colno?: number,
  error?: Error
) => {
  store.dispatch(errorAction(message)); // TODO: error can be null, think about how to handle all cases
};

export function createApp(
  store: Store<any>,
  component: ComponentType<any>,
  container: string
) {
  const WithRouter = withRouter(component);
  ReactDOM.render(
    <Provider store={store}>
      <ErrorBoundary>
        <ConnectedRouter history={history}>
          <WithRouter />
        </ConnectedRouter>
      </ErrorBoundary>
    </Provider>,
    document.getElementById(container)
  );
}
