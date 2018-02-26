'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var reactRedux = require('react-redux');
var ReactDOM = _interopDefault(require('react-dom'));
var reactRouterDom = require('react-router-dom');
var reactRouterRedux = require('react-router-redux');
var redux = require('redux');
var effects = require('redux-saga/effects');

function errorAction(error) {
    return {
        type: '@@framework/ERROR',
        error
    };
}
function loadingAction(namespace, group, status) {
    return {
        type: namespace + '/LOADING',
        data: { [group]: status }
    };
}
function initModuleAction(namespace) {
    return {
        type: namespace + '/' + 'INIT'
    };
}

function emptyObject(obj) {
    const arr = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            arr.push(key);
        }
    }
    arr.forEach((key) => {
        delete obj[key];
    });
    return obj;
}
function findIndexInArray(arr, fun) {
    for (let i = 0, k = arr.length; i < k; i++) {
        if (fun(arr[i])) {
            return i;
        }
    }
    return -1;
}
const TaskCountEvent = 'TaskCountEvent';
const TaskCounterState = {
    Start: 'Start',
    Stop: 'Stop',
    Depth: 'Depth'
};
class PEvent {
    constructor(name, data, bubbling = false) {
        this.name = name;
        this.data = data;
        this.bubbling = bubbling;
    }
    setTarget(target) {
        this.target = target;
    }
    setCurrentTarget(target) {
        this.currentTarget = target;
    }
}
class PDispatcher {
    constructor(parent) {
        this.parent = parent;
        this._handlers = {};
    }
    addListener(ename, handler) {
        let dictionary = this._handlers[ename];
        if (!dictionary) {
            this._handlers[ename] = dictionary = [];
        }
        dictionary.push(handler);
        return this;
    }
    removeListener(ename, handler) {
        if (!ename) {
            emptyObject(this._handlers);
        }
        else {
            const handlers = this._handlers;
            if (handlers.propertyIsEnumerable(ename)) {
                const dictionary = handlers[ename];
                if (!handler) {
                    delete handlers[ename];
                }
                else {
                    const n = dictionary.indexOf(handler);
                    if (n > -1) {
                        dictionary.splice(n, 1);
                    }
                    if (dictionary.length === 0) {
                        delete handlers[ename];
                    }
                }
            }
        }
        return this;
    }
    dispatch(evt) {
        if (!evt.target) {
            evt.setTarget(this);
        }
        evt.setCurrentTarget(this);
        const dictionary = this._handlers[evt.name];
        if (dictionary) {
            for (let i = 0, k = dictionary.length; i < k; i++) {
                dictionary[i](evt);
            }
        }
        if (this.parent && evt.bubbling) {
            this.parent.dispatch(evt);
        }
        return this;
    }
    setParent(parent) {
        this.parent = parent;
        return this;
    }
}
class TaskCounter extends PDispatcher {
    constructor(deferSecond) {
        super();
        this.deferSecond = deferSecond;
        this.list = [];
    }
    addItem(promise, note = '') {
        if (!this.list.some(item => item.promise === promise)) {
            this.list.push({ promise, note });
            promise.then(value => this.completeItem(promise), reason => this.completeItem(promise));
            if (this.list.length === 1) {
                this.dispatch(new PEvent(TaskCountEvent, TaskCounterState.Start));
                this._timer = window.setTimeout(() => {
                    this._timer = 0;
                    if (this.list.length > 0) {
                        this.dispatch(new PEvent(TaskCountEvent, TaskCounterState.Depth));
                    }
                }, this.deferSecond * 1000);
            }
        }
        return promise;
    }
    completeItem(promise) {
        const i = findIndexInArray(this.list, item => item.promise === promise);
        if (i > -1) {
            this.list.splice(i, 1);
            if (this.list.length === 0) {
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = 0;
                }
                this.dispatch(new PEvent(TaskCountEvent, TaskCounterState.Stop));
            }
        }
        return this;
    }
}

