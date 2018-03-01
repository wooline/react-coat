/// <reference types="react" />
import * as React from "react";
import { Module } from "./types.d";
export declare function asyncComponent(resolve: () => Promise<Module>, componentName?: string, LoadingComponent?: React.ComponentType<any>): React.ComponentType<any>;
