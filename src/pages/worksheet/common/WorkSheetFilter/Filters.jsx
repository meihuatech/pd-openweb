import React, { Fragment, useEffect, useState, useImperativeHandle, useRef, forwardRef } from 'react';
import styled from 'styled-components';
import Skeleton from 'src/router/Application/Skeleton';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import SavedFilters from './components/SavedFilters';
import FilterDetail from './components/FilterDetail';
import Empty from './components/Empty';
import { redefineComplexControl, getDefaultCondition } from './util';
import { formatForSave } from './model';
import { CONTROL_FILTER_WHITELIST } from './enum';
import _ from 'lodash';

const Con = styled.div`
  width: 480px;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  padding: 16px 0 24px;
`;

const SwitchTab = styled.div`
  margin-bottom: 28px;
  padding: 4px;
  font-weight: bold;
  background: #ebebeb;
  margin: 0 auto;
  border-radius: 32px;
  width: 187px;
  > span {
    cursor: pointer;
    height: 24px;
    line-height: 24px;
    border-radius: 24px;
    color: #757575;
    width: 50%;
    text-align: center;
    display: inline-block;
    &.active {
      color: #2196f3;
      background: #ffffff;
    }
    &:hover {
      color: #2196f3;
    }
  }
`;

const tabs = [
  {
    name: _l('新的筛选'),
    type: 1,
  },
  {
    name: _l('已保存'),
    type: 2,
  },
];

function Filters(props, ref) {
  const {
    supportGroup = true,
    projectId,
    appId,
    viewId,
    worksheetId,
    isCharge,
    columns,
    sheetSwitchPermit = {},
    state = {},
    actions = {},
    onHideFilterPopup = () => {},
    onChange = () => {},
    filterResigned = true,
  } = props;
  const conRef = useRef();
  const cache = useRef({});
  const base = { projectId, appId, worksheetId, isCharge };
  const filterWhiteKeys = _.flatten(
    Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
  );
  const showWorkflowControl = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit, viewId);
  const controls = columns
    .filter(c => (c.controlPermissions || '111')[0] === '1')
    .map(redefineComplexControl)
    .filter(c => _.includes(filterWhiteKeys, c.type))
    .filter(c => !(c.type === 38 && c.enumDefault === 3));
  const { loading, filters, editingFilter, activeFilter, needSave, nameIsUpdated } = state;
  const {
    editFilter,
    copyFilter,
    loadFilters,
    addFilter,
    addCondition,
    deleteFilter,
    toggleFilterType,
    setActiveFilter,
    sortFilters,
  } = actions;
  const [activeTab, setActiveTab] = useState(1);
  const isSavedEditing = !!editingFilter && !/^new/.test(editingFilter.id);
  const isNewEditing = !!editingFilter && /^new/.test(editingFilter.id);
  function filterAddConditionControls(controls) {
    return filterOnlyShowField(
      showWorkflowControl
        ? controls
        : controls.filter(c => !_.find(WORKFLOW_SYSTEM_CONTROL, { controlId: c.controlId })),
    );
  }
  function filterWorksheet(filter) {
    const filterControls = formatForSave(filter);
    if (filterControls && _.isArray(filterControls)) {
      onChange({
        filterControls,
      });
    }
  }
  function handleTriggerFilter(filter) {
    setActiveFilter(filter);
    filterWorksheet(filter);
  }
  function handleAddNewFilter() {
    addFilter();
    setTimeout(() => {
      if (conRef.current) {
        conRef.current.querySelector('.addFilterCondition > span').click();
      }
    }, 80);
  }
  useEffect(() => {
    loadFilters(worksheetId, data => {
      if (!_.isEmpty(data) && !cache.current.callFromColumn) {
        setActiveTab(2);
      }
    });
  }, []);
  useEffect(() => {
    if (state.editingFilter) {
      filterWorksheet(state.editingFilter);
    }
  }, [state.editingFilter]);
  useImperativeHandle(ref, () => ({
    addFilterByControl: control => {
      cache.current.callFromColumn = true;
      setActiveTab(1);
      if (isNewEditing) {
        addCondition(control, editingFilter.conditionsGroups.length - 1);
      } else {
        addFilter({ defaultCondition: getDefaultCondition(control) });
      }
    },
  }));
  return (
    <Con ref={conRef}>
      {!isSavedEditing && (
        <SwitchTab>
          {tabs.map(tab => (
            <span
              className={activeTab === tab.type ? 'active' : ''}
              onClick={() => {
                setActiveTab(tab.type);
              }}
            >
              {tab.name}
            </span>
          ))}
        </SwitchTab>
      )}
      {loading ? (
        <div style={{ padding: 10 }}>
          <Skeleton
            style={{ flex: 1 }}
            direction="column"
            widths={['30%', '40%', '90%', '60%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
        </div>
      ) : (
        <Fragment>
          {activeTab === 1 && (
            <Fragment>
              {isNewEditing && (
                <FilterDetail
                  canEdit
                  supportGroup
                  hideSave={!formatForSave(editingFilter).length}
                  base={base}
                  filter={editingFilter}
                  actions={actions}
                  controls={controls}
                  setActiveTab={setActiveTab}
                  onBack={() => editFilter(undefined)}
                  onAddCondition={() => {
                    setActiveFilter(editingFilter);
                  }}
                  handleTriggerFilter={handleTriggerFilter}
                  filterResigned={filterResigned}
                  filterAddConditionControls={filterAddConditionControls}
                />
              )}
              {!editingFilter && <Empty isNew onAdd={handleAddNewFilter} />}
            </Fragment>
          )}
          {activeTab === 2 && (
            <Fragment>
              {!isSavedEditing && (
                <SavedFilters
                  isCharge={isCharge}
                  controls={controls}
                  filters={filters}
                  activeFilter={activeFilter}
                  filterAddConditionControls={filterAddConditionControls}
                  triggerFilter={f => {
                    editFilter(undefined);
                    handleTriggerFilter(f);
                  }}
                  addFilter={() => {
                    setActiveTab(1);
                    handleAddNewFilter();
                  }}
                  onEditFilter={filter => {
                    editFilter(filter);
                    setActiveFilter(filter);
                  }}
                  onCopy={filter => copyFilter({ appId, worksheetId, filter, isCharge })}
                  onDelete={filter => deleteFilter({ appId, filter })}
                  onToggleFilterType={filter => toggleFilterType({ appId, worksheetId, filter, isCharge })}
                  onHideFilterPopup={onHideFilterPopup}
                  onSortEnd={sortedIds => {
                    sortFilters(appId, worksheetId, sortedIds);
                  }}
                />
              )}
              {isSavedEditing && (
                <FilterDetail
                  supportGroup
                  nameIsUpdated={nameIsUpdated}
                  needSave={needSave}
                  base={base}
                  filter={editingFilter}
                  actions={actions}
                  controls={controls}
                  setActiveTab={setActiveTab}
                  onBack={needSetOriginFilter => {
                    if (needSetOriginFilter) {
                      const originFilter = _.find(filters, f => f.id === editingFilter.id);
                      if (originFilter) {
                        handleTriggerFilter(originFilter);
                      }
                    }
                    editFilter(undefined);
                  }}
                  handleTriggerFilter={handleTriggerFilter}
                  filterResigned={filterResigned}
                  filterAddConditionControls={filterAddConditionControls}
                />
              )}
            </Fragment>
          )}
        </Fragment>
      )}
    </Con>
  );
}

export default forwardRef(Filters);

/**
 * TODO 条件合法性判读
 */
