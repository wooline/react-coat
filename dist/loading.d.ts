import { Store } from 'redux';
import { TaskCounterState } from './sprite';
export declare function setStore(_store: Store<any>): void;
export declare function setLoading<T>(item: T, namespace?: string, group?: string): T;
export { TaskCounterState as LoadingState };
