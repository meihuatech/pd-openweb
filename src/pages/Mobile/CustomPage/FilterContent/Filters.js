import React, { Fragment, useEffect, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import { bindActionCreators } from 'redux';
import { Icon } from 'ming-ui';
import FilterInput, { validate, conditionAdapter, formatQuickFilter, NumberTypes } from 'mobile/RecordList/QuickFilter/Inputs';
import _ from 'lodash';

const Con = styled.div`
  .header {
    padding: 0 15px 10px;
    justify-content: flex-end;
  }
  .close {
    font-weight: bold;
    padding: 5px;
    border-radius: 50%;
    background-color: #e6e6e6;
  }
  .body {
    padding: 0 15px;
    overflow: auto;
    .controlWrapper {
      margin-bottom: 20px;
    }
    .selected {
      color: #2196f3;
      max-width: 100px;
      padding-left: 10px;
      font-weight: 500;
    }
  }
  .footer {
    border-top: 1px solid #eaeaea;
    .flex {
      padding: 10px;
    }
    .query {
      color: #fff;
      background-color: #2196f3;
    }
  }
`;

function QuickFilter(props) {
  const { enableBtn, filters, controls, updateQuickFilter, onCloseDrawer } = props;
  const store = useRef({});
  const [values, setValues] = useState({});
  const debounceUpdateQuickFilter = useRef(_.debounce(updateQuickFilter, 500));

  const update = newValues => {
    const valuesToUpdate = newValues || values;
    const quickFilter = filters
      .map((filter, i) => ({
        ...filter,
        filterType: filter.filterType || 1,
        spliceType: filter.spliceType || 1,
        ...valuesToUpdate[i],
      }))
      .filter(validate)
      .map(conditionAdapter);
    if (quickFilter.length) {
      if (_.includes(NumberTypes, store.current.activeType)) {
        debounceUpdateQuickFilter.current(formatQuickFilter(quickFilter));
      } else {
        updateQuickFilter(formatQuickFilter(quickFilter));
      }
    } else {
      updateQuickFilter([]);
    }
  };
  const handleQuery = () => {
    update();
    onCloseDrawer();
  };
  const handleReset = () => {
    const quickFilter = filters
      .map((filter, i) => ({
        ...filter,
        filterType: filter.filterType || 1,
        spliceType: filter.spliceType || 1,
        values: filter.values
      }))
      .filter(validate)
      .map(conditionAdapter);
    setValues({});
    updateQuickFilter(formatQuickFilter(quickFilter));
    onCloseDrawer();
  };

  return (
    <Con className="flexColumn h100 overflowHidden">
      <div className="header flexRow valignWrapper">
        <Icon className="Gray_9e close" icon="close" onClick={onCloseDrawer} />
      </div>
      <div className="flex body">
        {filters.map((item, i) => (
          <FilterInput
            key={item.controlId}
            {...item}
            {...values[i]}
            projectId={props.projectId}
            appId={props.appId}
            // worksheetId={props.worksheetId}
            onChange={(change = {}) => {
              store.current.activeType = item.control.type;
              const newValues = { ...values, [i]: { ...values[i], ...change } };
              setValues(newValues);
              if (!enableBtn && !_.isEmpty(newValues)) {
                update(newValues);
              }
            }}
            onRemove={() => {
              delete values[i];
              const newValues = { ...values };
              setValues(newValues);
              if (!enableBtn) {
                update(newValues);
              }
            }}
          />
        ))}
      </div>
      {enableBtn && (
        <div className="footer flexRow valignWrapper">
          <div className="flex Font16 centerAlign" onClick={handleReset}>
            {_l('重置')}
          </div>
          <div className="flex Font16 centerAlign query" onClick={handleQuery}>
            {_l('查询')}
          </div>
        </div>
      )}
    </Con>
  );
}

export default QuickFilter;

