import * as React from "react";
import { setLoading } from "./loading";
import { ModuleViews } from "./types";

const defaultLoadingComponent = () => <div className="react-coat-asyncComponent-loading">Loading...</div>;
const defaultErrorComponent = () => <div className="react-coat-asyncComponent-error">Error...</div>;

export function asyncComponent(resolve: () => Promise<ModuleViews>, componentName: string = "Main", LoadingComponent: React.ComponentType<any> = defaultLoadingComponent, ErrorComponent: React.ComponentType<any> = defaultErrorComponent) {
  class AsyncComponent extends React.Component {
    public state: {
      Component: React.ComponentType<any> | null;
    };
    private LoadingComponent: React.ComponentType<any>;
    private ErrorComponent: React.ComponentType<any>;
    constructor(props: {}, context?: any) {
      super(props, context);
      this.LoadingComponent = LoadingComponent;
      this.ErrorComponent = ErrorComponent;
      this.state = {
        Component: null
      };
    }
    public shouldComponentUpdate(nextProps: any, nextState: any) {
      return nextState.Component !== this.state.Component;
    }
    public componentDidMount() {
      const promise = resolve()
        .then(module => {
          const Component = module.default[componentName];
          this.setState({
            Component
          });
        })
        .catch(errorData => {
          const Component = this.ErrorComponent;
          this.setState({
            Component
          });
        });
      setLoading(promise);
    }

    public render() {
      const { Component } = this.state;
      const { LoadingComponent } = this;
      return Component ? <Component {...this.props} /> : <LoadingComponent {...this.props} />;
    }
  }
  return AsyncComponent as React.ComponentType<any>;
}
