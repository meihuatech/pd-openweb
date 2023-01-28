import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import { arrayOf, func, shape, string } from 'prop-types';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import RelateRecordDropdown from 'worksheet/components/RelateRecordDropdown';
import RelateRecordOptions from './RelateRecordOptions';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import MobileRecordCardListDialog from 'src/components/recordCardListDialog/mobile';
import _ from 'lodash';

export default function RelateRecord(props) {
  const { values = [], control, advancedSetting, onChange = () => {}, appId, worksheetId } = props;
  const {
    enumDefault,
    relationControls = [],
    controlId,
    coverCid,
    showControls,
    dataSource,
    formData,
    viewId,
  } = control;
  const { showtype, allowlink, ddset, allowitem, direction } = advancedSetting;
  const isMultiple = String(allowitem) === '2';
  const [moreVisible, setMoreVisible] = useState(false);

  const handleSetMoreVisible = () => {
    setMoreVisible(!moreVisible);
  };

  function handleChange(value) {
    onChange({
      ...value,
    });
  }
  const getDefaultRelateSheetValue = () => {
    try {
      const { formData, controlId, recordId, worksheetId } = this.props.control;
      const titleControl = _.find(formData, control => control.attribute === 1);
      const defaultRelatedSheetValue = {
        name: titleControl.value,
        sid: recordId,
        type: 8,
        sourcevalue: JSON.stringify({
          ..._.assign(...formData.map(c => ({ [c.controlId]: c.value }))),
          [titleControl.controlId]: titleControl.value,
          rowid: recordId,
        }),
      };
      if (titleControl.type === 29) {
        try {
          const cellData = JSON.parse(titleControl.value);
          defaultRelatedSheetValue.name = cellData[0].name;
        } catch (err) {
          defaultRelatedSheetValue.name = '';
        }
      }
      return {
        worksheetId,
        relateSheetControlId: controlId,
        value: defaultRelatedSheetValue,
      };
    } catch (err) {
      return;
    }
  };
  return (
    <div className="controlWrapper">
      <div className="flexRow valignWrapper mBottom15">
        <div className="Font14 bold flex ellipsis">{control.controlName}</div>
        {!_.isEmpty(values) && (
          <div className="selected ellipsis">
            {isMultiple
              ? _l('选择%0项', values.length)
              : _.get(values[0], 'name') || getTitleTextFromControls(control.relationControls, values[0])}
          </div>
        )}
      </div>
      <RelateRecordOptions
        multiple={isMultiple}
        selected={values}
        control={control}
        onSetMoreVisible={handleSetMoreVisible}
        onChange={newRecords => {
          handleChange({ values: newRecords });
        }}
      />
      {moreVisible && (
        <MobileRecordCardListDialog
          maxCount={50}
          selectedCount={values.length}
          from={5}
          control={control}
          allowNewRecord={false}
          multiple={isMultiple}
          coverCid={coverCid}
          filterRowIds={[]}
          showControls={showControls}
          appId={appId}
          viewId={viewId}
          relateSheetId={dataSource}
          parentWorksheetId={worksheetId}
          filterRelatesheetControlIds={[controlId]}
          defaultRelatedSheet={getDefaultRelateSheetValue()}
          controlId={controlId}
          visible={moreVisible}
          onClose={() => setMoreVisible(false)}
          onOk={newRecords => {
            let selectedValue = values.map(item => item.rowid);
            let result = newRecords.filter(item => !_.includes(selectedValue, item.rowid)).concat(values);
            handleChange({ values: isMultiple ? result : newRecords });
          }}
          formData={formData}
        />
      )}
    </div>
  );
}

RelateRecord.propTypes = {
  values: arrayOf(shape({})),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
