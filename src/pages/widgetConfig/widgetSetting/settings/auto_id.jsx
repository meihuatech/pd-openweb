import React, { Fragment } from 'react';
import styled from 'styled-components';
import { arrayMove, SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import update from 'immutability-helper';
import { isEmpty } from 'lodash';
import { Dropdown } from 'antd';
import { useSetState } from 'react-use';
import { Menu, MenuItem } from 'ming-ui';
import Icon from 'src/components/Icon';
import { SettingItem, InfoWrap, DropdownPlaceholder } from '../../styled';
import { getControlByControlId, getIconByType } from '../../util';
import { getAdvanceSetting, handleAdvancedSettingChange, isAutoNumberSelectableControl } from '../../util/setting';
import Components from '../components';
import AutoIdComponent from '../components/autoId';

const RuleInfo = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  .dragIcon {
    align-self: flex-end;
    margin-bottom: 12px;
  }

  .delWrap {
    display: flex;
    align-items: center;
    color: #f44336;
    i {
      margin-right: 4px;
    }
  }
  .relateControlInfo {
    line-height: 24px;
    margin: 6px 0;
    color: #333;
    i {
      vertical-align: text-bottom;
    }
  }
  .controlName {
    margin: 0 6px;
  }
  .controlInfo {
    color: #333;
    i {
      vertical-align: text-bottom;
    }
  }
  .rule {
    flex: 1;
    margin-left: 8px;
    line-height: 36px;
    border-radius: 3px;
    background-color: #fff;

    .deleteRuleIcon {
      visibility: hidden;
    }

    &:hover {
      .deleteRuleIcon {
        visibility: visible;
      }
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .title {
        transition: all 0.25s;
        line-height: 26px;
        line-height: 26px;
        margin-top: 6px;
      }
      .errorHint {
        color: #f44336;
      }
    }
    .ruleItem {
      display: flex;
      justify-content: space-between;
      align-items: center;
      &.numberConfig {
        i {
          visibility: hidden;
        }
        &:hover {
          i {
            visibility: visible;
          }
        }
      }
    }
    .name {
      flex: 1;
      padding-left: 12px;
    }
  }
`;

const RuleList = styled.ul`
  .addRule {
    color: #2196f3;
    margin: 12px 0 0 20px;
    cursor: pointer;
    i {
      margin-right: 6px;
    }
  }
`;

const TYPE_TO_TITLE = {
  1: _l('编号'),
  2: _l('固定字符'),
  3: _l('引用字段'),
  4: _l('创建时间'),
};

const NUMBER_TYPE_TO_TEXT = {
  0: _l('不重置'),
  1: _l('每天重置'),
  2: _l('每周重置'),
  3: _l('每月重置'),
  4: _l('每年重置'),
};

const TIME_MODE = [
  {
    value: 'YYYYMMDD',
    text: 'YYYYMMDD',
  },
  {
    value: 'YYYYMM',
    text: 'YYYYMM',
  },
  {
    value: 'MMDD',
    text: 'MMDD',
  },
  {
    value: 'YYYY',
    text: 'YYYY',
  },
  {
    value: 'custom',
    text: _l('自定义'),
  },
];

const DEFAULT_PARA = { 4: { format: 'YYYYMMDD', type: 4 } };

const DragHandle = SortableHandle(() => <i className="icon-drag Gray_75 dragIcon ThemeHoverColor3 pointer"></i>);

const SortableItem = SortableElement(({ index, rule, allControls, deleteRule, updateRule, ...rest }) => {
  const [{ numberConfigVisible, timeFormatVisible }, setVisible] = useSetState({
    numberConfigVisible: false,
    timeFormatVisible: false,
  });
  const { controlId, rcid, relationControlName, controlName, controlType, format, type, repeatType } = rule;
  const getControlInfo = () => {
    if (!controlId) return _l('请选择字段');
    if (!controlName || (!rcid && isEmpty(getControlByControlId(allControls, controlId)))) {
      return (
        <div className="delWrap">
          <Icon style={{ color: '#f44336' }} icon="delete" type="delete" />
          <span>{_l('字段已删除')}</span>
        </div>
      );
    }
    if (relationControlName) {
      return (
        <div className="relateControlInfo">
          <Icon icon={getIconByType(controlType)} />
          <span className="controlName">{controlName}</span>
          <span className="Gray_75">{relationControlName}</span>
        </div>
      );
    }
    return (
      <div className="controlInfo">
        <Icon icon={getIconByType(controlType)} />
        <span className="controlName">{controlName}</span>
      </div>
    );
  };
  const handleTimeSelect = value => {
    if (value === 'custom') {
      setVisible({ timeFormatVisible: true });
      return;
    }
    updateRule({ format: value });
  };
  const renderRuleItem = () => {
    if (type === 1) {
      return (
        <InfoWrap className="ruleItem numberConfig">
          <div className="text Gray">
            {rule.length > 0
              ? _l('%0位数, %1', rule.length, NUMBER_TYPE_TO_TEXT[repeatType])
              : _l('自然数编号,%0', NUMBER_TYPE_TO_TEXT[repeatType])}
          </div>
          <Icon icon="edit" type="link" onClick={() => setVisible({ numberConfigVisible: true })} />
        </InfoWrap>
      );
    }
    if (type === 3) {
      return (
        <Dropdown
          trigger="click"
          className="mTop0"
          overlay={
            <Components.SelectControlWithRelate
              {...rest}
              allControls={allControls}
              filter={controls => _.filter(controls, isAutoNumberSelectableControl)}
              onClick={({ fieldId, relateSheetControlId, ...rest }) =>
                updateRule({ controlId: fieldId, rcid: relateSheetControlId, ...rest })
              }
            />
          }
        >
          <DropdownPlaceholder>
            {getControlInfo()}
            {<Icon icon="expand_more" />}
          </DropdownPlaceholder>
        </Dropdown>
      );
    }
    if (type === 4) {
      const text = !['YYYYMMDD', 'YYYYMM', 'MMDD', 'YYYY'].includes(format) ? `自定义: ${format}` : format;
      return (
        <Dropdown
          trigger="click"
          className="mTop0"
          overlay={
            <Menu width={'100%'}>
              {TIME_MODE.map(({ value, text }) => (
                <MenuItem key={value} onClick={() => handleTimeSelect(value)}>
                  {text}
                </MenuItem>
              ))}
            </Menu>
          }
        >
          <DropdownPlaceholder color={format ? '#333' : '#bdbdbd'}>
            {text || 'YYYYMMDD'} <Icon icon="expand_more" />
          </DropdownPlaceholder>
        </Dropdown>
      );
    }
  };
  return (
    <RuleInfo>
      <DragHandle />
      <div className="rule" onMouseDown={() => {}}>
        {type === 2 ? (
          <AutoIdComponent.StrInput rule={rule} updateRule={updateRule} deleteRule={deleteRule} />
        ) : (
          <Fragment>
            <div className="header">
              <div className="title">{TYPE_TO_TITLE[type]}</div>
              {type !== 1 && (
                <Icon className="deleteRuleIcon" type="delete" icon="delete_12" onMouseDown={deleteRule} />
              )}
            </div>
            {renderRuleItem()}
          </Fragment>
        )}
      </div>
      {numberConfigVisible && (
        <AutoIdComponent.AutoNumberConfig
          rule={rule}
          onClose={() => setVisible({ numberConfigVisible: false })}
          onOk={data => updateRule(data)}
        />
      )}
      {timeFormatVisible && (
        <AutoIdComponent.TimeFormatConfig
          rule={rule}
          onClose={() => setVisible({ timeFormatVisible: false })}
          onOk={data => updateRule({ format: data })}
        />
      )}
    </RuleInfo>
  );
});
const SortableRules = SortableContainer(({ rules, deleteRule, updateRule, addRule, fromExcel, ...rest }) => {
  const getTypes = () => {
    return rules.some(item => item.type === 4)
      ? [
          { value: 2, text: _l('固定字符') },
          { value: 3, text: _l('引用字段') },
        ]
      : [
          { value: 2, text: _l('固定字符') },
          { value: 4, text: _l('创建时间') },
          { value: 3, text: _l('引用字段') },
        ];
  };
  const typesData = fromExcel ? getTypes().filter(i => i.value !== 3) : getTypes();
  return (
    <RuleList>
      {rules.map((rule, index) => (
        <SortableItem
          key={`${rule.type}-${index}`}
          index={index}
          rule={rule}
          updateRule={obj => updateRule(index, obj)}
          deleteRule={() => deleteRule(index)}
          {...rest}
        />
      ))}
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu style={{ width: '100%' }}>
            {typesData.map(({ value, text }) => (
              <MenuItem key={value} onClick={() => addRule(value)}>
                {text}
              </MenuItem>
            ))}
          </Menu>
        }
      >
        <li className="addRule">
          <i className="icon-add Font16"></i>
          {_l('添加规则')}
        </li>
      </Dropdown>
    </RuleList>
  );
});

export default function AutoId({ data, onChange, ...rest }) {
  const rules = getAdvanceSetting(data, 'increase') || [{ type: 1, repeatType: 0, start: '', length: 0, format: '' }];

  const handleRulesChange = newRules => {
    onChange(handleAdvancedSettingChange(data, { increase: JSON.stringify(newRules) }));
  };

  const deleteRule = index => {
    const nextRules = update(rules, { $splice: [[index, 1]] });
    handleRulesChange(nextRules);
  };

  const addRule = type => {
    const defaultPara = DEFAULT_PARA[type] || {};
    const nextRules = update(rules, { $push: [{ type, ...defaultPara }] });
    handleRulesChange(nextRules);
  };

  const updateRule = (index, obj) => {
    const nextRules = update(rules, { [index]: { $apply: item => ({ ...item, ...obj }) } });
    handleRulesChange(nextRules);
  };

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('编号规则')}</div>
        <SortableRules
          {...rest}
          helperClass="zIndex99999"
          distance={5}
          rules={rules}
          onSortEnd={({ oldIndex, newIndex }) => {
            handleRulesChange(arrayMove(rules, oldIndex, newIndex));
          }}
          deleteRule={deleteRule}
          addRule={addRule}
          updateRule={updateRule}
        />
      </SettingItem>
    </Fragment>
  );
}
