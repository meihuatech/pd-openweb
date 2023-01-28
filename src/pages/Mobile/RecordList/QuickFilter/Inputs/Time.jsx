import React, { useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { func, shape, string, number } from 'prop-types';
import MobileDatePicker from 'src/ming-ui/components/MobileDatePicker';
import { Input } from 'ming-ui';
import moment from 'moment';
import _ from 'lodash';

const InputCon = styled(Input)`
  width: 100%;
  border-radius: 18px !important;
  border: none !important;
  background-color: #f5f5f5;
`;

const dealDate = date => {
  let arr = date.split(':');
  return { hour: arr[0] && Number(arr[0]), minite: arr[1] && Number(arr[1]), second: arr[2] && Number(arr[2]) };
};

export default function Time(props) {
  const { dateRange, minValue, maxValue, onChange = () => {}, control } = props;
  const [startDateVisible, setStartDateVisible] = useState(false);
  const [endDateVisible, setEndDateVisible] = useState(false);
  const unit = String(control.unit);
  const minDate = minValue ? dealDate(minValue) : {};
  const maxDate = maxValue ? dealDate(maxValue) : {};
  const startDateValue = !_.isEmpty(minDate)
    ? minDate.second
      ? moment().hour(minDate.hour).minute(minDate.minite).second(minDate.second)
      : moment().hour(minDate.hour).minute(minDate.minite)
    : null;
  const endDateValue = !_.isEmpty(maxDate)
    ? maxDate.second
      ? moment().hour(maxDate.hour).minute(maxDate.minite).second(maxDate.second)
      : moment().hour(maxDate.hour).minute(maxDate.minite)
    : null;
  const startDateExtraObj = endDateValue ? { max: new Date(endDateValue) } : {};
  const valueFormat = unit === '1' ? 'HH:mm' : 'HH:mm:ss';
  return (
    <div className="controlWrapper">
      <div className="flexRow valignWrapper mBottom15">
        <div className="Font14 bold flex ellipsis">{control.controlName}</div>
        {!!dateRange && dateRange !== 18 && (
          <div className="selected ellipsis">{_.find(optionDate, { value: dateRange }).text}</div>
        )}
      </div>
      <div className="flexRow">
        <div className="flex">
          <InputCon
            readOnly
            className="centerAlign"
            placeholder={_l('开始')}
            value={minValue || ''}
            onClick={() => {
              setStartDateVisible(true);
            }}
          />
          {startDateVisible && (
            <MobileDatePicker
              customHeader={_l('开始时间')}
              dateConfig={
                unit === '1'
                  ? {
                      hour: {
                        format: _l('hh时'),
                        caption: 'Hour',
                        step: 1,
                      },
                      minute: {
                        format: _l('mm分'),
                        caption: 'Min',
                        step: 1,
                      },
                    }
                  : {
                      hour: {
                        format: _l('hh时'),
                        caption: 'Hour',
                        step: 1,
                      },
                      minute: {
                        format: _l('mm分'),
                        caption: 'Min',
                        step: 1,
                      },
                      second: {
                        format: _l('ss秒'),
                        caption: 'Second',
                        step: 1,
                      },
                    }
              }
              isOpen={startDateVisible}
              value={startDateValue ? new Date(startDateValue) : new Date()}
              onSelect={date => {
                onChange({
                  dateRange: 18,
                  filterType: 31,
                  minValue: moment(date).format(valueFormat),
                  maxValue: maxValue ? maxValue : moment(date).format(valueFormat),
                });
                setStartDateVisible(false);
              }}
              onCancel={() => {
                setStartDateVisible(false);
                onChange({
                  dateRange: 18,
                  filterType: 31,
                  minValue: null,
                  maxValue,
                });
              }}
              {...startDateExtraObj}
            />
          )}
        </div>
        <div className="flexRow valignWrapper mLeft7 mRight7">-</div>
        <div className="flex">
          <InputCon
            readOnly
            className="centerAlign"
            placeholder={_l('结束')}
            value={maxValue || ''}
            onClick={() => {
              setEndDateVisible(true);
            }}
          />
          {endDateVisible && (
            <MobileDatePicker
              customHeader={_l('结束时间')}
              isOpen={endDateVisible}
              value={endDateValue ? new Date(endDateValue) : new Date()}
              min={new Date(startDateValue)}
              dateConfig={
                unit === '1'
                  ? {
                      hour: {
                        format: _l('hh时'),
                        caption: 'Hour',
                        step: 1,
                      },
                      minute: {
                        format: _l('mm分'),
                        caption: 'Min',
                        step: 1,
                      },
                    }
                  : {
                      hour: {
                        format: _l('hh时'),
                        caption: 'Hour',
                        step: 1,
                      },
                      minute: {
                        format: _l('mm分'),
                        caption: 'Min',
                        step: 1,
                      },
                      second: {
                        format: _l('ss秒'),
                        caption: 'Second',
                        step: 1,
                      },
                    }
              }
              onSelect={date => {
                onChange({
                  dateRange: 18,
                  filterType: 31,
                  minValue: minValue ? minValue : moment(date).format(valueFormat),
                  maxValue: moment(date).format(valueFormat),
                });
                setEndDateVisible(false);
              }}
              onCancel={() => {
                setEndDateVisible(false);
                onChange({
                  dateRange: 18,
                  filterType: 31,
                  minValue,
                  maxValue: null,
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Time.propTypes = {
  dateRange: number,
  advancedSetting: shape({}),
  minValue: string,
  maxValue: string,
  onChange: func,
};
