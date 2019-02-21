import * as tslib_1 from "tslib";
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
    var result = getModule();
    if (isPromiseModule(result)) {
        return result.then(function (module) { return module.views[viewName]; });
    }
    else {
        return result.views[viewName];
    }
}
export function loadModel(getModule) {
    var result = getModule();
    if (isPromiseModule(result)) {
        return result.then(function (module) { return module.model; });
    }
    else {
        return Promise.resolve(result.model);
    }
}
export function loadView(moduleGetter, moduleName, viewName, loadingComponent) {
    if (loadingComponent === void 0) { loadingComponent = null; }
    return (function (_super) {
        tslib_1.__extends(Loader, _super);
        function Loader() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = {
                Component: null,
            };
            return _this;
        }
        Loader.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return nextState.Component !== this.state.Component;
        };
        Loader.prototype.componentWillMount = function () {
            var _this = this;
            var moduleViewResult = getView(moduleGetter[moduleName], viewName);
            if (isPromiseView(moduleViewResult)) {
                moduleViewResult.then(function (Component) {
                    _this.setState({
                        Component: Component,
                    });
                });
            }
            else {
                this.setState({
                    Component: moduleViewResult,
                });
            }
        };
        Loader.prototype.render = function () {
            var Component = this.state.Component;
            return Component ? React.createElement(Component, tslib_1.__assign({}, this.props)) : loadingComponent;
        };
        return Loader;
    }(React.Component));
}
export function exportView(ComponentView, model, viewName) {
    var Comp = ComponentView;
    return (function (_super) {
        tslib_1.__extends(Component, _super);
        function Component() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Component.prototype.componentWillMount = function () {
            var _a;
            if (MetaData.isBrowser) {
                model(MetaData.clientStore);
                var currentViews = MetaData.clientStore.reactCoat.currentViews;
                if (!currentViews[model.namespace]) {
                    currentViews[model.namespace] = (_a = {}, _a[viewName] = 1, _a);
                }
                else {
                    var views = currentViews[model.namespace];
                    if (!views[viewName]) {
                        views[viewName] = 1;
                    }
                    else {
                        views[viewName]++;
                    }
                }
                invalidview();
            }
        };
        Component.prototype.componentWillUnmount = function () {
            if (MetaData.isBrowser) {
                var currentViews = MetaData.clientStore.reactCoat.currentViews;
                if (currentViews[model.namespace] && currentViews[model.namespace][viewName]) {
                    currentViews[model.namespace][viewName]--;
                }
                invalidview();
            }
        };
        Component.prototype.render = function () {
            return React.createElement(Comp, tslib_1.__assign({}, this.props));
        };
        return Component;
    }(React.PureComponent));
}