const loadings = {};
let store;
function setStore(_store) {
    store = _store;
}
function setLoading(item, namespace = 'app', group = 'global') {
    const key = namespace + '/' + group;
    if (!loadings[key]) {
        loadings[key] = new TaskCounter(3);
        loadings[key].addListener(TaskCountEvent, e => {
            store && store.dispatch(loadingAction(namespace, group, e.data));
        });
    }
    loadings[key].addItem(item);
    return item;
}

const defaultLoadingComponent = () => React.createElement("div", null, "Loading...");
function asyncComponent(resolve, componentName = 'Main', LoadingComponent = defaultLoadingComponent) {
    class AsyncComponent extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.LoadingComponent = LoadingComponent;
            this.state = {
                Component: null
            };
        }
        componentDidMount() {
            const promise = resolve();
            promise.then(module => {
                const Component = module.components[componentName];
                this.setState({
                    Component
                });
            });
            setLoading(promise);
        }
        render() {
            const { Component } = this.state;
            const { LoadingComponent } = this;
            return Component ? (React.createElement(Component, Object.assign({}, this.props))) : (React.createElement(LoadingComponent, Object.assign({}, this.props)));
        }
    }
    return AsyncComponent;
}

class Component extends React__default.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            message: ''
        };
    }
    render() {
        if (this.state.message) {
            return React__default.createElement("div", null,
                "failed to render, error: ",
                this.state.message);
        }
        return this.props.children;
    }
    componentDidCatch(error) {
        this.setState({ message: error.message });
        this.props.dispatch(errorAction(error));
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    };
};
var ErrorBoundary = reactRedux.connect(null, mapDispatchToProps)(Component);

let sagasMap;
let reducersMap;
let sagaNames;
const sagaNameMap = {};
function getInjector (_reducersMap, _sagasMap, _sagaNames) {
    reducersMap = _reducersMap;
    sagasMap = _sagasMap;
    sagaNames = _sagaNames;
    return injectModule;
}
function pushSagaName(actionName) {
    if (!sagaNameMap[actionName]) {
        sagaNameMap[actionName] = true;
        sagaNames.push(actionName);
    }
}
function transformAction(actionName, action, listenerModule, actionsMap) {
    if (!actionsMap[actionName]) {
        actionsMap[actionName] = {};
    }
    actionsMap[actionName][listenerModule] = action;
    if (actionsMap === sagasMap) {
        pushSagaName(actionName);
    }
}
function injectActions(namespace, actions) {
    Object.keys(actions).forEach(actionName => {
        if (actionName.substr(0, 1) === '_') {
            transformAction(namespace + '/' + actionName, actions[actionName], namespace, sagasMap);
        }
        else {
            transformAction(namespace + '/' + actionName, actions[actionName], namespace, reducersMap);
        }
    });
}
function injectHandlers(listenerModule, handlers) {
    Object.keys(handlers).forEach(handlerName => {
        if (handlerName.substr(0, 1) === '_') {
            transformAction(handlerName.substr(1), handlers[handlerName], listenerModule, sagasMap);
        }
        else {
            transformAction(handlerName, handlers[handlerName], listenerModule, reducersMap);
        }
    });
}
function injectModule(module) {
    injectActions(module.namespace, module.actions);
    injectHandlers(module.namespace, module.handlers);
}

