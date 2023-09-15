import React, { useState, Fragment } from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { Checkbox, Radio } from 'ming-ui';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { Tooltip } from 'antd';
import update from 'immutability-helper';
import { useSetState } from 'react-use';
import { every, includes, pull } from 'lodash';
import { isLightColor, getUnUniqName } from 'src/util';
import { getAdvanceSetting, parseOptionValue } from '../../../util/setting';
import SelectColor from './SelectColor';
import { OPTION_COLORS_LIST } from '../../../config';
import BatchAdd from './BatchAdd';
import AssignValue from './AssignValue';
import 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/inputTypes/SubSheet/style.less';

const OptionsWrap = styled.div`
  margin-top: 8px;

  .dragPointer {
    &:hover {
      cursor: move;
    }
  }
`;

const HandleOption = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;

  .operate {
    display: flex;
    align-items: center;
    width: 116px;
    &.flexEnd {
      justify-content: flex-end;
    }
  }

  .hoverText {
    color: #757575;
    cursor: pointer;
    &:hover {
      color: #2196f3;
    }
  }

  .addOptions {
    display: flex;
    align-items: center;
    color: #2196f3;
    cursor: pointer;
    &:hover {
      color: #2b65c4;
    }
  }

  .otherAdd {
    &.disabled {
      color: #bdbdbd !important;
      cursor: not-allowed;
    }
  }
`;
const DragItem = styled.li`
  display: flex;
  align-items: center;
  background-color: #fff;
  i {
    color: #9e9e9e;
    &:hover {
      color: #757575;
    }
  }

  .colorWrap {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    &:hover {
      box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.2);
    }
    .tri {
      width: 0;
      height: 0;
      border: 4px solid transparent;
      border-top-color: #fff;
      &.isLight {
        border-top-color: rgba(0, 0, 0, 0.7);
      }
      transform: translate(5px, 8px);
    }
  }

  .optionContent {
    margin-left: ${props => (props.isOther ? '21px' : '8px')}
    padding-right: 8px;
    display: flex;
    align-items: center;
    flex: 1;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    border-color: ${props => (props.isFocus ? '#2196f3' : '#f0f0f0')};
  }

  .checkWrap {
    .ming.Checkbox {
      height: 18px;
    }
  }

  .optionName {
    flex: 1;
    padding: 0 8px;
  }
  .ming.Radio {
    margin: 0;
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    line-height: 37px;
    &:hover {
      ${props => (props.isFocus ? '' : 'background: #f5f5f5;cursor: pointer;')} ;
    }
  }
  .deleteWrap {
    color: #9e9e9e;
  }
