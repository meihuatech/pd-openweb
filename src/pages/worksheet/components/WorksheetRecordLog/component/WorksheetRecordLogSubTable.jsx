import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import _ from 'lodash';
import renderText from 'src/pages/worksheet/components/CellControls/renderText.js';
import WorksheetRecordLogThumbnail from './WorksheetRecordLogThumbnail';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { TEXT_FIELD_SHOWTEXT_TYPE, UPDATA_ITEM_CLASSNAME_BY_TYPE } from '../enum';
import sheetAjax from 'src/api/worksheet';
import '../WorksheetRecordLogValue.less';

function MaskCell(props) {
  const { cell } = props;
  const [forceShowFullValue, setForceShowFullValue] = useState(false);
  const canMask =
    (cell.type === 2 && cell.enumDefault === 2) ||
    (_.includes([6, 8, 3, 5, 7], cell.type) && cell.value && _.get(cell, 'advancedSetting.isdecrypt') === '1');
  let content = renderText(cell, { noMask: forceShowFullValue });
  return canMask ? (
    <span className="canMask" onClick={() => setForceShowFullValue(true)}>
      {content}
    </span>
  ) : (
    content
  );
}

function WorksheetRecordLogSubTable(props) {
  const { control, prop, recordInfo, extendParam } = props;
  const { showControls } = control;
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    setLoading(true);
    sheetAjax
      .getWorksheetInfo({
        getRules: true,
        getTemplate: true,
        worksheetId: control.dataSource,
      })
      .then(res => {
        let _column = showControls.map(key => {
          let _cont = res.template.controls.concat(SYSTEM_CONTROL).find(l => l.controlId === key);
          return {
            title: _cont ? _cont.controlName : '',
            width: 200,
            dataIndex: key,
            key: key,
            render: (value, record) => {
              if (record.type === 'update') {
                let oldValue = record.oldValue[key] ? [record.oldValue[key]] : [];
                let newValue = record.newValue[key] ? [record.newValue[key]] : [];
                if (_.startsWith(record.oldValue[key], '[')) {
                  oldValue = safeParse(record.oldValue[key], 'array');
                }
                if (_.startsWith(record.newValue[key], '[')) {
                  newValue = safeParse(record.newValue[key], 'array');
                }
                let deleteValue = _.difference(oldValue, newValue);
                let addValue = _.difference(newValue, oldValue);
                let defaultValue = _.intersection(newValue, oldValue);
                if (_cont && Object.keys(TEXT_FIELD_SHOWTEXT_TYPE).find(l => l == _cont.type)) {
                  deleteValue = _.differenceBy(oldValue, newValue, TEXT_FIELD_SHOWTEXT_TYPE[_cont.type]);
                  addValue = _.differenceBy(newValue, oldValue, TEXT_FIELD_SHOWTEXT_TYPE[_cont.type]);
                  defaultValue = _.intersectionBy(newValue, oldValue, TEXT_FIELD_SHOWTEXT_TYPE[_cont.type]);
                }
                return (
                  <React.Fragment>
                    {renderUpdataList(deleteValue, _cont, 'remove')}
                    {renderUpdataList(addValue, _cont, 'add')}
                    {renderUpdataList(defaultValue, _cont, 'update')}
                  </React.Fragment>
                );
              }
              let cell = {
                ..._cont,
                value: value,
                value2: value,
              };
              let content = renderText(cell);
              if (content) {
                return <MaskCell cell={cell} />;
              } else {
                return renderSpecial(cell, record.type);
              }
            },
          };
        });
        setColumns(_column);
        let _dataNew = safeParse(safeParse(prop.newValue).rows, 'array');
        let _dataOld = safeParse(safeParse(prop.oldValue).rows, 'array');
        let _prop = {
          ...prop,
        };
        if (_.startsWith(prop.newValue, '{')) {
          _prop.newValue = JSON.stringify(_dataNew.map(l => l.recordId));
          _prop.oldValue = JSON.stringify(_dataOld.map(l => l.recordId));
        }
        sheetAjax
          .getDetailTableLog({
            worksheetId: recordInfo.worksheetId,
            rowId: recordInfo.rowId,
            uniqueId: extendParam.uniqueId,
            createTime: extendParam.createTime,
            lastMark: extendParam.createTime,
            requestType: extendParam.requestType,
            objectType: extendParam.objectType,
            log: {
              ..._prop,
            },
          })
          .then(data => {
            setLoading(false);
            const { oldRows, newRows } = data;
            let oldList = safeParse(oldRows, 'array');
            let newList = safeParse(newRows, 'array');
            let defaultList = _.intersectionBy(newList, oldList, 'rowid').map(l => {
              return {
                ...l,
                oldValue: oldList.find(m => m.rowid === l.rowid),
                newValue: newList.find(m => m.rowid === l.rowid),
                type: 'update',
              };
            });
            let add = _.differenceBy(newList, oldList, 'rowid').map(l => {
              return { ...l, type: 'add' };
            });
            let remove = _.differenceBy(oldList, newList, 'rowid').map(l => {
              return { ...l, type: 'remove' };
            });
            setData(_.sortBy(defaultList.concat(add, remove), ['ctime']));
          });
      });
    // 组装columns
  }, []);

  const renderSpecial = (cell, editRowType) => {
    try {
      const { type, value2, value } = cell;
      if (!value2) return null;
      if (value2.length === 0) return null;
      let _value = value2;
      if (typeof value2 === 'string' && _.startsWith(value2, '[')) {
        _value = safeParse(value2);
      }
      if (type === 42) {
        _value =
          _value && _value.hasOwnProperty('server')
            ? [_value]
            : [
                {
                  server: _value,
                },
              ];
        return (
          <WorksheetRecordLogThumbnail
            oldList={editRowType === 'remove' ? _value : []}
            newList={editRowType === 'add' ? _value : []}
            defaultList={editRowType === 'update' ? _value : []}
            type={type}
            recordInfo={recordInfo}
            control={cell}
          />
        );
      }
      if (type === 14) {
        return (
          <WorksheetRecordLogThumbnail
            oldList={editRowType === 'remove' ? _value : []}
            newList={editRowType === 'add' ? _value : []}
            defaultList={editRowType === 'update' ? _value : []}
            type={type}
            recordInfo={recordInfo}
            control={cell}
          />
        );
      }
      if (type === 29 && _.startsWith(value, '{')) {
        let _rows = safeParse(safeParse(value).rows, 'array');
        return _rows.map(item => {
          let _value = item.name;
          return (
            <span
              className={`rectTag ${
                editRowType === 'add'
                  ? 'newBackground'
                  : editRowType === 'remove'
                  ? 'oldBackground'
                  : 'defaultBackground'
              }`}
            >
              {_value}
            </span>
          );
        });
      }
      if (type === 36) {
        _value = String(_value) === '1' ? '☑' : '☐';
      }
      return (
        <span
          className={`rectTag ${
            editRowType === 'add' ? 'newBackground' : editRowType === 'remove' ? 'oldBackground' : 'defaultBackground'
          }`}
        >
          {_value}
        </span>
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const renderUpdataList = (list, control, type) => {
    return list.map((item, index) => {
      let cell = {
        ...control,
        value: typeof item !== 'string' ? JSON.stringify([item]) : item,
        value2: control.type === 42 ? item : [item],
      };
      let content = renderText(cell);
      if (content) {
        return (
          <React.Fragment key={`worksheetRecordLogSubTableUpdataItem-${type}-${control.controlId}-${index}`}>
            <span className={`rectTag ${UPDATA_ITEM_CLASSNAME_BY_TYPE[type]}`}>
              <MaskCell cell={cell} />
            </span>
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment key={`worksheetRecordLogSubTableUpdataItem-${type}-${control.controlId}-${index}`}>
            {renderSpecial(cell, type)}
          </React.Fragment>
        );
      }
    });
  };

  return (
    <Table
      loading={loading}
      className="worksheetRecordLogSubTable"
      rowClassName={record => {
        return `worksheetRecordLogSubTableRow ${record.type}`;
      }}
      columns={columns}
      dataSource={data}
      scroll={{ x: 1300 }}
      pagination={false}
      bordered={true}
      locale={{
        Empty: {
          description: _l('暂无数据'),
        },
      }}
    />
  );
}
export default WorksheetRecordLogSubTable;
