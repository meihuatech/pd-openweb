import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';
import { Checkbox } from 'ming-ui';
import RecordOperate from 'worksheet/components/RecordOperate';
import ChangeSheetLayout from 'worksheet/components/ChangeSheetLayout';

const Con = styled.span`
  padding: 0 !important;
  line-height: 34px;
  .rowIndex {
    display: inline-block;
    width: 44px;
    text-align: center;
    .num {
      font-size: 13px;
      color: #9e9e9e;
    }
    .Checkbox-box {
      margin-right: -2px !important;
    }
  }
  .moreOperate {
    margin: 5px 8px 0 12px;
  }
  .open,
  .operateBtn,
  .moreOperate {
    display: none;
  }
  .operateBtn {
    margin: 0 13px;
  }
  .operateBtn,
  .open .icon {
    font-size: 18px;
    color: #9e9e9e;
    cursor: pointer;
    top: 2px;
    position: relative;
    &.delete:hover {
      color: #f44336;
    }
  }
  .delete {
    display: none;
  }
  &.hover {
    .open {
      display: inline-block;
    }
  }
  &.isNew {
    &::before {
      content: '';
      position: absolute;
      z-index: 3;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #2196f3;
    }
  }
  &:not(.disabled).hover {
    .delete,
    .open,
    .operateBtn,
    .moreOperate {
      display: inline-block;
    }
    .rowIndex {
      display: none;
    }
  }
  &.showCheckbox {
    .rowIndex {
      position: absolute;
      display: inline-block !important;
      z-index: 2;
      background: inherit;
    }
  }
  &.disabled:not(.showNumber) {
    text-align: center;
    .rowIndex {
      display: none;
    }
  }
`;

export default function RowHead(props) {
  const {
    row = {},
    isNew,
    changeSheetLayoutVisible,
    disabled,
    allowAdd,
    allowCancel,
    className,
    style,
    isSelectAll,
    rowIndex,
    showCheckbox,
    selectedRowIds,
    showNumber = true,
    onOpen = () => {},
    onDelete = () => {},
    onCopy = () => {},
    saveSheetLayout = () => {},
    resetSheetLayout = () => {},
    onSelect = () => {},
    onSelectAll = () => {},
  } = props;
  const isSavedData = !/^temp/.test(row.rowid);
  const hideOperate = disabled || (isSavedData && (!allowAdd || !allowCancel));
  if (rowIndex === -1) {
    return showCheckbox ? (
      <div className={className} style={style}>
        <span
          className="rowIndex TxtCenter InlineBlock"
          style={{
            width: 44,
          }}
        >
          <Checkbox
            size="small"
            clearselected={!isSelectAll && selectedRowIds.length}
            // disabled={!data.length}
            checked={isSelectAll}
            onClick={() => {
              onSelectAll(!selectedRowIds.length);
            }}
          />
        </span>
      </div>
    ) : (
      <div className={className} style={style}>
        {changeSheetLayoutVisible && (
          <ChangeSheetLayout
            title={_l('你变更了表格列宽，是否保存？')}
            description={_l('保存当前表格的列宽配置，并应用给所有用户')}
            onSave={saveSheetLayout}
            onCancel={resetSheetLayout}
          />
        )}
      </div>
    );
  }
  if (!row.rowid || row.rowid === 'empty') {
    return <Con className={cx(className, 'placeholder')} style={style} />;
  }
  return (
    <Con
      className={cx(className, {
        disabled: disabled || (isSavedData && !allowAdd && !allowCancel),
        showNumber,
        showCheckbox,
        isNew: !isSavedData,
      })}
      style={style}
    >
      <span className="rowIndex">
        {showNumber && !showCheckbox && <span className={cx('num')}>{rowIndex + 1}</span>}

        {showCheckbox && (
          <Checkbox
            checked={_.includes(selectedRowIds, row.rowid)}
            size="small"
            onClick={() => {
              onSelect(row.rowid, !_.includes(selectedRowIds, row.rowid));
            }}
          />
        )}
      </span>
      {!hideOperate && (
        <RecordOperate
          popupAlign={{
            offset: [-12, 0],
            points: ['tl', 'bl'],
          }}
          isSubList
          allowCopy
          shows={['copy']}
          disableLoadCustomButtons
          allowDelete
          showTask={false}
          showHr={false}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      )}
      {!disabled && isSavedData && allowAdd && !allowCancel && (
        <i className="operateBtn icon icon-copy hand ThemeHoverColor3" onClick={onCopy}></i>
      )}
      {!disabled && isSavedData && allowCancel && !allowAdd && (
        <i className="operateBtn delete icon icon-task-new-delete hand" onClick={onDelete}></i>
      )}
      <span className="open" onClick={() => onOpen(rowIndex)}>
        <i className="icon icon-worksheet_enlarge ThemeHoverColor3"></i>
      </span>
    </Con>
  );
}

//

RowHead.propTypes = {
  className: PropTypes.string,
  showCheckbox: PropTypes.bool,
  showNumber: PropTypes.bool,
  isSelectAll: PropTypes.bool,
  selectedRowIds: PropTypes.arrayOf(PropTypes.string),
  row: PropTypes.shape({}),
  allowAdd: PropTypes.bool,
  allowCancel: PropTypes.bool,
  disabled: PropTypes.bool,
  rowIndex: PropTypes.number,
  style: PropTypes.shape({}),
  onOpen: PropTypes.func,
  onDelete: PropTypes.func,
  onCopy: PropTypes.func,
  saveSheetLayout: PropTypes.func,
  resetSheetLayout: PropTypes.func,
  onSelect: PropTypes.func,
  onSelectAll: PropTypes.func,
};
