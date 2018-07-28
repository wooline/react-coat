import React from "react";
import { connect, DispatchProp } from "react-redux";
import { errorAction, ModuleViews } from "./global";
import { setLoading } from "./loading";

const defaultLoadingComponent = () => <div className="react-coat-asyncComponent-loading">Loading...</div>;
const defaultErrorComponent = (props: { message: string }) => {
  return <div className="react-coat-asyncComponent-error">Error: {props.message}</div>;
};

export function async(resolve: () => Promise<ModuleViews>, componentName: string = "Main", defLoadingComponent: React.ComponentType<any> = defaultLoadingComponent, ErrorComponent: React.ComponentType<any> = defaultErrorComponent) {
  class AsyncComponent extends React.Component<DispatchProp> {
    public state: {
      Component: React.ComponentType<any> | null;
    };
    private LoadingComponent: React.ComponentType<any>;
    private ErrorComponent: React.ComponentType<any>;
    private errorMessage: string;
    constructor(props: { dispatch: any }, context?: any) {
      super(props, context);
      this.LoadingComponent = defLoadingComponent;
      this.ErrorComponent = ErrorComponent;
      this.state = {
        Component: null,
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
            Component,
          });
        })
        .catch(errorData => {
          this.errorMessage = errorData.message;
          const Component = this.ErrorComponent;
          this.props.dispatch(errorAction(errorData));
          this.setState({
            Component,
          });
        });
      setLoading(promise);
    }

    public render() {
      const { Component } = this.state;
      const { LoadingComponent } = this;
      if (Component) {
        if (Component === this.ErrorComponent) {
          return <Component message={this.errorMessage} {...this.props} />;
        } else {
          return <Component {...this.props} />;
        }
      } else {
        return <LoadingComponent {...this.props} />;
      }
    }
  }

  return connect()(AsyncComponent);
}
