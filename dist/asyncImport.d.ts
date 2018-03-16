/// <reference types="react" />
import * as React from "react";
import { ModuleComponents } from "./types";
export declare function asyncComponent(resolve: () => Promise<ModuleComponents>, componentName?: string, LoadingComponent?: React.ComponentType<any>): React.ComponentType<any>;
