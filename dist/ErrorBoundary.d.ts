/// <reference types="react" />
/// <reference types="react-redux" />
import React from 'react';
export interface Props {
    dispatch: any;
}
export interface State {
    message: string;
}
declare const _default: React.ComponentClass<Pick<Props, never>> & {
    WrappedComponent: React.ComponentType<Props>;
};
export default _default;
