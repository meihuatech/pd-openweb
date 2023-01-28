import PropTypes from 'prop-types';

import React from 'react';
import cx from 'classnames';
import { fieldCanSort } from 'src/pages/worksheet/util';
import RecordCard from 'src/components/recordCard';
import EmptyCon from './noData';
import LoadDiv from 'ming-ui/components/LoadDiv';
import './worksheetListShare.less';
import { SHARE_TYPE } from './config';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import { Tooltip } from 'ming-ui';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import _ from 'lodash';

const hiddenIds = WORKFLOW_SYSTEM_CONTROL.map(c => c.controlId);

class WorksheetListShare extends React.Component {
  componentDidMount() {
    const { relationRowsName, viewName, appName, worksheetName, step, loading, loadSheet, isPublicquery, pageSize } =
      this.props;
    $('body,html').scrollTop(0);
    $(document).on('scroll', e => {
      var scrollTop = $(e.target).scrollTop();
      var clientHeight = $(e.target).innerHeight();
      if (
        scrollTop >= clientHeight - 16 - document.documentElement.clientHeight &&
        this.props.count > this.props.pageIndex * pageSize &&
        [SHARE_TYPE.WORKSHEET, SHARE_TYPE.WORKSHEETDNEXT].includes(this.props.step) &&
        !this.props.loading &&
        !isPublicquery
      ) {
        loadSheet(this.props.pageIndex + 1);
      }
    });
    const listStr =
      SHARE_TYPE.WORKSHEET === step
        ? [viewName, worksheetName, appName]
        : [relationRowsName, viewName, worksheetName, appName];
    const str = listStr.filter(o => !!o).join('-');
    document.title = str;
  }

  componentWillUnmount() {
    $(document).off('scroll');
  }

  getControlSortStatus = (control, controlSort) => {
    return controlSort.controlId === control.controlId && controlSort.isAsc;
  };

  getCardControlsForTitle = list => {
    let controls = list;
    let titleControl = _.find(controls, c => c.attribute === 1) || {};
    let athterControl = _.filter(controls, c => c.attribute !== 1);
    let allControls = [titleControl].concat(athterControl);
    return allControls;
  };
  renderQuery = list => {
    return (
      <div className="" style={{ width: '100%', padding: '20px 0 0' }}>
        {list.length <= 0
          ? _l('没有查询结果')
          : this.props.isPublicquery && list.length >= 50
          ? _l('最多可查询50条结果')
          : _l('查询到%0个结果', list.length)}
      </div>
    );
  };

