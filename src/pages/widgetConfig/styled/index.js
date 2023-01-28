import styled from 'styled-components';

export const SettingItem = styled.div`
  margin-top: 20px;
  position: relative;
  .ant-input {
    font-size: 13px;
    color: #333;
    line-height: 26px;
    border-radius: 3px;
  }
  .checkboxWrap {
    display: flex;
    align-items: center;
  }
  &.withSplitLine {
    border-top: 1px solid #eee;
    padding-top: 24px;
  }
  .ming.Dropdown {
    background-color: #fff;
    &.disabled {
      background-color: #f5f5f5;
    }
  }
  .ming.Radio {
    flex: 1;
    line-height: 24px;
  }
  .ming.Checkbox {
    display: flex;
    align-items: center;
  }
  .settingItemTitle {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: bold;
    .icon-help {
      margin-left: 5px;
    }
  }
  .labelWrap {
    display: flex;
    margin-top: 4px;
    .icon-help {
      margin-left: 4px;
    }
    .ming.Checkbox .Checkbox-box {
      margin-right: 10px;
      .icon-help {
        margin-left: 4px;
      }
    }
  }
  .Dropdown {
    /* margin: 16px 0; */
    width: 100%;
  }
  .ming.Menu {
    width: 100%;
  }
  .dropdownWrapper {
    display: block;
  }
  .singleLineRadio {
    label {
      width: 50%;
      margin: 0;
    }
  }
  textarea {
    resize: none;
  }
  .credTypesWrap {
    .ming.Radio {
      margin: 12px 0 0 0;
      flex-basis: 50%;
    }
  }
  .customTip {
    margin-top: 6px;
    position: relative;
  }
  .emptyText {
    margin: 0 auto;
    line-height: 38px;
    color: #9e9e9e;
    font-size: 13px;
    text-align: center;
  }
  .subTitle {
    margin-bottom: 6px;
  }
  .labelBetween {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .Calendar-column-header {
    flex: 1;
  }
`;
export const RelateInfo = styled.div`
  margin-top: 12px;
  i {
    font-size: 18px;
    color: #757575;
  }
  .text {
    margin: 0 4px;
  }
  .name {
    color: #2196f3;
  }
`;
export const InfoWrap = styled.div`
  border: 1px solid #ddd;
  border-radius: 3px;
  color: #757575;
  line-height: 34px;
  padding: 0 12px;
  background: ${props => props.bgColor || '#fff'};
`;

export const EditInfo = styled(InfoWrap)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  .edit {
    font-size: 15px;
    color: #9e9e9e;
  }
  &:hover {
    background-color: #fafafa;
    border: 1px solid #d8d8d8;
    .edit {
      color: #2196f3;
    }
  }
  &.borderError {
    border-color: #f44336;
    background: #fef2f4;
    color: #f44336;
  }
`;

export const DropdownPlaceholder = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 36px;
  border: 1px solid #ddd;
  margin-top: 12px;
  border-radius: 3px;
  padding: 0 5px 0 12px;
  cursor: pointer;
  &.active,
  &:hover {
    border-color: #2196f3;
    &.disabled {
      border-color: #ddd;
    }
    &.deleted {
      border-color: #ff0000;
    }
  }
  &.disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  &.deleted {
    background-color: rgba(251, 238, 241);
    color: #ff0000;
    border: 1px solid #ff0000;
    cursor: pointer;
  }
  &.invalid {
    border-color: currentColor !important;
    color: #f44336;
    background-color: #fff2f4;
    i {
      color: #f44336;
    }
  }
  &.placeholder {
    color: #bdbdbd;
  }
`;

export const SelectFieldsWrap = styled.div`
  &.isolate {
    position: absolute;
    width: 100%;
    z-index: 3;
  }
  padding: 6px 0;
  border-radius: 3px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  border: 1px solid #eee;
  background-color: #fff;
  .emptyText {
    margin: 0 auto;
    line-height: 38px;
    color: #9e9e9e;
    font-size: 13px;
    text-align: center;
  }
  .clearValue {
    line-height: 36px;
    color: #2196f3;
    padding-left: 12px;
    cursor: pointer;
    &:hover {
      background-color: #2196f3;
      color: #fff;
    }
  }
  .search {
    position: relative;
    margin-bottom: 8px;
    i {
      position: absolute;
      top: 11px;
      left: 16px;
      font-size: 16px;
    }
    input {
      box-sizing: border-box;
      width: 100%;
      height: 36px;
      border: none;
      outline: none;
      padding-left: 40px;
      border-bottom: 1px solid #eee;
      &::placeholder {
        color: #ccc;
      }
    }
  }
  .fieldsWrap {
    max-height: 400px;
    overflow-y: auto;
  }
  .relateSheetList {
    border-top: 1px solid #ddd;
    background-color: #fff;
    margin-top: 8px;
    &:first-child {
      border-top: none;
      margin-top: 0px;
    }
    .title {
      padding: 12px 0 0 16px;
      font-weight: bold;
      max-width: 220px;
      margin-bottom: 8px;
    }
  }
  .fieldList {
    background-color: #fff;
    overflow: auto;
    li {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 36px;
      max-width: 320px;
      line-height: 36px;
      padding: 0 16px;
      cursor: pointer;
      &:hover {
        background-color: #2196f3;
        color: #fff;
        i {
          color: #fff;
        }
      }
      i {
        font-size: 16px;
        color: #9e9e9e;
        margin-right: 8px;
      }
    }
  }
`;

