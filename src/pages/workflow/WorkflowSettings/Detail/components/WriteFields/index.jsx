import React, { Component, Fragment } from 'react';
import { Checkbox, Icon, Dialog, Switch } from 'ming-ui';
import flowNode from '../../../../api/flowNode';
import _ from 'lodash';
import styled from 'styled-components';
import cx from 'classnames';

const READ_TYPE = [20, 22, 25, 30, 31, 32, 33, 34, 37, 38, 45, 47, 51];

const Box = styled.ul`
  > li {
    align-items: center;
    height: 40px;
    border-bottom: 1px solid #e0e0e0;
    > div.flex {
      min-width: 0;
    }
    > div:not(.flex) {
      width: 84px;
    }
    .tip-bottom-left {
      &:after {
        width: 200px;
        white-space: normal;
      }
    }
  }
`;

const Line = styled.div`
  width: 1px;
  margin: 0 30px;
  &::before {
    content: '';
    background: #f5f5f5;
    position: absolute;
    height: 100%;
    width: 1px;
  }
`;

export default class WriteFields extends Component {
  static defaultProps = {
    processId: '',
    nodeId: '',
    selectNodeId: '',
    data: [],
    hideTypes: [],
    readonlyControlTypes: [],
    updateSource: () => {},
    showCard: false,
  };

  state = {
    showTableControls: false,
    selectItem: {},
    foldIds: [],
  };

  componentDidMount() {
    const { selectNodeId, data } = this.props;

    if (selectNodeId && !data.length) {
      this.getNodeFormProperty(selectNodeId);
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeFormProperty(nextProps.selectNodeId);
    }
  }

  /**
   * 获取字段列表
   */
  getNodeFormProperty(selectNodeId) {
    const { processId, nodeId, updateSource } = this.props;

    flowNode.getNodeFormProperty({ processId, nodeId, selectNodeId }).then(result => {
      updateSource({ formProperties: result });
    });
  }

  /**
   * 是否禁用
   */
  isDisabled(item, type) {
    const { readonlyControlTypes } = this.props;

    if (
      _.includes(READ_TYPE.concat(readonlyControlTypes), item.type) ||
      item.type > 10000 ||
      (item.type === 29 && item.showType === '2') ||
      (_.includes([43, 49], item.type) && type === 'REQUIRED')
    ) {
      return true;
    }

    return false;
  }

  /**
   * 全选操作
   */
  updateAllSettings({ key, checked }) {
    const { data, updateSource } = this.props;
    const { showTableControls, selectItem } = this.state;
    const formProperties = _.cloneDeep(showTableControls ? selectItem.subFormProperties : data);

    if (key === 'LOOK') {
      formProperties.forEach(item => {
        if (!checked) {
          item.property = 4;
        } else if (item.property === 4) {
          item.property = 1;
        }
      });
    }

    if (key === 'EDIT') {
      formProperties.forEach(item => {
        if (!this.isDisabled(item)) {
          if (!checked) {
            item.property = 1;
          } else if (_.includes([1, 4], item.property)) {
            item.property = 2;
          }
        }
      });
    }

    if (key === 'REQUIRED') {
      formProperties.forEach(item => {
        if (!this.isDisabled(item, 'REQUIRED')) {
          if (!checked) {
            item.property = 2;
          } else if (_.includes([1, 2, 4], item.property)) {
            item.property = 3;
          }
        }
      });
    }

    if (showTableControls) {
      this.setState({ selectItem: Object.assign({}, selectItem, { subFormProperties: formProperties }) });
    } else {
      updateSource({ formProperties });
    }
  }

  onChange(item, property) {
    const { data, updateSource } = this.props;
    const { showTableControls, selectItem } = this.state;
    const formProperties = _.cloneDeep(showTableControls ? selectItem.subFormProperties : data);

    formProperties.forEach(o => {
      if (o.id === item.id) {
        o.property = property;
      }
    });

    // 分段
    if (item.type === 52) {
      formProperties.forEach(o => {
        if (o.sectionId === item.id && !this.isDisabled(o)) {
          o.property = property;
        }
      });
    }

    if (showTableControls) {
      this.setState({ selectItem: Object.assign({}, selectItem, { subFormProperties: formProperties }) });
    } else {
      updateSource({ formProperties });
    }
  }