  //根据showControls排序
  getSortAndVisible = (showControls, controls) => {
    let list = [];
    if (showControls.length > 0) {
      list = showControls.map(scid => _.find(controls, c => c.controlId === scid));
    } else {
      let sys = controls.filter(it => SYS.includes(it.controlId));
      let noSys = controls.filter(it => !SYS.includes(it.controlId));
      list = noSys.sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1)).concat(sys);
    }
    list = list.filter(c => c && controlState(c).visible);
    if (!list.find(o => o.attribute === 1)) {
      list = list.concat({ ...controls.find(o => o.attribute === 1), noShowForShare: true });
    }
    return list;
  };

  render() {
    const {
      cardControls,
      rowsList = [],
      controlSort,
      sortList,
      step,
      loading,
      shareId,
      pageIndex,
      isPublicquery,
      setStep,
      setRowId,
      getRowRelationRowDetailData,
      printId,
      viewSet = {},
      dataTitle = '',
      sheetSwitchPermit = [],
      viewIdForPermit,
    } = this.props;
    let Controls = this.getSortAndVisible(viewSet.showControls || [], cardControls);
    Controls = Controls.filter(
      item => !['uaid', 'daid'].concat(hiddenIds).includes(item.controlId) && ![43].includes(item.type),
    );
    let coverCidData = Controls.filter(item => item.type === 14);
    let showControls = Controls.filter(item => item.type !== 14 && controlState(item).visible); // 排除附件的数据
    let showControlsNoTitle = showControls.filter(it => it.attribute !== 1); // 排除标题的数据
    let showControlsData = showControls
      .filter(o => !o.noShowForShare)
      .slice(0, 7)
      .map(item => item.controlId);
    let showControlsMin = coverCidData.length
      ? showControlsNoTitle.slice(0, 2).map(item => item.controlId)
      : showControlsData;
    // 下载附件权限
    const recordAttachmentSwitch = !!viewIdForPermit
      ? isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewIdForPermit)
      : true;
    return (
      <React.Fragment>
        <div
          className={cx('recordCardListBox', { isPublicquery: isPublicquery && step === 1 })}
          style={{ minHeight: document.documentElement.clientHeight - 100 }}
        >
          {!Controls ||
          (rowsList.length <= 0 && !isPublicquery && !loading) ||
          (isPublicquery && rowsList.length <= 0 && step !== 1 && !loading) ? (
            <div className="noDataCon" style={{ minHeight: innerHeight - 140 }}>
              <EmptyCon />
            </div>
          ) : (
            <React.Fragment>
              {step === 1 && (
                <div className="recordCardListHeader">
                  {isPublicquery && this.renderQuery(rowsList)}
                  {rowsList.length > 0 && (
                    <div className={cx('flexRow', { minW: coverCidData.length })}>
                      {this.getCardControlsForTitle(Controls)
                        .filter(item => ![14, 43].includes(item.type) && controlState(item).visible)
                        .slice(0, 7)
                        .map((control, i) => {
                          const itemType = control.sourceControlType || control.type;
                          const canSort = fieldCanSort(itemType) && !isPublicquery;
                          const isAsc = this.getControlSortStatus(control, controlSort);
                          return (
                            <div
                              className={cx('controlName flex Hand', { title: control.attribute })}
                              key={i}
                              onClick={() => {
                                if (canSort) {
                                  sortList(control.controlId);
                                }
                              }}
                            >
                              {control.attribute === 1 ? (
                                <Tooltip popupPlacement="bottom" text={<span>{dataTitle}</span>}>
                                  <i className="icon icon-ic_title"></i>
                                </Tooltip>
                              ) : (
                                <span className="ellipsis Bold Font12 Gray_75 controlNameValue">
                                  {control.controlName}
                                </span>
                              )}
                              {canSort && (
                                <span className="orderStatus">
                                  <span className="flexColumn">
                                    <i className={cx('icon icon-arrow-up', { ThemeColor3: isAsc === 1 })}></i>
                                    <i className={cx('icon icon-arrow-down', { ThemeColor3: isAsc === 2 })}></i>
                                  </span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
              <div className="recordCardList" ref={e => (this.scroll = e)}>
                {rowsList.length > 0 &&
                  rowsList.map((record, i) => {
                    return (
                      <RecordCard
                        disableDownload={!recordAttachmentSwitch}
                        key={i}
                        from={window.innerWidth > 600 ? 2 : 3}
                        disabled={true}
                        coverCid={coverCidData.length ? coverCidData[0].controlId : null}
                        showControls={window.innerWidth > 600 ? showControlsData : showControlsMin}
                        controls={Controls.filter(
                          o => !['uaid', 'daid'].includes(o.controlId) && ![43].includes(o.type),
                        )}
                        data={record}
                        shareId={shareId}
                        selected={false}
                        onClick={() => {
                          if (step >= 4 || printId) {
                            return;
                          } else {
                            if (step <= 2) {
                              setStep(SHARE_TYPE.WORKSHEETDETAIL);
                              setRowId(record.rowid);
                            } else {
                              setStep(SHARE_TYPE.WORKSHEETDRELATIONDETAIL);
                              // worksheetId, rowId, viewId
                              getRowRelationRowDetailData(record.wsid, record.rowid, '');
                            }
                          }
                        }}
                      />
                    );
                  })}
                {loading && pageIndex > 0 && <LoadDiv />}
              </div>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default WorksheetListShare;
