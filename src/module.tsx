import * as PropTypes from "prop-types";
import * as React from "react";
import {ComponentType} from "react";
import {Model, Module, MetaData} from "./global";

export type GetModule<M extends Module = Module> = () => M | Promise<M>;

export interface ModuleGetter {
  [moduleName: string]: GetModule;
}

function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module> {
  return typeof module["then"] === "function";
}
function isPromiseView(moduleView: ComponentType<any> | Promise<ComponentType<any>>): moduleView is Promise<ComponentType<any>> {
  return typeof moduleView["then"] === "function";
}
function getView<M extends Module, N extends Extract<keyof M["views"], string>>(getModule: GetModule<M>, viewName: N): M["views"][N] | Promise<M["views"][N]> {
  const result = getModule();
  if (isPromiseModule(result)) {
    return result.then(module => module.views[viewName]);
  } else {
    return result.views[viewName];
  }
}

export function loadModel<M extends Module>(getModule: GetModule<M>): Promise<M["model"]> {
  const result = getModule();
  if (isPromiseModule(result)) {
    return result.then(module => module.model);
  } else {
    return Promise.resolve(result.model);
  }
}
interface State {
  Component: ComponentType<any> | null;
}

export type ReturnViews<T extends () => any> = T extends () => Promise<Module<Model, infer R>> ? R : never;

export function loadView<MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ReturnViews<MG[M]>, N extends Extract<keyof V, string>>(moduleGetter: MG, moduleName: M, viewName: N, loadingComponent: React.ReactNode = null): V[N] {
  return class Loader extends React.Component {
    public state: State = {
      Component: null,
    };
    public shouldComponentUpdate(nextProps: any, nextState: State) {
      return nextState.Component !== this.state.Component;
    }
    public componentWillMount() {
      const moduleViewResult = getView(moduleGetter[moduleName], viewName);
      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(Component => {
          this.setState({
            Component,
          });
        });
      } else {
        this.setState({
          Component: moduleViewResult,
        });
      }
    }

    public render() {
      const {Component} = this.state;
      return Component ? <Component {...this.props} /> : loadingComponent;
    }
  } as any;
}

export function exportView<C extends ComponentType<any>>(ComponentView: C, model: Model): C {
  const Comp = ComponentView as any;
  return class PureComponent extends React.PureComponent {
    public static contextTypes = {
      store: PropTypes.object,
    };
    public componentWillMount() {
      if (MetaData.isBrowser) {
        // ssr数据流是单向的，model->view
        const {store} = this.context;
        model(store);
      }
    }
    public render() {
      return <Comp {...this.props} />;
    }
  } as any;
}
