import * as React from "react";
import { MetaData } from "./global";
import { invalidview } from "./store";
function isPromiseModule(module) {
    return typeof module["then"] === "function";
}
function isPromiseView(moduleView) {
    return typeof moduleView["then"] === "function";
}
function getView(getModule, viewName) {
    const result = getModule();
    if (isPromiseModule(result)) {
        return result.then(module => module.views[viewName]);
    }
    else {
        return result.views[viewName];
    }
}
export function loadModel(getModule) {
    const result = getModule();
    if (isPromiseModule(result)) {
        return result.then(module => module.model);
    }
    else {
        return Promise.resolve(result.model);
    }
}
export function loadView(moduleGetter, moduleName, viewName, loadingComponent = null) {
    return class Loader extends React.Component {
        constructor() {
            super(...arguments);
            this.state = {
                Component: null,
            };
        }
        shouldComponentUpdate(nextProps, nextState) {
            return nextState.Component !== this.state.Component;
        }
        componentWillMount() {
            const moduleViewResult = getView(moduleGetter[moduleName], viewName);
            if (isPromiseView(moduleViewResult)) {
                moduleViewResult.then(Component => {
                    this.setState({
                        Component,
                    });
                });
            }
            else {
                this.setState({
                    Component: moduleViewResult,
                });
            }
        }
        render() {
            const { Component } = this.state;
            return Component ? React.createElement(Component, Object.assign({}, this.props)) : loadingComponent;
        }
    };
}
export function exportView(ComponentView, model, viewName) {
    const Comp = ComponentView;
    return class Component extends React.PureComponent {
        componentWillMount() {
            if (MetaData.isBrowser) {
                model(MetaData.clientStore);
                const currentViews = MetaData.clientStore.reactCoat.currentViews;
                if (!currentViews[model.namespace]) {
                    currentViews[model.namespace] = { [viewName]: 1 };
                }
                else {
                    const views = currentViews[model.namespace];
                    if (!views[viewName]) {
                        views[viewName] = 1;
                    }
                    else {
                        views[viewName]++;
                    }
                }
                invalidview();
            }
        }
        componentWillUnmount() {
            if (MetaData.isBrowser) {
                const currentViews = MetaData.clientStore.reactCoat.currentViews;
                if (currentViews[model.namespace] && currentViews[model.namespace][viewName]) {
                    currentViews[model.namespace][viewName]--;
                }
                invalidview();
            }
        }
        render() {
            return React.createElement(Comp, Object.assign({}, this.props));
        }
    };
}
