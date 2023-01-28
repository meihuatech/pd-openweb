import React, { useState, useRef } from 'react';
import { Icon, MobileCityPicker } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';

const AreaCon = styled.div`
  position: relative;
  .addBtn {
    display: inline-block;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #f5f5f5;
    text-align: center;
    line-height: 26px;
    font-size: 16px;
    color: #9e9e9e;
  }
  .rightArrow {
    position: absolute;
    right: 0;
    line-height: 26px;
    font-size: 16px;
    color: #c7c7cc;
  }
`;
const AreaItem = styled.span`
  display: inline-block;
  height: 28px;
  background: #f5f5f5;
  border-radius: 14px;
  margin: 0 8px 10px 0;
  padding-right: 12px;
  line-height: 28px;
  .userAvatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }
  .userName {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0 20px 0 8px;
    vertical-align: middle;
  }
`;

export default function Areas(props) {
  const { values = [], control, isMultiple, onChange = () => {} } = props;
  const tempArea = useRef();

  const deleteCurrentArea = item => {
    onChange({ values: values.filter(v => v.id !== item.id) });
  };

  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15">{control.controlName}</div>
      <AreaCon>
        {values.map(item => (
          <AreaItem>
            <span className="userName">{item.name}</span>
            <Icon icon="close" onClick={() => deleteCurrentArea(item)} />
          </AreaItem>
        ))}
        {((!isMultiple && _.isEmpty(values)) || isMultiple) && (
          <MobileCityPicker
            level={control.type === 19 ? 1 : control.type === 23 ? 2 : 3}
            callback={area => {
              if (_.last(area)) {
                tempArea.current = {
                  name: area.map(c => c.name).join('/'),
                  id: _.last(area).id,
                };
              }
            }}
            onClear={() => {
              tempArea.current = {};
              onChange({ values: [] });
            }}
            onClose={() => {
              if (tempArea.current) {
                onChange({ values: isMultiple ? _.uniqBy([...values, tempArea.current], 'id') : [tempArea.current] });
              }
            }}
          >
            <span className="addBtn">
              <Icon icon="add" />
            </span>
          </MobileCityPicker>
        )}
        {!isMultiple && !_.isEmpty(values) && (
          <MobileCityPicker
            level={control.type === 19 ? 1 : control.type === 23 ? 2 : 3}
            callback={area => {
              if (_.last(area)) {
                tempArea.current = {
                  name: area.map(c => c.name).join('/'),
                  id: _.last(area).id,
                };
              }
            }}
            onClear={() => {
              tempArea.current = {};
              onChange({ values: [] });
            }}
            onClose={() => {
              if (tempArea.current) {
                onChange({ values: isMultiple ? _.uniqBy([...values, tempArea.current], 'id') : [tempArea.current] });
              }
            }}
          >
            <Icon icon="arrow-right-border" className="rightArrow" />
          </MobileCityPicker>
        )}
      </AreaCon>
    </div>
  );
}
