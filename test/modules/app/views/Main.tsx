import * as React from "react";
import {connect} from "react-redux";
import {RootState} from "../../index";
import {Main as PhotosView} from "../../photos/views";

export interface Props {
  ssrError?: string;
}

export class Component extends React.PureComponent<Props> {
  public render() {
    const {ssrError} = this.props;

    if (ssrError) {
      return <div>{ssrError}</div>;
    } else {
      return (
        <div>
          <PhotosView />
        </div>
      );
    }
  }
}

const mapStateToProps = (state: RootState) => {
  const model = state.app!;
  return {
    ssrError: model.ssrError,
  };
};

export default connect(mapStateToProps)(Component);
