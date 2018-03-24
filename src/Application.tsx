import { History } from "history";
import React, { ComponentType } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { withRouter } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import { Middleware, Store } from "redux";
import ErrorBoundary from "./ErrorBoundary";

export default function buildApp(view: ComponentType<any>, container: string, storeMiddlewares: Middleware[], storeEnhancers: Function[], store: Store<any>, history: History) {
  const WithRouter = withRouter(view);
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
