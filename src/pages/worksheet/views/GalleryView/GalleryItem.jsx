import React, { createRef } from 'react';
import worksheetAjax from 'src/api/worksheet';
import EditableCard from '../components/EditableCard';
import EditingRecordItem from '../components/EditingRecordItem';
import RecordPortal from '../components/RecordPortal';
import sheetAjax from 'src/api/worksheet';
import _ from 'lodash';

export default class GalleryItem extends React.Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.$ref = createRef(null);
    this.state = { isEditTitle: false };
  }

  updateTitleData = control => {
    const { data, onUpdateFn, base, views } = this.props;
    const { viewId } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    worksheetAjax
      .updateWorksheetRow({
        rowId: data.rowId,
        ..._.pick(view, ['worksheetId', 'viewId']),
        newOldControl: [control],
      })
      .then(({ data, resultCode }) => {
        if (data && resultCode === 1) {
          onUpdateFn([data.rowid], _.omit(data, ['allowedit', 'allowdelete']));
        }
      });
  };
  getStyle = () => {
    const $dom = this.$ref.current;
    if (!$dom) return {};
    const { top, left, width } = $dom.getBoundingClientRect();
    return { top, left, width };
  };
  render() {
    const { sheetSwitchPermit, data, worksheetInfo, base, views, sheetButtons = [], isCharge } = this.props;
    const { viewId, appId } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const { isEditTitle } = this.state;
    const { projectId } = worksheetInfo;
    return (
      <React.Fragment>
        <EditableCard
          ref={this.$ref}
          data={data}
          currentView={{
            ...view,
            projectId: projectId,
            appId,
            customButtons: sheetButtons.filter(o => o.isAllView === 1 || o.displayViews.includes(viewId)), //筛选出当前视图的按钮
          }}
          isCharge={isCharge}
          allowCopy={worksheetInfo.allowAdd}
          sheetSwitchPermit={sheetSwitchPermit}
          editTitle={() => this.setState({ isEditTitle: true })}
          onUpdate={(updated, item) => {
            this.props.onUpdateFn(updated, item);
          }}
          onDelete={() => {
            sheetAjax
              .deleteWorksheetRows({ rowIds: [data.rowId], ..._.pick(view, ['worksheetId', 'viewId']) })
              .then(res => {
                if (res.isSuccess) {
                  this.props.onDeleteFn(data.rowId);
                } else {
                  alert(_l('删除失败请稍后再试'), 2);
                }
              });
          }}
          onCopySuccess={this.props.onCopySuccess}
          updateTitleData={this.updateTitleData}
        />
        {isEditTitle && (
          <RecordPortal closeEdit={() => this.setState({ isEditTitle: false })}>
            <EditingRecordItem
              type="board"
              currentView={view}
              data={data}
              style={{
                ...this.getStyle(),
              }}
              isCharge={isCharge}
              closeEdit={() => this.setState({ isEditTitle: false })}
              updateTitleData={this.updateTitleData}
            />
          </RecordPortal>
        )}
      </React.Fragment>
    );
  }
}
