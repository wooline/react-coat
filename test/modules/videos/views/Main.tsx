import * as React from "react";
import {connect} from "react-redux";
import {RootState} from "../../index";
import {ListSearch, ListItem, ListSummary} from "../../../type";

export interface Props {
  listSearch: ListSearch | undefined;
  listItems: ListItem[] | undefined;
  listSummary: ListSummary | undefined;
}

export class Component extends React.PureComponent<Props> {
  public render() {
    const {listSearch, listItems, listSummary} = this.props;

    if (listItems && listSearch) {
      return (
        <div className="videos">
          <ul>
            {listItems.map(item => (
              <li key={item.id}>video-{item.title}</li>
            ))}
          </ul>
          {listSummary && <div className="pagination">{`共${listSummary.totalItems}条，第${listSummary.page}/${listSummary.totalPages}页`}</div>}
        </div>
      );
    } else {
      return <div>loading...</div>;
    }
  }
}

const mapStateToProps = (state: RootState) => {
  const model = state.videos!;
  return {
    listSearch: model.listSearch,
    listItems: model.listItems,
    listSummary: model.listSummary,
  };
};

export default connect(mapStateToProps)(Component);