`;

const DragHandle = SortableHandle(() => (
  <Tooltip title={_l('拖拽调整排序')}>
    <div className="pointer dragPointer">
      <i className="icon-drag"></i>
    </div>
  </Tooltip>
));

const OptionItem = SortableElement(
  ({
    checkedValue = [],
    addOption,
    item,
    focusIndex,
    switchChecked,
    mode,
    options,
    idx: index,
    colorful,
    isMulti,
    updateOption,
    setIndex,
  }) => {
    const [visible, setVisible] = useState(false);
    const isFocus = index === focusIndex;
    const { key, value, isDeleted, color } = item;
    const checked = includes(checkedValue, key);
    const isOther = key === 'other' && !isDeleted;
    return (
      <DragItem isOther={isOther} isFocus={isFocus}>
        {!isDeleted && (
          <Fragment>
            {!isOther && <DragHandle />}
            <div className="optionContent">
              {colorful && (
                <Trigger
                  action={['click']}
                  popup={
                    <SelectColor
                      onClickAway={() => setVisible(false)}
                      color={item.color || OPTION_COLORS_LIST[index % OPTION_COLORS_LIST.length]}
                      onChange={color => updateOption(index, { color })}
                    />
                  }
                  popupAlign={{ points: ['tl', 'bl'], offset: [-45, 10] }}
                >
                  <div className="colorWrap pointer" style={{ backgroundColor: color }}>
                    <div className={cx('tri', { isLight: isLightColor(color) })}></div>
                  </div>
                </Trigger>
              )}
              <div className="optionName">
                <input
                  id={key}
                  autoFocus={isFocus}
                  value={value}
                  onFocus={() => setIndex(index)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isOther) {
                      addOption(false, index + 1);
                    }
                    // focus上、下
                    if (e.which === 38 || e.which === 40) {
                      let nextIndex =
                        e.which === 38
                          ? focusIndex === 0
                            ? options.length - 1
                            : focusIndex - 1
                          : focusIndex === options.length - 1
                          ? 0
                          : focusIndex + 1;
                      setIndex(nextIndex);
                      setTimeout(() => {
                        document.getElementById(_.get(options[nextIndex], 'key')).select();
                      }, 50);
                    }
                  }}
                  onChange={e => updateOption(index, { value: e.target.value })}
                  onBlur={e => {
                    updateOption(index, { value: e.target.value.trim() });
                    setIndex(-1);
                  }}
                />
              </div>
              {mode !== 'list' && (
                <div className="checkWrap" data-tip={_l('设为默认选中')}>
                  {isMulti ? (
                    <Checkbox checked={checked} size="small" onClick={() => switchChecked(key)} />
                  ) : (
                    <Radio checked={checked} size="small" onClick={() => switchChecked(key)} />
                  )}
                </div>
              )}
              <div
                className="deleteWrap pointer"
                data-tip={_l('删除')}
                onClick={() => updateOption(index, { isDeleted: true })}
              >
                <i className="icon-delete Font18"></i>
              </div>
            </div>
          </Fragment>
        )}
      </DragItem>
    );
  },
);

const OptionList = SortableContainer(({ options = [], ...rest }) => {
  return (
    <ul>
      {options.map((option, index) => (
        <OptionItem key={option.key} options={options} index={index} idx={index} item={option} {...rest} />
      ))}
    </ul>
  );
});

export default function SelectOptions(props) {
  const {
    mode = 'add',
    onAdd,
    onChange,
    options,
    isMulti,
    data = {},
    showAssign = false,
    fromPortal,
    enableScore,
  } = props;
  const [focusIndex, setIndex] = useState(-1);
  const checkedValue = parseOptionValue(data.default);
  const { showtype } = getAdvanceSetting(data);

  const hasOther = _.find(options, i => i.key === 'other' && !i.isDeleted);
  const findOther = _.findIndex(options, i => i.key === 'other');

  const [{ assignValueVisible, batchAddVisible }, setVisible] = useSetState({
    assignValueVisible: false,
    batchAddVisible: false,
  });

  const addOption = (isOther, nextIndex) => {
    const colorIndex = options.filter(i => i.key !== 'other').length - 1;
    const nextKey = isOther ? 'other' : uuidv4();

    const newIndex = nextIndex || (findOther > -1 ? findOther : options.length);
    const newItem = {
      key: nextKey,
      value: isOther ? _l('其他') : getUnUniqName(options, _l('选项%0', newIndex + 1), 'value'),
      isDeleted: false,
      index: newIndex + 1,
      color: isOther ? '#D3D3D3' : OPTION_COLORS_LIST[(nextIndex || colorIndex + 1) % OPTION_COLORS_LIST.length],
    };

    const nextOptions =
      isOther && findOther > -1
        ? update(options, { [findOther]: { $apply: item => ({ ...item, isDeleted: false }) } })
        : update(options, { $splice: [[newIndex, 0, newItem]] });

    onChange({
      options: nextOptions.map((item, idx) => ({ ...item, index: idx + 1 })),
    });

    setIndex(newIndex);
    setTimeout(() => {
      document.getElementById(nextKey).select();
    }, 50);

    if (onAdd) {
      onAdd();
    }
  };

  const switchChecked = key => {
    if (!isMulti) {
      onChange({ default: JSON.stringify(checkedValue.includes(key) ? [] : [key]) });
      return;
    }
    const nextCheckedValue = checkedValue.includes(key) ? pull(checkedValue, key) : checkedValue.concat(key);
    onChange({ default: JSON.stringify(nextCheckedValue) });
  };

  const updateOption = (index, obj) => {
    const nextOptions = update(options, { [index]: { $apply: item => ({ ...item, ...obj }) } });
    if (every(nextOptions, item => item.isDeleted)) {
      alert(_l('最少保留一个选项'), 3);
      return;
    }
    onChange({ options: nextOptions });
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    // 选项拖拽重新生成index
    onChange({ options: arrayMove(options, oldIndex, newIndex).map((item, index) => ({ ...item, index })) });
  };

  const updateVisible = (type, visible = true) => {
    setVisible({ [`${type}Visible`]: visible });
  };

  return (
    <OptionsWrap>
      <OptionList
        {...props}
        useDragHandle
        showtype={showtype}
        addOption={addOption}
        onSortEnd={onSortEnd}
        switchChecked={switchChecked}
        updateOption={updateOption}
        setIndex={setIndex}
        focusIndex={focusIndex}
        checkedValue={checkedValue}
        helperClass="selectOptionSortableList"
      />
      <HandleOption>
        <div className="addOptions" onClick={() => addOption()}>
          <i className="icon-add Font18"></i>
          <span>{_l('添加选项')}</span>
        </div>
        <div className="batchAdd hoverText mLeft24" onClick={() => updateVisible('batchAdd')}>
          {_l('批量添加')}
        </div>
        <div className="mLeft12 Gray_d">|</div>
        <div
          className={cx('otherAdd hoverText mLeft12', { disabled: hasOther, Hidden: showtype === '2' })}
          onClick={() => {
            if (hasOther) return;
            addOption(true);
          }}
        >
          {_l('添加其他')}
        </div>
        {!fromPortal && showAssign && (
          <div className="assignValue hoverText flex TxtRight" onClick={() => updateVisible('assignValue')}>
            {_l('赋分值')}
          </div>
        )}
      </HandleOption>
      {assignValueVisible && (
        <AssignValue
          options={options}
          enableScore={enableScore}
          onOk={({ options, enableScore }) => {
            onChange({ options, enableScore });
            updateVisible('assignValue', false);
          }}
          onCancel={() => updateVisible('assignValue', false)}
        />
      )}
      {batchAddVisible && (
        <BatchAdd
          options={mode === 'edit' ? options.filter(i => i.key !== 'other' && !i.isDeleted) : []}
          onOk={value => {
            const textArr = _.uniqBy(
              value
                .split(/\n/)
                .filter(v => !!v)
                .map(v => v.trim()),
            );
            const texts = options.map(item => item.value);
            const getNewItems = () => {
              const formatOptions = arr =>
                arr.map((value, index) => ({
                  key: uuidv4(),
                  value,
                  checked: false,
                  isDeleted: false,
                  index: (mode === 'edit' ? 0 : options.length) + index + 1,
                  color: OPTION_COLORS_LIST[(index + 1) % OPTION_COLORS_LIST.length],
                }));
              if (mode === 'edit') {
                return formatOptions(textArr);
              }
              const newOptions = update(options, {
                $splice: [
                  [
                    findOther > -1 ? findOther : options.length,
                    0,
                    ...formatOptions(textArr.filter(v => !texts.includes(v))),
                  ],
                ],
              });
              return newOptions.map((item, idx) => ({ ...item, index: idx + 1 }));
            };
            onChange({ options: getNewItems() });
            updateVisible('batchAdd', false);
          }}
          onCancel={() => updateVisible('batchAdd', false)}
        />
      )}
    </OptionsWrap>
  );
}
