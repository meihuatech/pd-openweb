import React, { Component, Fragment } from 'react';
import { string, func, bool } from 'prop-types';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import HistoryStatus from './HistoryStatus';
import NodeIcon from './NodeIcon';
import api from '../../api/instance';
import {
  FLOW_STATUS,
  NODE_STATUS,
  FLOW_FAIL_REASON,
  STATUS2COLOR,
  NODE_TYPE,
  ACTION_TYPE,
  COUNTER_TYPE,
} from './config';
import instanceVersion from '../../api/instanceVersion';
import process from '../../api/process';
import _ from 'lodash';
import moment from 'moment';
import { OPERATION_TYPE } from '../enum';

export default class HistoryDetail extends Component {
  static propTypes = {
    id: string,
    onClick: func,
  };

  static defaultProps = {
    onClick: () => {},
  };

  state = {
    data: {},
    isRetry: false,
    processInfo: {},
  };

  retryPosition = '';

  componentWillMount() {
    this.getData();
    this.getProcessPublish();
  }

  getData = () => {
    const { id } = this.props;
    id &&
      api
        .getHistoryDetail({ instanceId: id }, { isIntegration: location.href.indexOf('integration') > -1 })
        .then(data => {
          this.setState({ data });
        });
  };

  getProcessPublish = () => {
    const { id } = this.props;

    process.getProcessPublish({ instanceId: id }).then(res => {
      this.setState({ processInfo: res });
    });
  };

