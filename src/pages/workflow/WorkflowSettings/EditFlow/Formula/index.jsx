import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { ACTION_ID } from '../../enum';

export default class Formula extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    let {
      fieldValue = '',
      fieldControlName = '',
      formulaValue,
      formulaMap,
      actionId,
      isException,
      selectNodeId,
      selectNodeName,
    } = item;

    if (
      (actionId !== ACTION_ID.TOTAL_STATISTICS && !formulaValue) ||
      (actionId === ACTION_ID.TOTAL_STATISTICS && !selectNodeId)
    ) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (actionId === ACTION_ID.TOTAL_STATISTICS) {
      if (!selectNodeName) {
        return (
          <div className="pLeft8 pRight8 red">
            <i className="icon-workflow_info Font18 mRight5" />
            {_l('指定的节点对象已删除')}
          </div>
        );
      }

      return <div className="pLeft8 pRight8 ellipsis Gray_75">{_l('统计数据条数')}</div>;
    }

    if (isException) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-workflow_error Font18 mRight5" />
          {_l('运算值存在异常')}
        </div>
      );
    }

    if (actionId !== ACTION_ID.DATE_DIFF_FORMULA) {
      const arr = formulaValue.match(/\$[^ \r\n]+?\$/g);
      if (arr) {
        arr.forEach(obj => {
          formulaValue = formulaValue.replace(
            obj,
            (
              formulaMap[
                obj
                  .replace(/\$/g, '')
                  .split(/([a-zA-Z0-9#]{24,32})-/)
                  .filter(item => item)[1]
              ] || {}
            ).name || '',
          );
        });
      }
      formulaValue = formulaValue
        .replace(/\+/g, ' + ')
        .replace(/\-/g, ' - ')
        .replace(/\*/g, ' * ')
        .replace(/\//g, ' / ');
    }

    return (
      <Fragment>
        <div className="pLeft8 pRight8 breakAll">
          <span className="Gray_75">{actionId === ACTION_ID.FUNCTION_CALCULATION ? _l('计算：') : _l('运算：')}</span>
          {fieldValue + fieldControlName + formulaValue}
        </div>
      </Fragment>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              {
                errorShadow: (!!item.formulaValue && item.isException) || (item.selectNodeId && !item.selectNodeName),
              },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar icon-workflow_function',
                  item.formulaValue || item.selectNodeId ? 'BGBlueAsh' : 'BGGray',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGBlueAsh" {...this.props} />
            <div className="workflowContent Font13">
              {isSimple ? <span className="pLeft8 pRight8 Gray_9e">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