let store$1;
let history;
const sagasMap$1 = {};
const reducersMap$1 = {};
const sagaNames$1 = [];
const injector = getInjector(reducersMap$1, sagasMap$1, sagaNames$1);
function getActionData(action) {
    const arr = Object.keys(action).filter(key => key !== 'type');
    if (arr.length === 0) {
        return undefined;
    }
    else if (arr.length === 1) {
        return action[arr[0]];
    }
    else {
        const data = { ...action };
        delete data['type'];
        return data;
    }
}
function reducer(state = {}, action) {
    const item = reducersMap$1[action.type];
    if (item) {
        const rootState = store$1.getState();
        const newState = { ...state };
        Object.keys(item).forEach(namespace => {
            newState[namespace] = item[namespace](getActionData(action), state[namespace], rootState);
        });
        return newState;
    }
    return state;
}
function setStore$1(_store, _reducers, _history, runSaga) {
    _reducers.project = reducer;
    _store.replaceReducer(redux.combineReducers(_reducers));
    function* sagaHandler(action) {
        const item = sagasMap$1[action.type];
        if (item) {
            const rootState = store$1.getState();
            const arr = Object.keys(item);
            for (const moduleName of arr) {
                try {
                    yield* item[moduleName](getActionData(action), rootState[moduleName], rootState);
                }
                catch (error) {
                    yield effects.put(errorAction(error));
                }
            }
        }
    }
    function* saga() {
        yield effects.takeEvery(sagaNames$1, sagaHandler);
    }
    runSaga(saga);
    store$1 = _store;
    history = _history;
    setStore(store$1);
    return store$1;
}
// export type LocationHandler = (data: any) => string | boolean | { type: string, data: any };
// const locationHandlers: { [namespace: string]: LocationHandler } = {};
// function checkLocation(namespace: string) {
//   const handler = locationHandlers[namespace];
//   if (handler) {
//     const location = store.getState()['router']['location'];
//     const saga = handler(location);
//     if (typeof saga === "object") {
//       store.dispatch({ type: namespace + "/__startup", data: saga });
//     } else if (typeof saga === "string") {
//       store.dispatch({ type: namespace + "/" + saga, data: location });
//     } else if (saga) {
//       store.dispatch({ type: namespace + "/__startup", data: location });
//     }
//   }
// }
// function checkLocationHandelr(namespace?: string) {
//   if (namespace) {// 新加载的模块在本轮来不及监听location，所以会补充一次
//     checkLocation(namespace);
//   } else {
//     Object.keys(locationHandlers).forEach(checkLocation);
//   }
// }
// let locationHasInited = false;
// export function reducerHandler(state: any = {}, action: { type: string, data: any }) {
//   if (action.type === "@@router/LOCATION_CHANGE") {
//     locationHasInited = true;
//     setTimeout(() => checkLocationHandelr(), 0);
//   } else {
//     const fun = reducersMap[action.type];
//     const namespace = action.type.split("/")[0];
//     if (fun) {
//       return { ...state, [namespace]: fun(getActionData(action), state[namespace], store.getState()) };
//     }
//   }
//   return state;
// }
const hasInjected = {};
function injectModule$1(module) {
    const namespace = module.namespace;
    if (!hasInjected[namespace]) {
        injector(module);
        hasInjected[namespace] = true;
        store$1.dispatch(initModuleAction(namespace));
    }
}
function buildActions(namespace) {
    return new Proxy({}, {
        get: (target, key) => {
            return (data) => ({ type: namespace + '/' + key, data });
        }
    });
}
function extendState(initState) {
    return Object.assign({
        loading: {
            global: ''
        }
    }, initState);
}
function extendActions(initState, actions) {
    return Object.assign({
        INIT(data, moduleState = initState, rootState) {
            return initState;
        },
        LOADING(loading, moduleState = initState, rootState) {
            return {
                ...moduleState,
                loading: { ...moduleState.loading, ...loading }
            };
        }
    }, actions);
}
function extendHandlers(initState, handlers) {
    return Object.assign({}, handlers);
}
window.onerror = (message, filename, lineno, colno, error) => {
    store$1.dispatch(errorAction(message)); // TODO: error can be null, think about how to handle all cases
};
function createApp(store, component, container) {
    const WithRouter = reactRouterDom.withRouter(component);
    ReactDOM.render(React__default.createElement(reactRedux.Provider, { store: store },
        React__default.createElement(ErrorBoundary, null,
            React__default.createElement(reactRouterRedux.ConnectedRouter, { history: history },
                React__default.createElement(WithRouter, null)))), document.getElementById(container));
}

exports.setLoading = setLoading;
exports.LoadingState = TaskCounterState;
exports.setStore = setStore$1;
exports.injectModule = injectModule$1;
exports.asyncComponent = asyncComponent;
exports.buildActions = buildActions;
exports.extendState = extendState;
exports.extendActions = extendActions;
exports.extendHandlers = extendHandlers;
exports.createApp = createApp;
