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
export const TaskCountEvent = "TaskCountEvent";
export class PEvent {
    constructor(name, data, bubbling = false) {
        this.name = name;
        this.data = data;
        this.bubbling = bubbling;
        this.target = null;
        this.currentTarget = null;
    }
    setTarget(target) {
        this.target = target;
    }
    setCurrentTarget(target) {
        this.currentTarget = target;
    }
}
export class PDispatcher {
    constructor(parent) {
        this.parent = parent;
        this.storeHandlers = {};
    }
    addListener(ename, handler) {
        let dictionary = this.storeHandlers[ename];
        if (!dictionary) {
            this.storeHandlers[ename] = dictionary = [];
        }
        dictionary.push(handler);
        return this;
    }
    removeListener(ename, handler) {
        if (!ename) {
            emptyObject(this.storeHandlers);
        }
        else {
            const handlers = this.storeHandlers;
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
        const dictionary = this.storeHandlers[evt.name];
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
export class TaskCounter extends PDispatcher {
    constructor(deferSecond) {
        super();
        this.deferSecond = deferSecond;
        this.list = [];
        this.ctimer = 0;
    }
    addItem(promise, note = "") {
        if (!this.list.some(item => item.promise === promise)) {
            this.list.push({ promise, note });
            promise.then(resolve => this.completeItem(promise), reject => this.completeItem(promise));
            if (this.list.length === 1) {
                this.dispatch(new PEvent(TaskCountEvent, "Start"));
                this.ctimer = window.setTimeout(() => {
                    this.ctimer = 0;
                    if (this.list.length > 0) {
                        this.dispatch(new PEvent(TaskCountEvent, "Depth"));
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
                if (this.ctimer) {
                    clearTimeout(this.ctimer);
                    this.ctimer = 0;
                }
                this.dispatch(new PEvent(TaskCountEvent, "Stop"));
            }
        }
        return this;
    }
}
