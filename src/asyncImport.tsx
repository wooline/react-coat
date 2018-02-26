import * as React from 'react';
import { setLoading } from './loading';
import { Module } from './types.d';

const defaultLoadingComponent = () => <div>Loading...</div>;

export function asyncComponent (
  resolve: () => Promise<Module>,
  componentName: string = 'Main',
  LoadingComponent: React.ComponentType<any> = defaultLoadingComponent
) {
  class AsyncComponent extends React.Component {
    public state: {
      Component: React.ComponentType<any> | null;
    };
    private LoadingComponent: React.ComponentType<any>;
    constructor (props: {}, context?: any) {
      super(props, context);
      this.LoadingComponent = LoadingComponent;
      this.state = {
        Component: null
      };
    }
    public componentDidMount () {
      const promise = resolve();
      promise.then(module => {
        const Component = module.components[componentName];
        this.setState({
          Component
        });
      });
      setLoading(promise);
    }

    public render () {
      const { Component } = this.state;
      const { LoadingComponent } = this;
      return Component ? (
        <Component {...this.props} />
      ) : (
        <LoadingComponent {...this.props} />
      );
    }
  }
  return AsyncComponent as React.ComponentType<any>;
}