  renderOperationInfo = item => {
    const { cause, causeMsg, causeAccount } = this.state.data.instanceLog;
    const {
      flowNode,
      workItems,
      countersign,
      countersignType,
      status,
      log = {},
      sourceId,
      scheduleActions,
      updateLogs,
      updateWorks,
    } = item;

    if (!sourceId && log.executeType === 2) {
      return <div className="Gray_75">{_l('跳过')}</div>;
    }

    if (cause === 7777 && status === 3 && causeAccount) {
      return <div className="personDetail flex Gray_75 flexRow">{_l('管理员：%0 中止', causeAccount.fullName)}</div>;
    }

    const { type, appType } = flowNode;
    const names = workItems.map(item => {
      const { workItemAccount, workItemLog } = item;
      if (workItemLog && workItemAccount) {
        return { name: workItemAccount.fullName, action: workItemLog.action, target: workItemLog.actionTargetName };
      }
      if (workItemAccount) {
        return {
          name:
            type === 0 && workItemAccount.accountId === 'user-undefined' ? _l('发起人为空') : workItemAccount.fullName,
        };
      }
    });

    const isApproval = appType === 9 && type === 0;
    const ERROR_LABELS = {
      102: _l('发送邮件，'),
    };

    return (
      <Fragment>
        {updateLogs &&
          Object.keys(updateLogs).map(key => (
            <div key={key} className="overrule mBottom12">
              {ERROR_LABELS[key]}
              {FLOW_FAIL_REASON[updateLogs[key].cause] || updateLogs[key].causeMsg}
            </div>
          ))}

        {!!(updateWorks || {})[OPERATION_TYPE.BEFORE] && (
          <div className="breakAll mBottom12 Gray_75">{_l('审批前更新了记录')}</div>
        )}

        {countersign && _.includes([1, 2, 4], countersignType) && (
          <div className="breakAll mBottom12 Gray_75">
            <span>{_l('开始审批')}</span>
            <span>(</span>
            <span>{_l('会签：')}</span>
            <span>{COUNTER_TYPE[countersignType]}</span>
            <span>)</span>
          </div>
        )}

        <div className="personDetail flex Gray_75 flexRow">
          {(_.includes([0, 3, 4, 5, 27], type) || isApproval) && (
            <Fragment>
              <div className="personInfo inlineFlexRow">
                <span>
                  {isApproval ? _l('发起人：') : type === 0 ? _l('触发者：') : _l('%0人：', NODE_TYPE[type].text)}
                </span>
                {names.map(
                  (item, index) =>
                    item && (
                      <span className={cx({ overrule: item.action === 5 })} key={index}>
                        {item.name}
                        {index < names.length - 1 && '、'}
                      </span>
                    ),
                )}

                {scheduleActions && !!scheduleActions.length && (
                  <div>
                    <span>{_l('提醒人：')}</span>
                    {scheduleActions.map((item, i) =>
                      item.accounts.map((obj, j) => (
                        <Fragment key={`${i}-${j}`}>
                          <span>{obj.fullName}</span>
                          <span className="Gray_9e">({moment(item.executeTime).format('MM-DD HH:mm')})</span>
                          {(i !== scheduleActions.length - 1 || j !== item.accounts.length - 1) && <span>、</span>}
                        </Fragment>
                      )),
                    )}
                  </div>
                )}
              </div>
              {_.includes([4, 5], status) && !countersign && (
                <div className={NODE_STATUS[status].status}>
                  {cause === 7777 && flowNode.name ? _l('过期自动中止') : FLOW_FAIL_REASON[cause] || causeMsg}
                </div>
              )}
            </Fragment>
          )}
        </div>

        {!countersign ||
          (!_.includes([1, 2, 4], countersignType) &&
            names.map((item, key) => {
              if (item) {
                const { action, target } = item;
                if (!action) return <div key={key} />;
                return _.includes([2, 8, 16], action) ? (
                  <div key={key} className="actionDetail flexRow Gray_75">
                    <div className="actionType">{_l('%0：', ACTION_TYPE[action].text)}</div>
                    {target && <div className="actionTarget">{target}</div>}
                  </div>
                ) : (
                  <div key={key} />
                );
              }
            }))}

        {!!updateWorks && (
          <Fragment>
            {!!updateWorks[OPERATION_TYPE.PASS] && <div className="info Gray_75">{_l('通过后更新了记录')}</div>}
            {!!updateWorks[OPERATION_TYPE.OVERRULE] && <div className="info Gray_75">{_l('否决后更新了记录')}</div>}
            {!!updateWorks[OPERATION_TYPE.ADD_OPERATION] && (
              <div className="info Gray_75">{_l('新增节点操作明细')}</div>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  };

  renderSubProcess(item) {
    if (!item.flowNode.subProcessId) return null;

    return (
      <span
        className="ThemeColor3 ThemeHoverColor2 pointer"
        onClick={() => window.open(`/workflowedit/${item.flowNode.subProcessId}/2/${item.workId}_${item.instanceId}`)}
      >
        {_l('查看详情')}
      </span>
    );
  }

  renderRetryBtn(retryPosition) {
    const { data, isRetry } = this.state;
    const { instanceLog, logs } = data;
    const { cause } = instanceLog;
    const showRetry = (data.status === 3 && _.includes([20001, 20002], cause)) || (status === 4 && cause !== 7777);
    const showSuspend = data.status === 1;

    if (showRetry || showSuspend) {
      return (
        <div
          className={cx(
            'historyDetailRetry',
            isRetry ? 'historyDetailRetryDisabled' : 'ThemeHoverColor2 ThemeHoverBorderColor2',
          )}
          data-tip={showRetry ? _l('从失败或中止的节点处开始重试') : _l('中止流程')}
          onClick={e => {
            e.stopPropagation();

            this.retryPosition = retryPosition;
            this.operationInstance(showRetry ? instanceVersion.resetInstance : instanceVersion.endInstance);
          }}
        >
          {showRetry ? (
            <Fragment>
              <Icon className="Font14 mRight3" icon="refresh1" />
              {_l('重试')}
              {!!logs.length && '#' + logs.length}
            </Fragment>
          ) : (
            <Fragment>
              <Icon className="Font14 mRight3" icon="block" />
              {_l('中止')}
            </Fragment>
          )}
        </div>
      );
    }

    return null;
  }

  operationInstance = ajax => {
    const { isRetry } = this.state;
    const { id } = this.props;

    if (isRetry) return;

    this.setState({ isRetry: true });

    ajax({ instanceId: id }).then(data => {
      this.setState({ data, isRetry: false });
    });
  };

  renderTemplateInfo = item => {
    return <div className="info">{item.workItems.map(o => o.opinion).join('、')}</div>;
  };

  render() {
    const { data, isRetry, processInfo } = this.state;
    if (_.isEmpty(data)) return <LoadDiv />;

    const { onClick } = this.props;
    const { works, title, createDate, instanceLog, completeType } = data;
    const { cause, nodeName, causeMsg } = instanceLog;
    const { status } = FLOW_STATUS[data.status];
    const { color, bgColor } = STATUS2COLOR[status];

    return (
      <div className="historyDetailWrap">
        <div className="header" onClick={onClick}>
          <Icon icon="backspace" className="Font20 Gray_9e" />
          <span className="backText Font15">{_l('返回')}</span>
        </div>
        <div className="detailContent">
          <div className={cx('itemInfo', status)} style={{ backgroundColor: bgColor }}>
            {isRetry && this.retryPosition === 'header' && <div className="workflowRetryLoading" />}
            <HistoryStatus statusCode={data.status} size={44} color={color} textSize={18} />
            <div className="title flex mRight15">
              <div className="overflow_ellipsis Font18">
                {_l('数据：') +
                  (works.length && works[0].flowNode.appType === 17 ? title || _l('输入参数') : title || '')}
              </div>
              <div style={{ color }}>
                {cause
                  ? cause === 40007
                    ? FLOW_FAIL_REASON[cause]
                    : !nodeName
                    ? FLOW_FAIL_REASON[cause] || causeMsg
                    : `${_l('节点: ')} ${nodeName}, ${
                        cause === 7777 ? _l('过期自动中止') : FLOW_FAIL_REASON[cause] || causeMsg
                      }`
                  : ''}
              </div>
            </div>
            <div className="time">
              <div className="Font15 Gray_75">{createDate}</div>
              {this.renderRetryBtn('header')}
            </div>
          </div>
          <div className="logWrap">
            <div className="logTitle Font16 Gray_75 flexRow" style={{ alignItems: 'center' }}>
              <div className="flex">{_l('日志')}</div>
              {!_.isEmpty(processInfo) && (
                <div className="Font13 Normal">
                  {_l('版本：%0', moment(processInfo.lastPublishDate).format('YYYY-MM-DD HH:mm'))}
                  <span
                    className="mLeft5 ThemeColor3 ThemeHoverColor2 pointer"
                    onClick={() => {
                      location.href = `/workflowedit/${processInfo.id}`;
                    }}
                  >
                    {_l('详情')}
                  </span>
                </div>
              )}
            </div>
            <ul className="logList">
              {works.map((item, index) => {
                const { flowNode, startDate, endDate, status, logs, multipleLevelType, sort } = item;
                const { name, alias } = flowNode;
                const { type } = NODE_TYPE[flowNode.child && flowNode.type === 0 ? 16 : flowNode.type] || {};

                return (
                  <li key={index}>
                    {isRetry && index === works.length - 1 && this.retryPosition === 'list' && (
                      <div className="workflowRetryLoading" />
                    )}

                    <div className="flowItemHistory flexRow">
                      <HistoryStatus config={NODE_STATUS} statusCode={status} />
                      {index !== works.length - 1 && !!(logs || []).length && (
                        <span className="mLeft8">
                          <div className="historyDetailRetryResult">{_l('重试') + '#' + logs.length}</div>
                        </span>
                      )}
                      {index === works.length - 1 && <span className="mLeft8">{this.renderRetryBtn('list')}</span>}
                    </div>

                    <div className="originNode">
                      <NodeIcon type={type} appType={flowNode.appType} actionId={flowNode.actionId} />
                      <div className="nodeName Font15 overflow_ellipsis flexColumn">
                        <div title={name}>
                          {name}
                          {multipleLevelType !== 0 && sort && _l('（第%0级）', sort)}
                        </div>
                        {alias && <div className="Gray_75 Font13 ellipsis">{_l('别名：%0', alias)}</div>}
                      </div>
                    </div>

                    <div className="operationPerson">
                      {_.includes([16, 20, 26], flowNode.type)
                        ? this.renderSubProcess(item)
                        : flowNode.type === 19
                        ? this.renderTemplateInfo(item)
                        : this.renderOperationInfo(item)}
                    </div>

                    <div className="operationTime Gray_75">
                      <div className="enterTime">{`${_l('进入:')} ${moment(startDate).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )}`}</div>
                      {endDate && (
                        <div className="leaveTime">{`${_l('离开:')} ${moment(endDate).format(
                          'YYYY-MM-DD HH:mm:ss',
                        )}`}</div>
                      )}
                    </div>
                  </li>
                );
              })}

              {completeType === 1 && (
                <li className="pBottom0 pTop25">
                  <div className="TxtCenter Gray_9e w100">{_l('流程已结束')}</div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
