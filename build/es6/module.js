import * as PropTypes from "prop-types";
import * as React from "react";
import { MetaData } from "./global";
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
export function exportView(ComponentView, model) {
    var _a;
    const Comp = ComponentView;
    return _a = class PureComponent extends React.PureComponent {
            componentWillMount() {
                if (MetaData.isBrowser) {
                    const { store } = this.context;
                    model(store);
                }
            }
            render() {
                return React.createElement(Comp, Object.assign({}, this.props));
            }
        },
        _a.contextTypes = {
            store: PropTypes.object,
        },
        _a;
}
