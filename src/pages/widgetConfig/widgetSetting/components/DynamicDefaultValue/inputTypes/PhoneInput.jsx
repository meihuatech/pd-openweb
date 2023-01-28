import React, { useState, useEffect, createRef } from 'react';
import { Input } from 'antd';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType } = props;
  const { staticValue = '', cid = '' } = dynamicValue[0] || {};
  const [value, setValue] = useState(staticValue);
  const [isDynamic, setDynamic] = useState(!!cid);
  const $wrap = createRef(null);

  useEffect(() => {
    setValue(staticValue);
    setDynamic(!!cid);
  }, [data.controlId, cid]);

  const setDynamicValue = newValue => {
    onDynamicValueChange(newValue || []);
  };

  const handleChange = value => {
    const formatValue = value.replace(/[^\d]/g, '');
    const parseValue = formatValue ? parseFloat(value) : '';
    setValue(parseValue);
    onDynamicValueChange([{ cid: '', rcid: '', staticValue: parseValue }]);
  };

  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  return (
    <DynamicValueInputWrap>
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : isDynamic ? (
        <OtherFieldList
          onClick={() => {
            if (!cid) {
              setDynamic(false);
            }
          }}
          {...props}
        />
      ) : (
        <Input
          autoFocus
          value={value}
          style={{ width: 'calc(100% - 36px)', borderRadius: '3px 0 0 3px' }}
          onChange={e => handleChange(e.target.value)}
        />
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
