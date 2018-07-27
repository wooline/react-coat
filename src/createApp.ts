import { History } from "history";
import createHistory from "history/createBrowserHistory";
import { ComponentType } from "react";
import { Middleware, ReducersMapObject } from "redux";
import buildApp from "./Application";
import { MetaData } from "./global";
import { buildStore } from "./store";

export function createApp(view: ComponentType<any>, container: string, storeMiddlewares: Middleware[] = [], storeEnhancers: Function[] = [], reducers: ReducersMapObject = {}, storeHistory?: History) {
  MetaData.history = storeHistory || createHistory();
  const store = buildStore(MetaData.history, reducers, storeMiddlewares, storeEnhancers);
  buildApp(view, container, storeMiddlewares, storeEnhancers, store, MetaData.history);
}
