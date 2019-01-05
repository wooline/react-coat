"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PropTypes = require("prop-types");
var React = require("react");
var global_1 = require("./global");
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
function loadModel(getModule) {
    var result = getModule();
    if (isPromiseModule(result)) {
        return result.then(function (module) { return module.model; });
    }
    else {
        return Promise.resolve(result.model);
    }
}
exports.loadModel = loadModel;
function loadView(moduleGetter, moduleName, viewName, loadingComponent) {
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
exports.loadView = loadView;
function exportView(ComponentView, model) {
    var _a;
    var Comp = ComponentView;
    return _a = (function (_super) {
            tslib_1.__extends(PureComponent, _super);
            function PureComponent() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            PureComponent.prototype.componentWillMount = function () {
                if (global_1.MetaData.isBrowser) {
                    var store = this.context.store;
                    model(store);
                }
            };
            PureComponent.prototype.render = function () {
                return React.createElement(Comp, tslib_1.__assign({}, this.props));
            };
            return PureComponent;
        }(React.PureComponent)),
        _a.contextTypes = {
            store: PropTypes.object,
        },
        _a;
}
exports.exportView = exportView;
