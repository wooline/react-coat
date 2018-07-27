import { Model } from "./global";
export declare function exportViews<T>(views: T, model: Model): T;
export declare function exportModule<T>(namespace: string): {
    namespace: string;
    actions: T;
};
