import styled from 'styled-components';
import update from 'immutability-helper';

export const COVER_DISPLAY_MODE = [
  { value: 0, text: _l('填满') },
  { value: 1, text: _l('完整显示') },
  { value: 2, text: _l('圆形') },
  { value: 3, text: _l('矩形') },
];

export const COVER_DISPLAY_POSITION = [
  { value: '2', text: _l('上') },
  { value: '1', text: _l('左') },
  { value: '0', text: _l('右') },
];

export const updateViewAdvancedSetting = (view, obj) => {
  const { advancedSetting = {} } = view;
  return update(advancedSetting, { $apply: item => ({ ...item, ...obj }) });
};

// 不能作为视图排序的控件
export const CAN_NOT_AS_VIEW_SORT = [14, 19, 21, 22, 23, 24, 25, 34, 35, 40, 41, 43, 45, 10010];

export const ViewSettingWrap = styled.div`
  .withSwitchConfig {
    display: flex;
    justify-content: space-between;
    .configSwitch {
      display: flex;
      align-items: center;
      .icon {
        vertical-align: middle;
        &-ic_toggle_on {
          color: #00c345;
        }
        &-ic_toggle_off {
          color: #bdbdbd;
        }
      }
      .switchText {
        margin-right: 6px;
        line-height: 24px;
      }
    }
  }
  .title {
    font-weight: bold;
    // margin-top: 12px;
    &:first-child {
      margin: 0;
    }
  }
  .subTitle {
    margin-top: 12px;
    color: #515151;
    &.withDisplayControl {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  .settingContent {
    margin-top: 10px;
  }
  .Dropdown {
    background-color: #fff;
    &.disabled {
      background-color: #f5f5f5;
    }
  }
`;

export const NORMAL_SYSTEM_FIELDS_SORT = ['rowid', 'caid', 'ownerid', 'uaid', 'ctime', 'utime'];
export const WORKFLOW_SYSTEM_FIELDS_SORT = [
  'wfname',
  'wfstatus',
  'wfcuaids',
  'wfrtime',
  'wfftime',
  'wfdtime',
  'wfcaid',
  'wfctime',
  'wfcotime',
];
