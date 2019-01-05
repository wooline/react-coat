"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
function emptyObject(obj) {
    var arr = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            arr.push(key);
        }
    }
    arr.forEach(function (key) {
        delete obj[key];
    });
    return obj;
}
function findIndexInArray(arr, fun) {
    for (var i = 0, k = arr.length; i < k; i++) {
        if (fun(arr[i])) {
            return i;
        }
    }
    return -1;
}
exports.TaskCountEvent = "TaskCountEvent";
var PEvent = (function () {
    function PEvent(name, data, bubbling) {
        if (bubbling === void 0) { bubbling = false; }
        this.name = name;
        this.data = data;
        this.bubbling = bubbling;
        this.target = null;
        this.currentTarget = null;
    }
    PEvent.prototype.setTarget = function (target) {
        this.target = target;
    };
    PEvent.prototype.setCurrentTarget = function (target) {
        this.currentTarget = target;
    };
    return PEvent;
}());
exports.PEvent = PEvent;
var PDispatcher = (function () {
    function PDispatcher(parent) {
        this.parent = parent;
        this.storeHandlers = {};
    }
    PDispatcher.prototype.addListener = function (ename, handler) {
        var dictionary = this.storeHandlers[ename];
        if (!dictionary) {
            this.storeHandlers[ename] = dictionary = [];
        }
        dictionary.push(handler);
        return this;
    };
    PDispatcher.prototype.removeListener = function (ename, handler) {
        if (!ename) {
            emptyObject(this.storeHandlers);
        }
        else {
            var handlers = this.storeHandlers;
            if (handlers.propertyIsEnumerable(ename)) {
                var dictionary = handlers[ename];
                if (!handler) {
                    delete handlers[ename];
                }
                else {
                    var n = dictionary.indexOf(handler);
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
    };
    PDispatcher.prototype.dispatch = function (evt) {
        if (!evt.target) {
            evt.setTarget(this);
        }
        evt.setCurrentTarget(this);
        var dictionary = this.storeHandlers[evt.name];
        if (dictionary) {
            for (var i = 0, k = dictionary.length; i < k; i++) {
                dictionary[i](evt);
            }
        }
        if (this.parent && evt.bubbling) {
            this.parent.dispatch(evt);
        }
        return this;
    };
    PDispatcher.prototype.setParent = function (parent) {
        this.parent = parent;
        return this;
    };
    return PDispatcher;
}());
exports.PDispatcher = PDispatcher;
var TaskCounter = (function (_super) {
    tslib_1.__extends(TaskCounter, _super);
    function TaskCounter(deferSecond) {
        var _this = _super.call(this) || this;
        _this.deferSecond = deferSecond;
        _this.list = [];
        _this.ctimer = 0;
        return _this;
    }
    TaskCounter.prototype.addItem = function (promise, note) {
        var _this = this;
        if (note === void 0) { note = ""; }
        if (!this.list.some(function (item) { return item.promise === promise; })) {
            this.list.push({ promise: promise, note: note });
            promise.then(function (resolve) { return _this.completeItem(promise); }, function (reject) { return _this.completeItem(promise); });
            if (this.list.length === 1) {
                this.dispatch(new PEvent(exports.TaskCountEvent, "Start"));
                this.ctimer = window.setTimeout(function () {
                    _this.ctimer = 0;
                    if (_this.list.length > 0) {
                        _this.dispatch(new PEvent(exports.TaskCountEvent, "Depth"));
                    }
                }, this.deferSecond * 1000);
            }
        }
        return promise;
    };
    TaskCounter.prototype.completeItem = function (promise) {
        var i = findIndexInArray(this.list, function (item) { return item.promise === promise; });
        if (i > -1) {
            this.list.splice(i, 1);
            if (this.list.length === 0) {
                if (this.ctimer) {
                    clearTimeout(this.ctimer);
                    this.ctimer = 0;
                }
                this.dispatch(new PEvent(exports.TaskCountEvent, "Stop"));
            }
        }
        return this;
    };
    return TaskCounter;
}(PDispatcher));
exports.TaskCounter = TaskCounter;
