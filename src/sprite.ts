function emptyObject<T> (obj: any): T {
  const arr: string[] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      arr.push(key);
    }
  }
  arr.forEach((key: string) => {
    delete obj[key];
  });
  return obj;
}
function findIndexInArray<T> (arr: T[], fun: (item: T) => boolean): number {
  for (let i = 0, k = arr.length; i < k; i++) {
    if (fun(arr[i])) {
      return i;
    }
  }
  return -1;
}
export const TaskCountEvent = 'TaskCountEvent';

export const TaskCounterState = {
  Start: 'Start',
  Stop: 'Stop',
  Depth: 'Depth'
};

export class PEvent {
  public readonly target: PDispatcher;
  public readonly currentTarget: PDispatcher;

  constructor (
    public readonly name: string,
    public readonly data?: any,
    public bubbling: boolean = false
  ) {}

  public setTarget (target: PDispatcher) {
    (this as any).target = target;
  }

  public setCurrentTarget (target: PDispatcher) {
    (this as any).currentTarget = target;
  }
}

export class PDispatcher {
  protected readonly _handlers: {
    [key: string]: Array<(e: PEvent) => void>;
  } = {};

  constructor (public readonly parent?: PDispatcher | undefined) {}

  public addListener (ename: string, handler: (e: PEvent) => void): this {
    let dictionary = this._handlers[ename];
    if (!dictionary) {
      this._handlers[ename] = dictionary = [];
    }
    dictionary.push(handler);
    return this;
  }

  public removeListener (ename?: string, handler?: (e: PEvent) => void): this {
    if (!ename) {
      emptyObject(this._handlers);
    } else {
      const handlers = this._handlers;
      if (handlers.propertyIsEnumerable(ename)) {
        const dictionary = handlers[ename];
        if (!handler) {
          delete handlers[ename];
        } else {
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

  public dispatch (evt: PEvent): this {
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
  public setParent (parent?: PDispatcher): this {
    (this as any).parent = parent;
    return this;
  }
}

export class TaskCounter extends PDispatcher {
  public readonly list: { promise: Promise<any>; note: string }[] = [];
  private _timer: number;
  constructor (public deferSecond: number) {
    super();
  }
  public addItem (promise: Promise<any>, note: string = ''): Promise<any> {
    if (!this.list.some(item => item.promise === promise)) {
      this.list.push({ promise, note });
      promise.then(
        value => this.completeItem(promise),
        reason => this.completeItem(promise)
      );
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
  private completeItem (promise: Promise<any>): this {
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
