/// <reference types="react" />
/// <reference types="react-redux" />
import React from "react";
import { ModuleViews } from "./global";
export declare function async(resolve: () => Promise<ModuleViews>, componentName?: string, defLoadingComponent?: React.ComponentType<any>, ErrorComponent?: React.ComponentType<any>): React.ComponentClass<Pick<{
    dispatch: any;
}, never>> & {
    WrappedComponent: React.ComponentType<{
        dispatch: any;
    }>;
};
