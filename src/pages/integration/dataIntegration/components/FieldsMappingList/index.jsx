import React, { useRef } from 'react';
import styled from 'styled-components';
import { Icon, Checkbox, Input } from 'ming-ui';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { getIconByType, canSetAsTitle } from 'src/pages/widgetConfig/util';
import SelectType from './SelectType';
import SetComment from './SetComment';
import { isValidName, namePattern } from '../../constant';

const Wrapper = styled.div`
  .headTr,
  .dataItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 8px 0px 8px 8px;
    border-bottom: 1px solid #e0e0e0;

    .name,
    .dataType {
      width: 0;
      padding-right: 8px;
    }
    .name_dest,
    .dataType_dest {
      width: 0;
      padding-right: 20px;
      position: relative;
    }
    .arrowIcon {
      width: 20px;
      height: 20px;
      transform: rotate(-90deg);
      color: #2196f3;
    }
  }
  .dataItem {
    .isOperateCommonIcon {
      display: none;
      width: fit-content;
      color: #bdbdbd;
      cursor: pointer;
      &.isActive {
        display: block;
        color: #9e9e9e;
      }
    }
    &:hover {
      background: #fafafa;

      .isOperateCommonIcon {
        display: block;
        i {
          &:hover {
            color: #2196f3;
          }
        }
      }
    }

    .customDisabled {
      .Checkbox-box {
        background: #90caf9 !important;
        border-color: #90caf9 !important;
      }
    }
  }
  .itemWrapper {
    position: relative;
    margin-left: -16px;
    padding-left: 16px;

    .deleteIcon {
      position: absolute;
      left: 0px;
      top: 16px;
      display: none;
      font-size: 16px;
      color: #bdbdbd;
      cursor: pointer;
      &:hover {
        color: #f00;
      }
    }
    &:hover {
      .deleteIcon {
        display: block;
      }
    }
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-radius: 3px;
    /* border: 1px solid #ccc !important; */
  }
`;

const SelectWrapper = styled.div`
  .isNoMatchOption {
    .ant-select-selector .ant-select-selection-item {
      color: #f00;
    }
  }
`;

