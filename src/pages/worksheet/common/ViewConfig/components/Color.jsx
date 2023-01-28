import React from 'react';
import { Icon } from 'ming-ui';
import { Select } from 'antd';
import { getIconByType } from 'src/pages/widgetConfig/util';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';
const CalendarColorChoose = styled.div`
   {
    position: relative;
    .Red {
      position: absolute;
      left: 10px;
      top: 8px;
    }
    .dropColor {
      width: 100%;
      .ant-select-selector {
        border-radius: 3px !important;
        height: 36px !important;
        .ant-select-selection-item {
          line-height: 36px !important;
        }
      }
      &.isDelete {
        .ant-select-selector {
          border-color: red !important;
        }
        .ant-select-selection-item {
          opacity: 0;
          z-index: 1;
        }
      }
    }
    li {
      .itemText {
        padding-left: 10px;
      }
      &:hover {
        .itemText {
          color: #fff;
        }
      }
    }
  }
`;
// 颜色
export default class Color extends React.Component {
  render() {
    const { worksheetControls = [], view, handleChange, txt, title } = this.props;
    const { advancedSetting = {} } = view;
    const { colorid } = advancedSetting;
    let colorControls = worksheetControls.filter(item => _.includes([9, 11], item.type));
    let colorData = worksheetControls.find(it => it.controlId === colorid) || {};
    let isDelete = colorid && !worksheetControls.find(it => it.controlId === colorid);
    return (
      <React.Fragment>
        <div className="title Font13 bold mTop32">{title}</div>
        <div className="settingContent">
          <p className="mTop6 mBottom8 Gray_9e viewSetText">{txt}</p>
          <CalendarColorChoose>
            <Select
              className={cx('dropColor', { isDelete })}
              value={[colorid]}
              optionLabelProp="label"
              placeholder={_l('请选择')}
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              allowClear={colorid}
              dropdownClassName="dropConOption"
              onChange={value => {
                if (value === colorid) {
                  return;
                }
                handleChange({ colorid: value });
              }}
              notFoundContent={_l('当前工作表中没有单选字段，请先去添加一个')}
            >
              {colorControls.map((item, i) => {
                const labelNode = (
                  <div className="">
                    <i className={cx('icon Gray_9e mRight5 Font14', 'icon-' + getIconByType(item.type))}></i>
                    {item.controlName}
                  </div>
                );
                return (
                  <Select.Option value={item.controlId} key={i} label={labelNode}>
                    {labelNode}
                  </Select.Option>
                );
              })}
            </Select>
            {isDelete && <span className="Red pLeft10">{_l('该字段已删除')}</span>}
          </CalendarColorChoose>
        </div>
      </React.Fragment>
    );
  }
}
