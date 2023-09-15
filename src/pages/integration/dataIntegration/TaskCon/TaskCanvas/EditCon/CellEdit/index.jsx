import React, { Component } from 'react';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';
import cx from 'classnames';
import { DATABASE_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import dataSourceApi from 'src/pages/integration/api/datasource.js';
import LoadDiv from 'ming-ui/components/LoadDiv';
import {
  setFieldsMappingDefaultData,
  getFields,
} from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/util.js';
import { getInitFieldsMapping } from 'src/pages/integration/dataIntegration/utils.js';
import _ from 'lodash';
import SlideLayerTem from './SlideLayerTem';
import { mdJoinPkData } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';

const Wrap = styled.div`
  .AliasInput {
    max-width: 200px;
    &.isErr {
      border: 1px solid red;
    }
  }
  .selectItem {
    font-size: 13px;
    width: 100% !important;
  }
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  .conEdit {
    width: 800px;
    &.isMaxC {
      width: 1000px;
    }
    background: #ffffff;
    box-shadow: 0px 10px 24px rgba(0, 0, 0, 0.24);
    height: 100%;
    right: 0;
    position: absolute;
    .headCon {
      border: 1px solid #eaeaea;
      height: 55px;
      line-height: 55px;
      padding: 0 24px;
      .icon {
        color: #9e9e9e;
        &:hover {
          color: #2196f3;
        }
      }
    }
    .footerCon {
      padding: 12px 24px;
      height: 60px;
      background: #ffffff;
      bottom: 0;
      .btnCon {
        background: #2196f3;
        color: #fff;
        height: 36px;
        line-height: 36px;
        border: 1px solid #2196f3;
        border-radius: 3px;
        padding: 0 36px;
        &.cancleBtn {
          background: #fff;
          color: #2196f3;
        }
        &.disabled {
          border: 1px solid #bdbdbd;
          background: #bdbdbd;
        }
      }
    }
    .conC {
      overflow-y: auto;
      padding: 15px 24px;
      .listCon {
        height: auto;
      }
    }
  }
`;

export default class CellEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      node: props.node || {},
      sheetName: _.get(props.node, ['nodeConfig', 'config', 'tableName']), //新建工作表的名称
      matchedTypes: {},
      loading: true,
      fileList: [],
      isEr: false,
      isSetDefaultMap: false,
      duplicates: [],
    };
  }
  componentDidMount() {
    const { node = {} } = this.props;
    const { nodeType = '' } = node;
    if (nodeType === 'DEST_TABLE') {
      this.getFieldsDataTypeMatch(this.props);
    } else if (nodeType === 'SOURCE_TABLE') {
      this.getSourceFieldList();
    } else {
      this.setState({
        loading: false,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.node, nextProps.node) || !_.isEqual(this.props, nextProps)) {
      this.setState(
        {
          node: nextProps.node || {},
        },
        () => {
          const { nodeType = '' } = nextProps.node;
          if (nodeType === 'DEST_TABLE') {
            this.getFieldsDataTypeMatch(nextProps);
          } else if (nodeType === 'SOURCE_TABLE') {
            this.getSourceFieldList(nextProps);
          }
        },
      );
    }
  }
  componentDidUpdate() {
    setTimeout(() => {
      let isERR = $('.isNoMatchOption').length > 0;
      if (this.state.isEr !== isERR) {
        this.setState({
          isEr: isERR,
        });
      }
    }, 500);
  }

  getSourceFieldList = async nextProps => {
    const { node = {}, currentProjectId, list } = nextProps || this.props;
    this.setState({
      loading: true,
    });
    const isDestMDType =
      _.get(list.find(o => o.nodeType === 'DEST_TABLE') || {}, 'nodeConfig.config.dsType') ===
      DATABASE_TYPE.APPLICATION_WORKSHEET;
    let data =
      (await getFields({
        node,
        projectId: currentProjectId,
        isGetDest: true,
        isSourceAppType: true,
        isDestAppType: isDestMDType,
      })) || [];
    let fieldsData = (_.get(node, 'nodeConfig.fields') || []).map(o => {
      return { ...o, isErr: !data.find(it => it.id === o.id) };
    });
    let otherData = data
      .filter(o => !fieldsData.find(a => a.id === o.id))
      .map(o => {
        return { ...o, isCheck: false };
      });
    data = [...fieldsData, ...otherData];
    this.setState({
      loading: false,
      node: {
        ...node,
        nodeConfig: {
          ..._.get(node, ['nodeConfig']),
          fields: data,
        },
      },
    });
  };

  getFieldsDataTypeMatch = async nextProps => {
    const { list, node = {}, flowData = {} } = nextProps || this.props;
    const { srcIsDb } = flowData;
    const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
    this.setState({
      loading: true,
    });
    const hsMorePkData = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isPk).length > 1;
    const isDestMDType =
      _.get(list.find(o => o.nodeType === 'DEST_TABLE') || {}, 'nodeConfig.config.dsType') ===
      DATABASE_TYPE.APPLICATION_WORKSHEET;
    const data = _.get(node, ['nodeConfig', 'config', 'createTable'])
      ? []
      : await getFields({
          node,
          projectId: this.props.currentProjectId,
          isGetDest: false,
          isSourceAppType: !srcIsDb,
          isDestAppType: isDestMDType,
        }); //目的地字段
    let fileList = data;
    this.setState({
      fileList,
    });
    if (!_.get(node, 'nodeConfig.config.fieldsMapping') || _.get(node, 'nodeConfig.config.fieldsMapping').length <= 0) {
      let preFields = !hsMorePkData
        ? _.get(preNode, ['nodeConfig', 'fields'])
        : [mdJoinPkData, ..._.get(preNode, ['nodeConfig', 'fields'])];
      preFields = preFields.filter(o => o.isCheck);
      let mapping = getInitFieldsMapping(
        preFields,
        !srcIsDb,
        _.get(node, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
      );
      const mapDt = await setFieldsMappingDefaultData({
        initMapping: mapping.filter(o => !!o.sourceField),
        destFields: fileList,
        isSetDefaultFields: !_.get(node, ['nodeConfig', 'config', 'createTable']),
        sourceFields: preFields,
        isCreate: _.get(node, ['nodeConfig', 'config', 'createTable']),
        dataDestType: _.get(node, ['nodeConfig', 'config', 'dsType']),
        isSourceAppType: !srcIsDb,
        isDestAppType: _.get(node, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET,
      });
      this.setState({
        matchedTypes: mapDt.matchedTypes,
        loading: false,
        isSetDefaultMap: true,
        node: {
          ...node,
          nodeConfig: {
            ...node.nodeConfig,
            config: { ..._.get(node, 'nodeConfig.config'), fieldsMapping: mapDt.fieldsMapping },
          },
        },
      });
    } else {
      let sourceFields = _.get(preNode, 'nodeConfig.fields') || [];
      sourceFields = hsMorePkData ? [mdJoinPkData, ...sourceFields] : sourceFields;
      let listSourceField = _.get(node, 'nodeConfig.config.fieldsMapping').map(o => o.sourceField);
      sourceFields = _.uniqBy([...listSourceField, ...sourceFields], 'id');
      const res = await dataSourceApi.fieldsDataTypeMatch({
        dataDestType: _.get(node, ['nodeConfig', 'config', 'dsType']),
        sourceFields,
        isCreate: _.get(node, ['nodeConfig', 'config', 'createTable']),
      });
      this.setState({
        matchedTypes: res.matchedTypes,
        loading: false,
        isSetDefaultMap: false,
      });
    }
  };
  render() {
    const { onClose, onSave, list, flowData = {} } = this.props;
    const { srcIsDb } = flowData;
    const { node = {}, loading, sheetName, isEr } = this.state;
    const { nodeType = '', nodeConfig } = node;
    const { fields = [] } = nodeConfig;
    let disable = false;
    let txt = '';
    let duplicates = [];
    const destIsDb = _.get(node, ['nodeConfig', 'config', 'dsType']) !== DATABASE_TYPE.APPLICATION_WORKSHEET;
    // 保存的限制。
    // 1. 最少一个勾选字段 【新建 和 已有】，新建判断勾选，已有判断是否有映射关系，因为已有没有勾选按钮
    // 2. 工作表的话要设置标题 数据库要有主键 【这个就是新建了】
    // 如果来源表没有主键 这个页面也不能保存
    //目的地表
    const fieldsMapping = _.get(node, ['nodeConfig', 'config', 'fieldsMapping']) || [];
    if (nodeType === 'DEST_TABLE') {
      if (fieldsMapping.filter(o => _.get(o, 'destField.isCheck')).length <= 0) {
        disable = true;
        txt = _l('未设置相关映射字段');
      }
      //新建
      if (_.get(node, ['nodeConfig', 'config', 'createTable'])) {
        if (!sheetName) {
          disable = true;
          txt = _l('新建表未设置表名称');
        }
        if (
          fieldsMapping.filter(o => _.get(o, 'destField.isCheck') && !!(_.get(o, 'destField.name') || '').trim())
            .length < fieldsMapping.filter(o => _.get(o, 'destField.isCheck')).length
        ) {
          disable = true;
          txt = _l('未设置相关映射字段');
        }
        //目的地为工作表
        if (_.get(node, ['nodeConfig', 'config', 'dsType']) === DATABASE_TYPE.APPLICATION_WORKSHEET) {
          //标题字段
          if (fieldsMapping.filter(o => _.get(o, 'destField.isTitle') && !!_.get(o, 'destField.isCheck')).length <= 0) {
            disable = true;
            txt = _l('目标工作表未设置标题字段');
          }
        } else if (destIsDb) {
          //标题字段
          if (fieldsMapping.filter(o => _.get(o, 'destField.isPk')).length <= 0) {
            disable = true;
            txt = _l('目标工作表未设置主键 ');
          }
        }
        //新建，且目的地或数据源有库类型，都需要验证dataType
        if (destIsDb || srcIsDb) {
          if (
            fieldsMapping.filter(o => !!_.get(o, 'destField.isCheck') && !_.get(o, 'destField.dataType')).length > 0
          ) {
            disable = true;
            txt = _l('目标字段未设置类型 ');
          }
        }
      } else {
        if (fieldsMapping.filter(o => !!_.get(o, 'sourceField.isPk')).length > 0) {
          //主键未设置相关映射
          if (
            fieldsMapping.filter(
              o => !!_.get(o, 'sourceField.isPk') && !!_.get(o, 'destField.isCheck') && !!_.get(o, 'destField.id'),
            ).length < fieldsMapping.filter(o => !!_.get(o, 'sourceField.isPk')).length
          ) {
            disable = true;
            txt = _l('主键未设置相关映射');
          }
        }
        const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
        let fields = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isCheck);
        const hsMorePkData = (_.get(preNode, 'nodeConfig.fields') || []).filter(o => o.isPk).length > 1;
        fields = hsMorePkData ? [mdJoinPkData, ...fields] : fields;
        const ids = fields.map(it => it.id);
        if (
          fieldsMapping.filter(
            o =>
              !ids.includes(_.get(o, 'sourceField.id')) && //id
              !fields.find(
                it => o.sourceField.oid && o.sourceField.oid.indexOf(it.oid) >= 0 && [26, 27, 29].includes(it.mdType),
              ),
          ).length > 0 ||
          isEr
        ) {
          disable = true;
          txt = _l('存在错误映射');
        }
      }
    }
    if (nodeType === 'SOURCE_TABLE') {
      if (fields.filter(o => _.get(o, 'isErr')).length > 0) {
        disable = true;
        txt = _l('存在已失效或已删除的字段');
      }
      if (fields.filter(o => !_.get(o, 'isCheck') && _.get(o, 'isPk')).length > 0) {
        disable = true;
        txt = _l('未勾选主键字段');
      }
      const fieldsCheck = fields.filter(o => _.get(o, 'isCheck'));
      duplicates = fieldsCheck.reduce((acc, curr, index) => {
        const alias = curr.alias;
        const isDuplicate = fieldsCheck.slice(index + 1).some(item => item.alias === alias);
        if (isDuplicate) {
          acc.push(alias);
        }
        return acc;
      }, []);
      if (duplicates.length > 0) {
        disable = true;
        txt = _l('字段名称不能重复');
      }
    }
    if (nodeType === 'JOIN') {
      if (fields.filter(o => !_.get(o, 'isCheck') && _.get(o, 'isPk')).length > 0) {
        //所有的主键必须都勾选
        disable = true;
        txt = _l('未勾选主键字段');
      }
      const fieldsCheck = fields.filter(o => _.get(o, 'isCheck'));
      duplicates = fieldsCheck.reduce((acc, curr, index) => {
        const alias = curr.alias;
        const isDuplicate = fieldsCheck.slice(index + 1).some(item => item.alias === alias);
        if (isDuplicate) {
          acc.push(alias);
        }
        return acc;
      }, []);
      if (duplicates.length > 0) {
        disable = true;
        txt = _l('字段名称不能重复');
      }
      if (isEr) {
        disable = true;
        txt = _l('存在错误的配置');
      }
    }
    return (
      <Wrap className="">
        <div className={cx('conEdit flexColumn', { isMaxC: ['UNION', 'DEST_TABLE'].includes(nodeType) })}>
          <div className="headCon flexRow alignItemsCenter">
            <span className="Font18 Bold flex">{_l('编辑字段')}</span>
            {nodeType === 'SOURCE_TABLE' && (
              <Tooltip text={<span>{_l('刷新数据源字段')}</span>} action={['hover']} popupPlacement={'bottom'}>
                <i
                  className="icon icon-refresh1  Hand Font20 mLeft10"
                  onClick={() => {
                    this.getSourceFieldList();
                  }}
                ></i>
              </Tooltip>
            )}
            <i
              className="icon icon-close  Hand Font20 mLeft10"
              onClick={() => {
                onClose();
              }}
            ></i>
          </div>
          {loading ? (
            <LoadDiv />
          ) : (
            <React.Fragment>
              <div className="conC flex">
                <div className="listCon">
                  <SlideLayerTem {...this.props} state={this.state} onChangeInfo={info => this.setState({ ...info })} />
                </div>
              </div>
              <div className="footerCon">
                <span
                  className={cx('btnCon Hand InlineBlock saveBtn', {
                    disabled: loading || disable,
                  })}
                  onClick={() => {
                    if (loading) {
                      return;
                    }
                    if (disable) {
                      alert(txt, 3);
                      this.setState({ duplicates });
                      return;
                    }
                    if (nodeType === 'DEST_TABLE') {
                      const mapping = _.get(node, ['nodeConfig', 'config', 'fieldsMapping']) || [];
                      const data = mapping.map(o => {
                        if (
                          !_.get(o, 'destField.isCheck') ||
                          (!_.get(node, ['nodeConfig', 'config', 'createTable']) && !_.get(o, 'destField.id'))
                        ) {
                          return {
                            sourceField: _.omit(o.sourceField, ['isDelete']),
                            destField: null,
                          };
                        } else {
                          return {
                            ...o,
                            sourceField: _.omit(o.sourceField, ['isDelete']),
                          };
                        }
                      });
                      onSave({
                        ...node,
                        nodeConfig: {
                          ..._.get(node, ['nodeConfig']),
                          config: {
                            ..._.get(node, ['nodeConfig', 'config']),
                            fieldsMapping: data,
                          },
                          fields: data.map(o => o.destField).filter(o => !!o),
                        },
                      });
                    }
                    if (nodeType === 'SOURCE_TABLE') {
                      let fields = _.get(node, 'nodeConfig.fields').map(o => {
                        return _.omit(o, ['isErr']);
                      });
                      onSave({
                        ...node,
                        nodeConfig: {
                          ..._.get(node, ['nodeConfig']),
                          fields,
                          config: {
                            ..._.get(node, ['nodeConfig', 'config']),
                            fields,
                          },
                        },
                      });
                    }
                    if (nodeType === 'JOIN') {
                      onSave(node);
                    }
                  }}
                >
                  {_l('保存')}
                </span>
                <span
                  className="btnCon Hand InlineBlock cancleBtn mLeft20"
                  onClick={() => {
                    onClose();
                  }}
                >
                  {_l('取消')}
                </span>
              </div>
            </React.Fragment>
          )}
        </div>
      </Wrap>
    );
  }
}
