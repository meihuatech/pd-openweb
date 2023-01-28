import React from 'react';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { FILTER_CONDITION_TYPE, DATE_OPTIONS } from 'worksheet/common/WorkSheetFilter/enum';
import NumberUtil from 'src/util/number';
import Text from './Text';
import Number from './Number';
import RelateRecord from './RelateRecord';
import Cascader from './Cascader';
import Options from './Options';
import DateTime from './DateTime';
import Time from './Time';
import CheckboxComp from './CheckboxComp';
import Users from './Users';
import Departments from './Departments';
import OrgRole from './OrgRole';
import Areas from './Areas';
import UnNormal from './UnNormal';
import _ from 'lodash';
import { shape } from 'prop-types';

function getType(control) {
  let { type } = control;
  if (type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD && control) {
    type = control.sourceControlType || -10000;
  }
  if (type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && control) {
    type = control.enumDefault2 || 6;
  }
  if (type === WIDGETS_TO_API_TYPE_ENUM.SEARCH) {
    type = WIDGETS_TO_API_TYPE_ENUM.TEXT;
  }
  return type;
}

const Comps = {};

function mapToComp(keys, Comp) {
  keys.forEach(key => (Comps[key] = Comp));
}

export const TextTypes = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
  WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮件地址
  WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
  WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
  WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
];

mapToComp(TextTypes, Text);

export const NumberTypes = [
  WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
  WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
  WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 公式
];

mapToComp(NumberTypes, Number);

export const RelateRecordTypes = [
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, // 关联
];
mapToComp(RelateRecordTypes, RelateRecord);

export const CascaderTypes = [
  WIDGETS_TO_API_TYPE_ENUM.CASCADER, // 级联
];
mapToComp(CascaderTypes, Cascader);

export const OptionsTypes = [
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉
];

mapToComp(OptionsTypes, Options);

export const CheckboxCompTypes = [
  WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框
];

mapToComp(CheckboxCompTypes, CheckboxComp);

export const DateTimeTypes = [
  WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间
];
mapToComp(DateTimeTypes, DateTime);

export const TimeTypes = [
  WIDGETS_TO_API_TYPE_ENUM.TIME, //  时间
];
mapToComp(TimeTypes, Time);

export const UsersTypes = [
  WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员
];
mapToComp(UsersTypes, Users);

export const DepartmentsTypes = [
  WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 部门
];
mapToComp(DepartmentsTypes, Departments);

export const RogRoleTypes = [
  WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE, // 组织角色
];
mapToComp(RogRoleTypes, OrgRole);

export const AreasTypes = [
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 地区 省
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 地区 省-市
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 地区 省-市-县
];
mapToComp(AreasTypes, Areas);

mapToComp([-10000], UnNormal); // 异常状态

export function validate(condition) {
  let dataType = getType({ type: condition.dataType });
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
        WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
        WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
        WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮件地址
        WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
        WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
        WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
        WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, // 关联
        WIDGETS_TO_API_TYPE_ENUM.CASCADER, // 级联
        WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
        WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
        WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉
        WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员
        WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 成员
        WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE, // 组织角色
        WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 地区 省
        WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 地区 省-市
        WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 地区 省-市-县
      ],
      dataType,
    )
  ) {
    return condition.values && condition.values.filter(_.identity).length;
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
        WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
        WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 公式
      ],
      dataType,
    )
  ) {
    return condition.filterType === FILTER_CONDITION_TYPE.BETWEEN
      ? NumberUtil.isNumberStr(condition.minValue) || NumberUtil.isNumberStr(condition.maxValue)
      : NumberUtil.isNumberStr(condition.value);
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框
      ],
      dataType,
    )
  ) {
    return _.includes([FILTER_CONDITION_TYPE.NE, FILTER_CONDITION_TYPE.EQ], condition.filterType);
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期
        WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间
        WIDGETS_TO_API_TYPE_ENUM.TIME, // 时间
      ],
      dataType,
    )
  ) {
    return condition.dateRange === 18
      ? !_.isUndefined(condition.minValue) && !_.isUndefined(condition.maxValue)
      : !!condition.dateRange;
  }
  return false;
}

export default function Input(props) {
  const { advancedSetting = {} } = props;
  const { allowitem } = advancedSetting;
  const isMultiple = String(allowitem) === '2';
  const type = getType(props.control);
  const Condition = Comps[type];
  return Condition ? (
    <Condition {...props} isMultiple={isMultiple} value={_.isUndefined(props.value) ? '' : props.value} />
  ) : (
    <span />
  );
}

Input.propTypes = {
  control: shape({}),
};
