import React, { ComponentType } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { withRouter } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import { Middleware, Store } from "redux";
import ErrorBoundary from "./ErrorBoundary";
import { storeHistory } from "./storeProxy";

export default function buildApp(component: ComponentType<any>, container: string, storeMiddlewares: Middleware[], storeEnhancers: Function[], store: Store<any>) {
  const WithRouter = withRouter(component);
  ReactDOM.render(
    <Provider store={store}>
      <ErrorBoundary>
        <ConnectedRouter history={storeHistory}>
          <WithRouter />
        </ConnectedRouter>
      </ErrorBoundary>
    </Provider>,
    document.getElementById(container)
  );
}
