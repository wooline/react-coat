/// <reference types="react" />
/// <reference types="react-redux" />
import React from "react";
import { ModuleViews } from "./types";
export interface Props {
    dispatch: any;
}
export declare function asyncComponent(resolve: () => Promise<ModuleViews>, componentName?: string, LoadingComponent?: React.ComponentType<any>, ErrorComponent?: React.ComponentType<any>): React.ComponentClass<Pick<Props, never>> & {
    WrappedComponent: React.ComponentType<Props>;
};
