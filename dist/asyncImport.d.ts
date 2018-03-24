/// <reference types="react" />
import * as React from "react";
import { ModuleViews } from "./types";
export declare function asyncComponent(resolve: () => Promise<ModuleViews>, componentName?: string, LoadingComponent?: React.ComponentType<any>, ErrorComponent?: React.ComponentType<any>): React.ComponentType<any>;
