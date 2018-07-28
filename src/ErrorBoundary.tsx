import React from "react";
import { connect, DispatchProp } from "react-redux";
import { errorAction } from "./global";

export interface State {
  message: string;
}

class ErrorBoundary extends React.PureComponent<DispatchProp<any>, State> {
  public state = {
    message: "",
  };
  public render() {
    if (this.state.message) {
      return <div>failed to render, error: {this.state.message}</div>;
    }
    return this.props.children;
  }
  public componentDidCatch(error: Error) {
    this.setState({ message: error.message });
    this.props.dispatch(errorAction(error));
  }
}

export default connect()(ErrorBoundary);