export const CommonDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 0 12px;
  border: 1px solid #ddd;
  height: ${props => props.height || 34}px;
  line-height: 34px;
  color: #9e9e9e;
  border-radius: 3px;
  background-color: #fff;
  overflow: hidden;
  .intro {
    display: flex;
    align-items: center;
  }
  .hint {
    flex: 1;
    overflow: hidden;
    padding-right: 12%;
  }
  .unit {
    max-width: 20%;
    flex-shrink: 0;
    padding-left: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.prefix {
      padding: 0 12px 0 0;
    }
  }
  &.select {
    i {
      margin: 0;
    }
  }
  i {
    font-size: 13px;
    color: #9e9e9e;
    margin-right: 4px;
  }
`;

export const CircleAdd = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size || 24}px;
  height: ${props => props.size || 24}px;
  border-radius: 50%;
  border: 1px solid #ddd;
  margin-top: 12px;
  i {
    font-size: 14px;
  }
`;

export const OptionsWrap = styled.div`
  display: flex;
  flex-direction: column;
  &.horizontal {
    flex-direction: row;
    .option {
      width: 140px;
    }
  }
  flex-wrap: wrap;
  .option {
    display: flex;
    align-items: center;
    max-width: 100%;
    margin-right: 16px;
    margin-top: 8px;
    .ming.Radio {
      margin: 0;
    }
    .ming.Checkbox {
      flex-shrink: 0;
    }
  }
`;
export const OptionWrap = styled.div`
  padding: 0 12px;
  line-height: 24px;
  border-radius: 18px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &.horizontal {
    max-width: 140px;
  }
  &.light {
    color: #333;
  }
  &.withoutColor {
    background: transparent;
    color: #333;
    padding: 0 4px;
  }
  background-color: ${props => props.color || '#2196f3'};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const EditModelWrap = styled.div`
  padding: 0px 0 20px 0;
  .desc {
    line-height: 13px;
    &.subList {
      margin-bottom: 8px;
    }
  }
  .operationWrap.isActive {
    visibility: true;
  }
  .operationIconWrap {
    padding: 0 4px;
    i {
      font-size: 18px;
    }
  }
  .resizeWidth {
    border-right: 1px solid #e0e0e0;
  }
  .tableWrap {
    position: relative;
    z-index: 2;
    overflow: auto;
  }

  th,
  td {
    box-sizing: border-box;
    padding-left: 6px;
    width: 160px;
    max-width: 160px;
    height: 42px;
    font-weight: normal;
    background-color: #fff;
    border: 1px solid #ddd;
  }

  th span {
    color: #f44336;
    vertical-align: middle;
    margin-right: 2px;
  }
  .unSupport {
    font-size: 12px;
    vertical-align: initial;
  }
  .addControl {
    height: 84px;
    line-height: 84px;
    text-align: center;
    font-size: 12px;
    border: 1px solid #ddd;
    background-color: #fff;
  }
`;
export const EmptySheetPlaceHolder = styled.div`
  height: 84px;
  line-height: 84px;
  text-align: center;
  font-size: 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #9e9e9e;
`;

export const ControlTag = styled.div`
  line-height: 24px;
  padding: 0 12px;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  &.invalid {
    color: #f44336;
    background: rgba(244, 67, 54, 0.06);
    border-color: #f44336;
  }
`;

export const WidgetIntroWrap = styled.div`
  /* padding: 12px 16px; */
  border-radius: 4px;
  .iconWrap {
    &:hover {
      color: #2196f3;
    }
  }
  .Dropdown--input {
    background-color: #fff;
  }
  .title {
    display: flex;
    align-items: center;
    .icon {
      font-size: 18px;
      color: #757575;
    }
    > span {
      margin-left: 8px;
      font-size: 15px;
      font-weight: 700;
    }
  }
  .introText {
    margin-top: 8px;
    color: #9e9e9e;
    font-size: 12px;
    .Font13 {
      font-size: 12px !important;
    }
  }
  .introSwitch {
    position: absolute;
    top: 0;
    right: 0;
  }
  .transferToSheet {
    position: absolute;
    top: -6px;
    right: 0;
    height: 26px;
    line-height: 26px;
    padding: 0px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 30px;
    background-color: #fff;
    cursor: pointer;
    color: #757575;
    &:hover {
      color: #2196f3;
    }
  }
  .introSwitchMenu {
    width: 160px;
    left: -138px !important;
    .Item-content {
      padding-left: 16px !important;
      i {
        margin-right: 10px;
      }
    }
  }
`;

export const DropdownContent = styled.div`
  min-height: 36px;
  overflow: auto;
  background: #ffffff;
  border-radius: 3px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.24);
  padding: 6px 0;
  .empty {
    padding: 0 16px;
    color: #9e9e9e;
    cursor: pointer;
  }
  .title {
    font-weight: bold;
    padding: 6px 16px 6px;
  }
  .item {
    display: flex;
    align-items: center;
    line-height: 36px;
    padding: 0 16px;
    cursor: pointer;
    transition: background-color color 0.25s;
    i {
      margin-right: 6px;
      color: #9e9e9e;
    }
    .text {
      margin-right: 6px;
    }
    &.disabled {
      cursor: not-allowed;
      color: #bdbdbd;
    }
    &:not(disabled):hover {
      background-color: #2196f3;
      color: #ffffff;
      i {
        color: #ffffff;
      }
    }
  }
`;

export const DialogFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export { Button, DropdownOverlay } from './common';
