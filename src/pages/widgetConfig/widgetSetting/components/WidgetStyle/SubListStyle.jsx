import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import cx from 'classnames';
import WidgetRowHeight from '../WidgetRowHeight';
import AttachmentConfig from '../AttachmentConfig';
import { SettingItem, AnimationWrap } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';

const DISPLAY_LIST = [
  {
    text: _l('滚动'),
    value: '1',
  },
  {
    text: _l('分页'),
    value: '2',
  },
];

const DISPLAY_FROZEN_LIST = [
  {
    text: _l('不冻结'),
    value: '0',
  },
  {
    text: _l('1列'),
    value: '1',
  },
  {
    text: _l('2列'),
    value: '2',
  },
  {
    text: _l('3列'),
    value: '3',
  },
];

export default function SubListStyle(props) {
  const { data, onChange } = props;
  const {
    showtype = '1',
    blankrow = '1',
    rownum = '15',
    hidenumber,
    titlewrap,
    layercontrolid,
  } = getAdvanceSetting(data);
  const freezeIds = getAdvanceSetting(data, 'freezeids') || [];

  const { mode, sheetInfo } = window.subListSheetConfig[data.controlId] || {};
  const tableControls = _.get(sheetInfo, ['template', 'controls']) || _.get(sheetInfo, 'relationControls') || [];
  const tableData = tableControls
    .filter(c => c.type === 29 && c.dataSource === _.get(sheetInfo, 'worksheetId') && c.enumDefault === 1)
    .map(i => ({ value: i.controlId, text: i.controlName }));

  const isDelete = layercontrolid && !_.find(tableControls, t => t.controlId === layercontrolid);
  const isUnSupport =
    layercontrolid &&
    !_.find(tableData, t => t.value === layercontrolid) &&
    _.find(tableControls, t => t.controlId === layercontrolid);

  return (
    <Fragment>
      <WidgetRowHeight {...props} />
      <SettingItem>
        <div className="settingItemTitle">{_l('冻结列')}</div>
        <AnimationWrap>
          {DISPLAY_FROZEN_LIST.map(({ text, value }) => {
            return (
              <div
                className={cx('animaItem overflow_ellipsis', { active: (freezeIds[0] || '0') === value })}
                onClick={() =>
                  onChange(
                    handleAdvancedSettingChange(data, { freezeids: value === '0' ? '' : JSON.stringify([value]) }),
                  )
                }
              >
                {text}
              </div>
            );
          })}
        </AnimationWrap>
      </SettingItem>
      {mode === 'relate' && (
        <SettingItem>
          <div className="settingItemTitle">
            {_l('树形表格')}
            {isUnSupport && (
              <Tooltip popupPlacement="bottom" title={_l('该关联记录字段不是一对多关系')}>
                <Icon className="Font20 mLeft8 Red" icon="error1" />
              </Tooltip>
            )}
          </div>
          <Dropdown
            border
            className={cx({ error: isUnSupport })}
            cancelAble
            placeholder={isDelete ? <span className="Red">{_l('已删除')}</span> : _l('选择子表中的关联本表字段')}
            value={isDelete ? undefined : layercontrolid || undefined}
            renderTitle={() => {
              return _.get(
                _.find(tableControls, t => t.controlId === layercontrolid),
                'controlName',
              );
            }}
            data={tableData}
            noData={_l('未添加关联本表字段')}
            onChange={value =>
              onChange(
                handleAdvancedSettingChange(data, {
                  layercontrolid: value || '',
                  ...(value ? { showcount: '1', showtype: '1' } : {}),
                }),
              )
            }
          />
          <div className="mTop10 Gray_9e">
            {_l('选择一个一对多关系的本表关联字段，数据将按此字段的父级（单条）、子级（多条）关系构成树形表格')}
          </div>
        </SettingItem>
      )}
      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <AnimationWrap>
          {DISPLAY_LIST.map(({ text, value }) => {
            const disabled = value === '2' && layercontrolid;
            return (
              <div
                className={cx('animaItem overflow_ellipsis', {
                  active: showtype === value,
                  disabled: disabled,
                })}
                onClick={() => {
                  if (disabled) return;
                  onChange(handleAdvancedSettingChange(data, { showtype: value }));
                }}
              >
                {text}
              </div>
            );
          })}
        </AnimationWrap>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('默认空行')}
          <Tooltip
            placement={'bottom'}
            title={_l('开启后无论子表中是否存在记录，都会显示固定数量的行数。当子表没有记录时，将显示空白行。')}
          >
            <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
          </Tooltip>
        </div>
        <div className="flexCenter">
          <AttachmentConfig
            data={handleAdvancedSettingChange(data, { blankrow })}
            attr="blankrow"
            maxNum={Number(rownum) || 15}
            minCount={0}
            onChange={value => {
              let tempRow = getAdvanceSetting(value, 'blankrow');
              if (tempRow > Number(rownum)) {
                tempRow = Number(rownum) || 0;
              }
              onChange(handleAdvancedSettingChange(data, { blankrow: tempRow.toString() }));
            }}
          />
          <span className="mLeft12">{_l('行')}</span>
        </div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">
          {showtype === '1' ? _l('最大高度（滚动方式）') : _l('最大高度（每页行数）')}
        </div>
        <div className="flexCenter">
          <AttachmentConfig
            data={handleAdvancedSettingChange(data, { rownum })}
            attr="rownum"
            maxNum={200}
            onChange={value => {
              let tempRowNum = getAdvanceSetting(value, 'rownum');
              if (tempRowNum < Number(blankrow)) {
                tempRowNum = Number(blankrow) || 15;
              }
              onChange(handleAdvancedSettingChange(data, { rownum: tempRowNum.toString() }));
            }}
          />
          <span className="mLeft12">{_l('行')}</span>
        </div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('其他')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={hidenumber !== '1'}
            text={_l('显示序号')}
            onClick={checked => {
              onChange(
                handleAdvancedSettingChange(data, {
                  hidenumber: checked ? '1' : '0',
                }),
              );
            }}
          />
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={titlewrap === '1'}
            text={_l('标题行文字换行')}
            onClick={checked => {
              onChange(
                handleAdvancedSettingChange(data, {
                  titlewrap: checked ? '0' : '1',
                }),
              );
            }}
          />
        </div>
      </SettingItem>
    </Fragment>
  );
}