import React, { Fragment, useState, useEffect } from 'react';
import { Icon, Tooltip, Button } from 'ming-ui';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import SortColumns from 'src/pages/worksheet/components/SortColumns';
import Input from 'src/pages/worksheet/common/CreateCustomBtn/components/Inputs';
import sheetApi from 'src/api/worksheet';
import { DEF_TYPES, DEF_R_TYPES } from 'src/pages/worksheet/common/CreateCustomBtn/config';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';

const AddButton = styled.div`
  color: #2196f3;
  border-radius: 3px;
  padding: 8px 7px;
  width: 108px;
  cursor: pointer;
  border: 1px solid #dcdcdc;
  justify-content: center;
  &:hover {
    background-color: #fafafa;
  }
`;

const SortColumnsWrap = styled.div`
  width: 300px;
  box-shadow: 0 4px 20px #00000021, 0 2px 6px #0000001a;
  .sortColumnWrap {
    padding: 10px;
    border-radius: 4px;
  }
  .quickOperate {
    display: none;
  }
  .columnCheckList {
    max-height: 200px !important;
  }
`;

const DefaultValueInputWrap = styled.div`
  width: 100%;
  .optionsCon {
    border-radius: 4px;
    padding: 0 10px;
    border: 1px solid #ccc;
    background: #ffffff;
    height: 36px;
    line-height: 36px;
    width: 100%;
    position: relative;
    .txt {
      display: block;
      width: 100%;
      line-height: 36px;
      height: 100%;
    }
  }
  .settingItemTitle {
    display: none;
  }
  & > div {
    margin-top: 0;
  }
  &.notOther {
    & > div {
      & > div {
        & > div:nth-child(1) {
          width: calc(100%) !important;
          border-radius: 4px !important;
        }
      }
    }
    .tagInputarea .tagInputareaIuput,
    .CityPicker-input-container input {
      border-radius: 4px !important;
    }
    .ant-input {
      width: calc(100%) !important;
      border-radius: 4px !important;
      &:hover {
        border-color: #ccc !important;
      }
    }
    .ant-input:focus,
    .ant-input-focused {
      border-color: #2196f3 !important;
      box-shadow: none !important;
    }
    .selectOtherFieldContainer {
      display: none;
      & > div {
        display: none;
      }
    }
  }
`;

const FILTER_TYPES = DEF_TYPES.concat(DEF_R_TYPES);

function DefaultValue(props) {
  const { projectId, appId, btnId, worksheetId, controls, config, onChangeConfig } = props;
  const { temporaryWriteControls = [], isEmptyWriteControls } = config || {};
  const [showControls, setShowControls] = useState(temporaryWriteControls.map(c => c.controlId));

  useEffect(() => {
    if (btnId && _.isEmpty(temporaryWriteControls) && !isEmptyWriteControls) {
      sheetApi.getWorksheetBtnByID({
        appId,
        worksheetId,
        btnId
      }).then(data => {
        const { writeControls } = data;
        changeTemporaryWriteControls(writeControls);
        setShowControls(writeControls.map(c => c.controlId));
      });
    }
  }, [btnId]);

  const changeTemporaryWriteControls = writeControls => {
    onChangeConfig({
      ...config,
      temporaryWriteControls: writeControls,
      isEmptyWriteControls: writeControls.length ? undefined : true
    });
  }

  const defaultValueInput = (data) => {
    const control = _.find(controls, { controlId: data.controlId });

    if (_.isEmpty(control)) return null;

    const advancedSetting = {
      ..._.omit(control.advancedSetting, ['dynamicsrc', 'defaultfunc']),
      defaulttype: ''
    }

    if (control.type === 34 && data.defsource) {
      advancedSetting.defaulttype = '0';
    }

    return (
      <div className="mBottom15" key={control.controlId}>
        <div className="mBottom10 Font13">{control.controlName}</div>
        <div className="valignWrapper">
          <DefaultValueInputWrap className={cx({ notOther: ![26, 15, 16, 17, 18, 46].includes(control.type) || control.type === 34 })}>
            <Input
              item={data}
              data={{
                ...control,
                advancedSetting: {
                  ...advancedSetting,
                  defsource: data.defsource
                }
              }}
              writeObject={1}
              allControls={controls}
              globalSheetInfo={{
                projectId,
                appId,
                worksheetId
              }}
              titleControl={(_.get(control, ['relationControls']) || []).find(o => o.attribute === 1)}
              onChange={(data, isOptions) => {
                const { advancedSetting = {} } = data;
                let { defsource } = advancedSetting;
                if (isOptions) {
                  defsource = data;
                }
                const newCells = temporaryWriteControls.map(c => {
                  if (c.controlId === control.controlId) {
                    return {
                      ...c,
                      defsource
                    }
                  }
                  return c;
                });
                changeTemporaryWriteControls(newCells);
              }}
            />
          </DefaultValueInputWrap>
          <Icon
            className="Font18 Gray_9e pointer mLeft5"
            icon="delete_12"
            onClick={() => {
              const writeControls = temporaryWriteControls.filter(c => c.controlId !== control.controlId);
              changeTemporaryWriteControls(writeControls);
              setShowControls(writeControls.map(c => c.controlId));
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="settingItem">
      <div className="settingTitle valignWrapper mBottom10">
        <span>{_l('默认值')}</span>
        <Tooltip text={<span>{_l('通过点击按钮创建记录时，将会优先生效此处配置的默认值')}</span>}>
          <Icon className="mLeft5 Gray_9e Font16 pointer" icon="novice-circle" />
        </Tooltip>
      </div>
      {
        temporaryWriteControls.map((control) => (
          defaultValueInput(control)
        ))
      }
      <Trigger
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          }
        }}
        popup={(
          <SortColumnsWrap>
            <SortColumns
              layout={2}
              noShowCount={true}
              noempty={false}
              dragable={false}
              showControls={showControls}
              columns={controls.filter(c => {
                if (ALL_SYS.includes(c.controlId)) {
                  return false;
                }
                // 关联表列表
                if ((c.type === 29 && _.get(c, ['advancedSetting', 'showtype']) === '2')) {
                  return false;
                }
                return FILTER_TYPES.includes(c.type);
              })}
              onChange={({ newShowControls }) => {
                const addControlId = newShowControls.filter(id => !showControls.includes(id))[0];
                const removeControlId = showControls.filter(id => !newShowControls.includes(id))[0];
                setShowControls(newShowControls);
                if (addControlId) {
                  const control = _.find(controls, { controlId: addControlId });
                  const data = {
                    controlId: control.controlId,
                    type: 2,
                    defsource: undefined
                  }
                  changeTemporaryWriteControls(temporaryWriteControls.concat(data));
                }
                if (removeControlId) {
                  changeTemporaryWriteControls(temporaryWriteControls.filter(c => c.controlId !== removeControlId));
                }
              }}
            />
          </SortColumnsWrap>
        )}
      >
        <AddButton className="valignWrapper mTop10">
          <Icon className="Font16" icon="add" />
          <span>{_l('字段默认值')}</span>
        </AddButton>
      </Trigger>
    </div>
  );
}

export default DefaultValue;