export default function FieldMappingList(props) {
  const { sourceData = {}, destData = {}, isCreate, fieldsMapping, setFieldsMapping, matchedTypes } = props;
  const checkAll =
    fieldsMapping.filter(
      item =>
        !_.get(item, 'destField.isCheck') &&
        (isValidName(item.sourceField.name) || !sourceData.isDbType) &&
        matchedTypes &&
        !!(matchedTypes[item.sourceField.id] || []).length,
    ).length === 0;
  const selectedFieldIds = fieldsMapping.map(item => _.get(item, 'destField.id')).filter(o => o);
  const selectNameRef = useRef([]);
  const isExistJoinPk = !!(sourceData.sourceFields || []).filter(item => item.isJoinPk).length;

  let leftColumns = [];
  let rightColumns = [];

  //更新FieldsMapping
  const updateFieldsMapping = data => {
    const newFieldsMapping = (fieldsMapping || []).map(o => {
      if (
        _.get(o, ['sourceField', 'id']) === _.get(data, ['sourceField', 'id']) &&
        _.get(o, ['sourceField', 'alias']) === _.get(data, ['sourceField', 'alias'])
      ) {
        return data;
      } else {
        return o;
      }
    });
    setFieldsMapping && setFieldsMapping(newFieldsMapping);
  };

  const isNotSupportField = sourceField => {
    const isOtherTable_onlyDisplay_orLink =
      sourceField.mdType === 30 &&
      (sourceField.controlSetting.strDefault === '10' || sourceField.controlSetting.sourceControlType === 21); //他表字段-仅显示,他表字段-自由连接类型
    const isRelated_multiple = sourceField.mdType === 29 && sourceField.controlSetting.enumDefault === 2; //关联记录-多条
    const isNotSupport =
      !(matchedTypes[sourceField.id] || []).length || isOtherTable_onlyDisplay_orLink || isRelated_multiple;
    return isNotSupport;
  };

  const renderInputName = data => {
    const sourceField = data.sourceField || {};
    const destField = data.destField || {};
    const isDisabled =
      !sourceData.isDbType && !destData.isDbType
        ? isExistJoinPk
          ? sourceField.isJoinPk
          : (sourceField.oid || '').split('_')[1] === 'rowid'
        : false;

    return (
      <Input
        className="w100"
        value={destField.name || ''}
        disabled={isDisabled}
        onBlur={event => {
          const hasRepeatName =
            fieldsMapping.filter(item => _.get(item, 'destField.name') === event.target.value).length > 1;
          if (hasRepeatName) {
            const newName = destField.name + Math.floor(Math.random() * 10000);
            updateFieldsMapping({
              ...data,
              destField: {
                ...destField,
                name: newName,
                alias: newName,
              },
            });
          } else {
            const needReplace = sourceData.isDbType || destData.isDbType;
            updateFieldsMapping({
              ...data,
              destField: {
                ...destField,
                name: needReplace ? event.target.value.replace(namePattern, '') : event.target.value,
                alias: needReplace ? event.target.value.replace(namePattern, '') : event.target.value,
              },
            });
          }
        }}
        onChange={value =>
          updateFieldsMapping({
            ...data,
            destField: {
              ...destField,
              name: value,
              alias: value,
            },
          })
        }
      />
    );
  };
  const renderSelectType = data => {
    const { sourceField } = data;
    if (!matchedTypes) return;
    const options = (matchedTypes[sourceField.id] || []).map((o, i) => {
      return {
        ...o,
        key: `${sourceField.id}-${i}`,
        label: (
          <div className="flexRow alignItemsCenter">
            {!destData.isDbType && (
              <Icon icon={getIconByType(o.mdType, false)} className={cx('Font18 Gray_bd customIcon')} />
            )}
            <span title={o.typeName.toLowerCase()} className="Gray mLeft8 w100 overflow_ellipsis">
              {o.typeName.toLowerCase()}
            </span>
          </div>
        ),
        value: destData.isDbType ? o.typeName.toLowerCase() : o.mdType,
      };
    });

    return (
      <SelectType
        options={options}
        itemData={data}
        updateFieldsMapping={updateFieldsMapping}
        isDestDbType={destData.isDbType}
      />
    );
  };
  const renderCheckAll = () => {
    return (
      <Checkbox
        size="small"
        checked={checkAll}
        onClick={checked => {
          const newFieldsMapping = fieldsMapping.map(item => {
            const { sourceField = {}, destField = {} } = item;
            const isValidField = isValidName(sourceField.name) || !sourceData.isDbType;
            const isNotSupport = isNotSupportField(sourceField);
            return {
              sourceField: {
                ...sourceField,
                isCheck: sourceField.isPk ? true : isValidField && !isNotSupport ? !checked : false,
              },
              destField: {
                ...destField,
                isCheck: destField && destField.isPk ? true : isValidField && !isNotSupport ? !checked : false,
              },
            };
          });
          setFieldsMapping(newFieldsMapping);
        }}
      />
    );
  };
  const renderCheckbox = (data, key) => {
    const destField = data.destField || {};
    const sourceField = data.sourceField || {};
    if (!matchedTypes) return;
    const isNotSupport = isNotSupportField(sourceField);

    return (
      <Checkbox
        size="small"
        //是主键，并且勾选状态样式
        className={cx({ customDisabled: sourceField.isPk && !!destField[key] })}
        checked={!!destField[key]}
        disabled={sourceField.isPk || (key !== 'isNotNull' && (sourceField.disabled || isNotSupport))}
        onClick={() => {
          updateFieldsMapping({
            sourceField: key === 'isCheck' ? { ...sourceField, isCheck: !sourceField.isCheck } : sourceField,
            destField: { ...destField, [key]: !destField[key] },
          });
        }}
      />
    );
  };
  const renderSelectName = data => {
    const destField = data.destField || {};
    const sourceField = data.sourceField || {};
    const isValidField = isValidName(sourceField.name) || !sourceData.isDbType;
    if (!matchedTypes) return;
    const matchedTypeIds = _.uniq((matchedTypes[sourceField.id] || []).map(type => type.dataType));
    const matchedMdTypeIds = _.uniq((matchedTypes[sourceField.id] || []).map(type => type.mdType));
    const isNotSupport = isNotSupportField(sourceField);

    const filterOptions = destData.isDbType
      ? (destData.destFields || []).filter(
          o =>
            (isExistJoinPk ? !!o.isPk === !!sourceField.isJoinPk : !!o.isPk === !!sourceField.isPk) &&
            _.includes(matchedTypeIds, o.jdbcTypeId),
        )
      : (destData.destFields || []).filter(
          o =>
            (!sourceData.isDbType
              ? isExistJoinPk
                ? !!o.isPk === !!sourceField.isJoinPk
                : !!o.isPk === !!sourceField.isPk
              : true) && _.includes(matchedMdTypeIds, o.mdType),
        );

    const options = filterOptions.map(item => {
      const isExist = _.includes(selectedFieldIds, item.id);

      return {
        ...item,
        disabled: isExist,
        label: (
          <div className="flexRow alignItemsCenter">
            {destData.isDbType ? (
              <span className={isExist && item.id !== destField.id ? 'Gray_c' : 'Gray_bd'}>[{`${item.dataType}`}]</span>
            ) : (
              <Icon
                icon={getIconByType(item.mdType, false)}
                className={isExist && item.id !== destField.id ? 'Gray_c Font18' : 'Gray_9e Font18'}
              />
            )}
            <span
              title={item.name}
              className={`mLeft8 overflow_ellipsis ${isExist && item.id !== destField.id ? 'Gray_c' : 'Gray'}`}
            >
              {item.name}
            </span>
          </div>
        ),
        value: item.id,
      };
    });

    const isNoMatchOption =
      destField.id &&
      options.filter(o =>
        destData.isOurCreateTable ? o.value.toLowerCase() === destField.id.toLowerCase() : o.value === destField.id,
      ).length === 0;

    const getValue = () => {
      if (isNoMatchOption) {
        return _l('映射关系失效');
      }
      //如果目的地表是通过我们同步任务创建的表时，id忽略大小写匹配
      if (destData.isOurCreateTable && options.length && destField.id) {
        return (options.filter(o => o.value.toLowerCase() === destField.id.toLowerCase())[0] || {}).value;
      }
      return destField.id;
    };

    return (
      <SelectWrapper ref={select => (selectNameRef.current[sourceField.id] = select)}>
        <Select
          disabled={!isValidField || isNotSupport}
          className={cx('selectItem w100', { isNoMatchOption })}
          placeholder={_l('无')}
          notFoundContent={_l('暂无数据')}
          getPopupContainer={() => selectNameRef.current[sourceField.id]}
          allowClear={true}
          status={isNoMatchOption && 'error'}
          value={getValue()}
          options={options}
          onChange={(value, option = {}) => {
            const updatedMapping = value
              ? {
                  sourceField: { ...sourceField, isCheck: true },
                  destField: {
                    ...destField,
                    id: value,
                    name: option.name,
                    alias: option.name,
                    dataType: option.dataType,
                    jdbcTypeId: option.jdbcTypeId,
                    precision: option.precision,
                    scale: option.scale,
                    isCheck: true,
                    isNotNull: option.isNotNull,
                    mdType: option.mdType,
                    controlSetting: option.controlSetting,
                    oid: option.oid,
                  },
                }
              : {
                  sourceField: { ...sourceField, isCheck: sourceField.isPk },
                  destField: {
                    ...destField,
                    id: null,
                    name: null,
                    alias: null,
                    dataType: null,
                    jdbcTypeId: null,
                    precision: null,
                    scale: null,
                    isCheck: destField.isPk,
                    isNotNull: destField.isPk,
                    mdType: null,
                    controlSetting: null,
                    oid: null,
                  },
                };
            updateFieldsMapping(updatedMapping);
          }}
        />
      </SelectWrapper>
    );
  };

  const getColumns = () => {
    if (sourceData.isDbType) {
      leftColumns = [
        {
          dataIndex: 'name',
          title: _l('字段(源)'),
          flex: 3,
          render: data => {
            const sourceField = data.sourceField;
            if (!matchedTypes) return;
            const isNotSupport = isNotSupportField(sourceField);

            return (
              <div className="flexRow">
                <span
                  title={sourceField.alias || sourceField.name}
                  className={`overflow_ellipsis ${sourceField.isDelete ? 'Red' : ''}`}
                >
                  {sourceField.alias || sourceField.name}
                </span>
                {sourceField.isPk && (
                  <div data-tip={_l('主键')} className="tip-top">
                    <Icon icon="key1" className="Gray_bd mLeft5" />
                  </div>
                )}
                {sourceField.disabled && (
                  <a href="https://help.mingdao.com/integration2" target="_blank">
                    <div data-tip={_l('名称包含特殊字符，无法同步')} className="tip-top">
                      <Icon icon="help" className="Gray_bd mLeft5" />
                    </div>
                  </a>
                )}
                {sourceField.isDelete && (
                  <div data-tip={_l('字段已删除')} className="tip-top">
                    <Icon icon="info1" className="Red mLeft5" />
                  </div>
                )}
                {isNotSupport && (
                  <div data-tip={_l('暂不支持同步')} className="tip-top">
                    <Icon icon="info1" className="Gray_bd mLeft5" />
                  </div>
                )}
              </div>
            );
          },
        },
        {
          dataIndex: 'dataType',
          title: _l('类型'),
          flex: 3,
          render: data => {
            const sourceField = data.sourceField;
            let dataType = sourceField.mdType && !sourceField.isJoinPk ? '' : sourceField.dataType; //表字段(有mdType) 不显示datatype
            return (
              <div title={dataType} className="overflow_ellipsis">
                <span>{dataType}</span>
              </div>
            );
          },
        },
        {
          dataIndex: 'isNotNull',
          title: _l('不允许NULL'),
          flex: 3,
          render: data => {
            const item = data.sourceField;
            return item.isNotNull ? <span className="Gray_9e">{_l('是')}</span> : '';
          },
        },
      ];
    } else {
      leftColumns = [
        {
          dataIndex: 'name',
          title: _l('字段(源)'),
          flex: 9,
          render: data => {
            const sourceField = data.sourceField;
            if (!matchedTypes) return;
            const isNotSupport = isNotSupportField(sourceField);

            return (
              <div className="flexRow alignItemsCenter">
                <Icon icon={getIconByType(sourceField.mdType, false)} className={cx('Font18 Gray_9e')} />
                <span
                  title={sourceField.alias || sourceField.name}
                  className={`mLeft8 overflow_ellipsis ${sourceField.isDelete ? 'Red' : ''}`}
                >
                  {sourceField.alias || sourceField.name}
                </span>
                {sourceField.isPk && (
                  <div data-tip={_l('主键')} className="tip-top">
                    <Icon icon="key1" className="Gray_bd mLeft5" />
                  </div>
                )}
                {sourceField.disabled && (
                  <a href="https://help.mingdao.com/integration2" target="_blank">
                    <div data-tip={_l('名称包含特殊字符，无法同步')} className="tip-top">
                      <Icon icon="help" className="Gray_bd mLeft5" />
                    </div>
                  </a>
                )}
                {sourceField.isDelete && (
                  <div data-tip={_l('字段已删除')} className="tip-top">
                    <Icon icon="info1" className="Red mLeft5" />
                  </div>
                )}
                {isNotSupport && (
                  <div data-tip={_l('暂不支持同步')} className="tip-top">
                    <Icon icon="info1" className="Gray_bd mLeft5" />
                  </div>
                )}
              </div>
            );
          },
        },
      ];
    }

    switch (true) {
      case isCreate && destData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 6,
            render: item => renderInputName(item),
          },
          {
            dataIndex: 'dataType_dest',
            title: _l('类型'),
            flex: 4,
            render: item => renderSelectType(item),
          },
          {
            dataIndex: 'isNotNull_dest',
            title: _l('不允许NULL'),
            flex: 2,
            render: item => renderCheckbox(item, 'isNotNull'),
          },
          {
            dataIndex: 'isPk_dest',
            title: _l('主键'),
            flex: 1,
            render: data => {
              const destField = data.destField || {};
              const sourceField = data.sourceField || {};
              //存在多表连接主键，joinPk显示主键，原主键字段不显示主键标识
              return (isExistJoinPk ? sourceField.isJoinPk : destField.isPk) ? (
                <div data-tip={_l('主键')} className="tip-top">
                  <Icon icon="key1" className="Font16 Gray_bd" />
                </div>
              ) : (
                ''
              );
            },
          },
          {
            dataIndex: 'comment_dest',
            title: '',
            flex: 1,
            render: data => {
              const item = data.destField || {};
              return (
                <div className={cx('isOperateCommonIcon', { isActive: !!item.comment })}>
                  <div className="tip-left" data-tip={!!item.comment ? item.comment : _l('设置字段注释')}>
                    <SetComment itemData={data} updateFieldsMapping={updateFieldsMapping} />
                  </div>
                </div>
              );
            },
          },
        ];
        break;
      case isCreate && !destData.isDbType && sourceData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 6,
            render: (item, column) => renderInputName(item, column),
          },
          {
            dataIndex: 'dataType_dest',
            title: _l('类型'),
            flex: 6,
            render: item => renderSelectType(item),
          },
          {
            dataIndex: 'title_dest',
            title: _l('标题字段'),
            flex: 2,
            render: data => {
              const destField = data.destField || {};
              const sourceField = data.sourceField || {};
              const canSetTitle = canSetAsTitle({ type: destField.mdType });
              return canSetTitle ? (
                <div
                  className={cx('isOperateCommonIcon', { isActive: destField.isTitle })}
                  data-tip={destField.isTitle ? _l('取消设为标题') : _l('设为标题')}
                >
                  <Icon
                    icon="ic_title"
                    className="Font16"
                    onClick={() => {
                      const newFieldsMapping = fieldsMapping.map(item => {
                        return {
                          sourceField: item.sourceField,
                          destField: {
                            ...item.destField,
                            isTitle: item.sourceField.id === sourceField.id ? !destField.isTitle : false,
                          },
                        };
                      });
                      setFieldsMapping && setFieldsMapping(newFieldsMapping);
                    }}
                  />
                </div>
              ) : null;
            },
          },
        ];
        break;
      case isCreate && !destData.isDbType && !sourceData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 9,
            render: item => renderInputName(item),
          },
          {
            dataIndex: 'title_dest',
            title: _l('标题字段'),
            flex: 5,
            render: data => {
              const destField = data.destField || {};
              const sourceField = data.sourceField || {};
              const canSetTitle =
                canSetAsTitle({ type: destField.mdType }) &&
                //如果存在joinPk，joinPk字段不允许设为标题，否则rowid不允许设为标题
                (isExistJoinPk ? !sourceField.isJoinPk : (sourceField.oid || '').split('_')[1] !== 'rowid');
              return canSetTitle ? (
                <div
                  className={cx('isOperateCommonIcon', { isActive: destField.isTitle })}
                  data-tip={destField.isTitle ? _l('取消设为标题') : _l('设为标题')}
                >
                  <Icon
                    icon="ic_title"
                    className="Font16"
                    onClick={() => {
                      const newFieldsMapping = fieldsMapping.map(item => {
                        return {
                          sourceField: item.sourceField,
                          destField: {
                            ...item.destField,
                            isTitle: item.sourceField.id === sourceField.id ? !destField.isTitle : false,
                          },
                        };
                      });
                      setFieldsMapping && setFieldsMapping(newFieldsMapping);
                    }}
                  />
                </div>
              ) : null;
            },
          },
        ];
        break;
      case !isCreate && destData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 6,
            render: item => renderSelectName(item),
          },
          {
            dataIndex: 'isNotNull_dest',
            title: _l('不允许NULL'),
            flex: 3,
            render: item => {
              return _.get(item, 'destField.isNotNull') ? <span className="Gray_9e">{_l('是')}</span> : '';
            },
          },
        ];
        break;
      case !isCreate && !destData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 9,
            render: item => renderSelectName(item),
          },
        ];
        break;
      default:
        rightColumns = [];
        break;
    }

    const columns = [
      {
        dataIndex: 'checkColumn',
        flex: 1,
        renderTitle: renderCheckAll,
        render: data => renderCheckbox(data, 'isCheck'),
      },
      ...leftColumns,
      {
        dataIndex: 'arrowColumn',
        title: '',
        flex: 3,
        render: data => {
          const sourceField = data.sourceField || {};
          const destField = data.destField || {};
          return (
            <div className={sourceField.isDelete ? 'Red' : cx('arrowIcon', { Gray_c: !destField.isCheck })}>
              <Icon icon={sourceField.isDelete ? 'close' : 'arrow_down'} className="Font20" />
            </div>
          );
        },
      },
      ...rightColumns,
    ];
    if (!isCreate) {
      columns.shift();
    }

    return columns;
  };

  return (
    <Wrapper>
      <div className="headTr">
        {getColumns().map((item, index) => {
          return (
            <div key={index} style={{ flex: item.flex }} className={`${item.dataIndex}`}>
              {item.renderTitle ? item.renderTitle() : item.title}
            </div>
          );
        })}
      </div>
      {fieldsMapping &&
        fieldsMapping.map((field, i) => {
          const sourceField = field.sourceField || {};
          return (
            <div className="itemWrapper">
              <div key={i} className="dataItem">
                {getColumns().map((column, j) => {
                  return (
                    <div key={`${i}-${j}`} style={{ flex: column.flex }} className={`${column.dataIndex}`}>
                      {column.render ? column.render(field, column) : field[column.dataIndex]}
                    </div>
                  );
                })}
              </div>
              {sourceField.isDelete && (
                <Icon
                  className="deleteIcon"
                  icon="delete1"
                  onClick={() => {
                    const newFieldsMapping = fieldsMapping.filter(item => item.sourceField.id !== sourceField.id);
                    setFieldsMapping(newFieldsMapping);
                  }}
                />
              )}
            </div>
          );
        })}
    </Wrapper>
  );
}