  onChangeCard(id, showCard) {
    const { data, updateSource } = this.props;
    const formProperties = _.cloneDeep(data);

    if (formProperties.filter(item => !!item.showCard).length >= 8 && !!showCard) {
      alert(_l('最多可设置8个字段'), 2);
      return;
    }

    formProperties.forEach(item => {
      if (item.id === id) {
        item.showCard = showCard;
      }
    });

    updateSource({ formProperties });
  }

  renderContent({ data, showCard = false, isChildTable = false }) {
    const { hideTypes } = this.props;

    return (
      <Box className="mTop15">
        <li className="flexRow">
          <div className="flex" />
          <div className="mLeft16">
            {!_.includes(hideTypes, 1) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('查看')}
                clearselected={
                  data.filter(item => item.property === 4).length !== data.length &&
                  data.filter(item => item.property === 4).length
                }
                checked={!data.filter(item => item.property === 4).length}
                onClick={checked => this.updateAllSettings({ key: 'LOOK', checked: !checked })}
              />
            )}
          </div>
          <div className="mLeft16">
            {!_.includes(hideTypes, 2) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('编辑')}
                clearselected={
                  data.filter(item => item.property === 2 || item.property === 3).length &&
                  !(
                    data.filter(item => item.property === 2 || item.property === 3).length ===
                    data.filter(item => !this.isDisabled(item)).length
                  )
                }
                checked={
                  data.filter(item => item.property === 2 || item.property === 3).length ===
                  data.filter(item => !this.isDisabled(item)).length
                }
                onClick={checked => this.updateAllSettings({ key: 'EDIT', checked: !checked })}
              />
            )}
          </div>
          <div className="mLeft16">
            {!_.includes(hideTypes, 3) && (
              <Checkbox
                className="InlineBlock Font12 TxtMiddle"
                text={_l('必填')}
                clearselected={
                  data.filter(item => item.property === 3).length &&
                  !(
                    data.filter(item => item.property === 3).length ===
                    data.filter(item => !this.isDisabled(item, 'REQUIRED')).length
                  )
                }
                checked={
                  data.filter(item => item.property === 3).length ===
                  data.filter(item => !this.isDisabled(item, 'REQUIRED')).length
                }
                onClick={checked => this.updateAllSettings({ key: 'REQUIRED', checked: !checked })}
              />
            )}
          </div>
          {showCard && (
            <div className="mLeft16 mRight16 cursorDefault" style={{ width: 60 }}>
              <span
                className="tip-bottom-left"
                data-tip={_l('指定摘要字段，显示在我的流程列表中，方便快速了解待处理事项的内容。')}
              >
                {_l('摘要')}
              </span>
            </div>
          )}
        </li>
        {this.renderField(data, showCard, isChildTable)}
      </Box>
    );
  }

  /**
   * 渲染字段
   */
  renderField(data, showCard, isChildTable, isSubData) {
    const { hideTypes } = this.props;
    const { foldIds } = this.state;

    return data
      .filter(item => !item.sectionId || !!isSubData)
      .map((item, i) => {
        return (
          <Fragment>
            <li className={cx('flexRow', { mLeft30: isSubData })} key={i}>
              <div
                className={cx('flex flexRow alignItemsCenter', { 'ThemeHoverColor3 pointer': item.type === 52 })}
                onClick={() => {
                  if (item.type === 52) {
                    this.setState({
                      foldIds: _.includes(foldIds, item.id)
                        ? foldIds.filter(o => o !== item.id)
                        : foldIds.concat(item.id),
                    });
                  }
                }}
              >
                {item.type === 52 && (
                  <i
                    className={cx(
                      'mRight5 Gray_75',
                      _.includes(foldIds, item.id) ? 'icon-arrow-right-tip' : 'icon-arrow-down',
                    )}
                  />
                )}
                <div className="ellipsis" title={item.name || (item.type === 22 ? _l('分段') : _l('备注'))}>
                  {item.name || (item.type === 22 ? _l('分段') : _l('备注'))}
                </div>
                {item.type === 29 && !!(item.subFormProperties || []).length && (
                  <div
                    data-tip={_l('设置子表操作和列权限')}
                    className="mLeft5 Gray_9e ThemeHoverColor3 pointer"
                    style={{ display: 'inline-flex' }}
                    onClick={() =>
                      this.setState({
                        showTableControls: true,
                        selectItem: item,
                      })
                    }
                  >
                    <Icon type="settings" className="Font16" />
                  </div>
                )}
              </div>
              <div className="mLeft16">
                {!_.includes(hideTypes, item.property) && (
                  <Checkbox checked={item.property !== 4} onClick={checked => this.onChange(item, checked ? 4 : 1)} />
                )}
              </div>
              <div className="mLeft16">
                {!this.isDisabled(item) && (!isChildTable || !item.detailTable) && !_.includes(hideTypes, 2) && (
                  <Checkbox
                    checked={item.property === 2 || item.property === 3}
                    onClick={checked => this.onChange(item, checked ? 1 : 2)}
                  />
                )}
              </div>
              <div className="mLeft16">
                {!this.isDisabled(item, 'REQUIRED') &&
                  (!isChildTable || !item.detailTable) &&
                  !_.includes(hideTypes, 3) && (
                    <Checkbox checked={item.property === 3} onClick={checked => this.onChange(item, checked ? 2 : 3)} />
                  )}
              </div>
              {showCard && (
                <div className="mLeft16 mRight16" style={{ width: 60 }}>
                  {!_.includes([14, 21, 40, 41, 42, 43, 45, 47, 49, 51, 52], item.type) && (
                    <Checkbox
                      checked={item.showCard}
                      onClick={checked => this.onChangeCard(item.id, checked ? 0 : 1)}
                    />
                  )}
                </div>
              )}
            </li>
            {item.type === 52 &&
              !_.includes(foldIds, item.id) &&
              !!data.filter(o => o.sectionId === item.id).length &&
              this.renderField(
                data.filter(o => o.sectionId === item.id),
                showCard,
                isChildTable,
                true,
              )}
          </Fragment>
        );
      });
  }

  render() {
    const { data, showCard, updateSource, hideTypes } = this.props;
    const { showTableControls, selectItem } = this.state;

    return (
      <Fragment>
        {this.renderContent({ data, showCard })}

        {showTableControls && (
          <Dialog
            visible
            width={680}
            title={_l('子表操作和列权限')}
            onCancel={() => this.setState({ showTableControls: false })}
            onOk={() => {
              updateSource({
                formProperties: data.map(item => {
                  if (item.id === selectItem.id) {
                    item = Object.assign({}, item, selectItem);
                  }

                  return item;
                }),
              });

              this.setState({ showTableControls: false });
            }}
          >
            <div className="Gray_9e">{_l('未开启时按照子表本身权限，开启后可配置子表的细分操作和列权限')}</div>
            <Switch
              className="mTop10"
              checked={selectItem.workflow}
              text={selectItem.workflow ? _l('开启') : _l('关闭%03087')}
              onClick={() =>
                this.setState({ selectItem: Object.assign({}, selectItem, { workflow: !selectItem.workflow }) })
              }
            />
            {selectItem.workflow && (
              <div className="flexRow relative mTop20">
                {!_.includes(hideTypes, 2) && (
                  <Fragment>
                    <div>
                      <div className="bold">{_l('操作')}</div>
                      {[
                        { text: _l('可新增明细'), key: 'allowAdd' },
                        { text: _l('可编辑已有明细'), key: 'allowEdit' },
                        { text: _l('可删除已有明细'), key: 'allowCancel' },
                      ].map(item => (
                        <Checkbox
                          key={item.key}
                          className="mTop15"
                          text={item.text}
                          checked={selectItem[item.key] === '1'}
                          onClick={checked =>
                            this.setState({
                              selectItem: Object.assign({}, selectItem, { [item.key]: !checked ? '1' : '0' }),
                            })
                          }
                        />
                      ))}
                    </div>
                    <Line />
                  </Fragment>
                )}

                <div className="flex">
                  <div className="bold">{_l('列权限')}</div>
                  {this.renderContent({ data: selectItem.subFormProperties, isChildTable: true })}
                </div>
              </div>
            )}
          </Dialog>
        )}
      </Fragment>
    );
  }
}
