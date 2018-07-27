/// <reference types="react" />
/// <reference types="react-redux" />
import React from "react";
import { DispatchProp } from "react-redux";
export interface State {
    message: string;
}
declare const _default: React.ComponentClass<Pick<DispatchProp<any>, never>> & {
    WrappedComponent: React.ComponentType<DispatchProp<any>>;
};
export default _default;
