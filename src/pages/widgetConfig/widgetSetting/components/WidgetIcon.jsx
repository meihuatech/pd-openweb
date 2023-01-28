import React from 'react';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import { SettingItem } from '../../styled';
import { DISPLAY_ICON } from '../../config/score';
import DropdownWrapper from 'worksheet/components/DropdownWrapper';
import { handleAdvancedSettingChange, getAdvanceSetting } from '../../util/setting';

const WidgetIconStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 12px;
  .icon_item {
    width: 34px;
    height: 34px;
    margin-right: 2px;
    cursor: pointer;
    font-size: 22px;
    text-align: center;
    line-height: 34px;
    border-radius: 2px;
    color: #9e9e9e;
    &:nth-child(8) {
      margin-right: 0px;
    }
    &:nth-child(16) {
      margin-right: 0px;
    }
    &:hover {
      background: #2196f3;
      color: #fff;
    }
  }
`;

const DropdownInput = styled.div`
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
  height: 36px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

export default function WidgetIcon({ data, onChange }) {
  const { itemicon } = getAdvanceSetting(data);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('样式')}</div>
      <DropdownWrapper
        downElement={
          <WidgetIconStyle>
            {DISPLAY_ICON.map(item => {
              return (
                <div
                  className="icon_item"
                  onClick={() => {
                    onChange(handleAdvancedSettingChange(data, { itemicon: item.name }));
                  }}
                >
                  <Icon icon={item.name} />
                </div>
              );
            })}
          </WidgetIconStyle>
        }
      >
        <DropdownInput>
          <Icon icon={itemicon} className="Font22 Gray_9e" />
          <span className="icon-arrow-down-border mLeft8 Gray_9e" />
        </DropdownInput>
      </DropdownWrapper>
    </SettingItem>
  );
}
