import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SingleControlValue,
  SelectNodeObject,
  FilterAndSort,
  FindResult,
  CustomTextarea,
} from '../components';
import { CONTROLS_NAME, RELATION_TYPE, ACTION_ID } from '../../enum';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { checkConditionsIsNull } from '../../utils';
import cx from 'classnames';
import _ from 'lodash';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showOtherWorksheet: false,
      cacheKey: +new Date(),
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeDetail(nextProps);
    }

    if (
      nextProps.selectNodeName &&
      nextProps.selectNodeName !== this.props.selectNodeName &&
      nextProps.selectNodeId === this.props.selectNodeId &&
      !_.isEmpty(this.state.data)
    ) {
      this.updateSource({ name: nextProps.selectNodeName });
    }
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props, obj = {}) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode
      .getNodeDetail({
        processId,
        nodeId: selectNodeId,
        flowNodeType: selectNodeType,
        appId: obj.appId,
        selectNodeId: obj.selectNodeId,
      })
      .then(result => {
        result.fields = _.filter(result.fields, o => !_.includes([31, 32, 33], o.type));

        if (obj.appId && result.findFields.length) {
          result.findFields = [];
        }

        this.setState({ data: result, cacheKey: +new Date() });
      });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { name, appId, findFields, executeType, fields, selectNodeId, conditions, sorts, random, link, filters } =
      data;

    if (data.actionId === ACTION_ID.WORKSHEET_FIND && !appId) {
      alert(_l('必须先选择一个工作表'), 2);
      return;
    }

    if (data.actionId === ACTION_ID.BATCH_FIND && !selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (data.actionId === ACTION_ID.RECORD_LINK_FIND) {
      if (!link.trim()) {
        alert(_l('记录链接不能为空'), 2);
        return;
      } else if (!appId) {
        alert(_l('必须选择一个目标工作表'), 2);
        return;
      }
    }

    if (checkConditionsIsNull(conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    if (filters.length) {
      let hasError = false;

      filters.forEach(item => {
        if (checkConditionsIsNull(item.conditions)) {
          hasError = true;
        }
      });

      if (hasError) {
        alert(_l('筛选条件的判断值不能为空'), 2);
        return;
      }
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        appId,
        findFields,
        executeType,
        fields,
        selectNodeId,
        operateCondition: conditions,
        sorts,
        random,
        link,
        filters,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Gray_75 workflowDetailDesc pTop15 pBottom15">
          {data.actionId === ACTION_ID.RECORD_LINK_FIND
            ? _l(
                '通过解析内部成员访问或对外公开分享的记录链接来获取对应的记录对象，供流程中的其他节点使用。场景例如：仓库管理员在PC端使用扫描枪来扫描商品的二维码，将指向的记录链接写入文本框，由工作流解析出关联的产品，实现自动化出入库。',
              )
            : _l('基于一种获取方式，通过筛选条件和排序规则获得符合条件的唯一数据，供流程中的其他节点使用。')}
        </div>

        {data.actionId === ACTION_ID.WORKSHEET_FIND && this.renderWorksheet()}
        {data.actionId === ACTION_ID.BATCH_FIND && (
          <Fragment>
            <div className="mTop20 bold">{_l('选择多条数据节点')}</div>
            <SelectNodeObject
              appList={data.flowNodeAppDtos}
              selectNodeId={data.selectNodeId}
              selectNodeObj={data.selectNodeObj}
              onChange={selectNodeId => this.getNodeDetail(this.props, { selectNodeId })}
            />
            {this.renderFieldAndRule()}
            {data.selectNodeId && (
              <FindResult executeType={data.executeType} switchExecuteType={this.switchExecuteType} />
            )}
          </Fragment>
        )}
        {data.actionId === ACTION_ID.RECORD_LINK_FIND && this.renderRecordLink()}
      </Fragment>
    );
  }

  /**
   * 渲染工作表
   */
  renderWorksheet() {
    const { isApproval } = this.props;
    const { data, cacheKey } = this.state;
    const singleItem = (data.findFields || []).length ? data.findFields[0] : { fieldId: '' };
    const list = _.filter(
      data.controls,
      o => _.includes([2, 3, 4, 5, 6, 7, 8, 31, 32, 33], o.type) || (o.type === 37 && o.enumDefault2 === 6),
    ).map(item => {
      return {
        text: this.renderFieldsTitle(item),
        value: item.controlId,
        disabled: !!_.find(data.findFields, o => o.fieldId === item.controlId),
      };
    });

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('选择工作表')}</div>
        {this.selectWorksheet()}

        {data.findFields.length ? (
          <Fragment>
            <div className="mTop20 bold">{_l('选择字段')}</div>
            <Dropdown
              className="flowDropdown mTop10"
              data={list}
              value={singleItem.fieldId || undefined}
              border
              isAppendToBody
              placeholder={_l('请选择字段')}
              renderTitle={() =>
                singleItem.fieldId &&
                this.renderFieldsTitle(_.find(data.controls, obj => obj.controlId === singleItem.fieldId))
              }
              onChange={this.switchFields}
            />

            <div className="mTop20 bold">{_l('查找')}</div>
            <SingleControlValue
              companyId={this.props.companyId}
              processId={this.props.processId}
              selectNodeId={this.props.selectNodeId}
              controls={data.controls}
              formulaMap={data.formulaMap}
              fields={data.findFields}
              updateSource={this.updateFindFields}
              item={singleItem}
              i={0}
            />

            <div
              className="workflowDetailDesc pTop15 pBottom15 mTop20"
              style={{ background: 'rgba(255, 163, 64, 0.12)' }}
            >
              <div className="Gray_9e">{_l('新版查找方式支持通过多个筛选条件和排序规则来实现更精准查找。')}</div>
              <div className="mBottom5">
                {_l('注意：切换后您需要重新配置查找规则')}
                <span className="Gray_9e">{_l('，是否切换为新版？')}</span>
              </div>
              <span
                className="ThemeColor3 ThemeHoverColor2 pointer"
                onClick={() => this.getNodeDetail(this.props, { appId: data.appId })}
              >
                {_l('切换为新版，并重新配置')}
              </span>
            </div>
          </Fragment>
        ) : (
          this.renderFieldAndRule()
        )}

        {data.appId && !isApproval && (
          <FindResult executeType={data.executeType} allowAdd={true} switchExecuteType={this.switchExecuteType} />
        )}

        {data.appId && data.executeType === 1 && (
          <Fragment>
            <div className="actionFieldsSplit mRight0 mTop30" />
            <div className="Font13 mTop25 bold">{_l('新增记录')}</div>
            {data.fields.map((item, i) => {
              const singleObj = _.find(data.addControls, obj => obj.controlId === item.fieldId);
              const { controlName, sourceEntityName } = singleObj;
              return (
                <div key={i} className="relative">
                  <div className="mTop15 ellipsis Font13">
                    {controlName || singleObj.controlName}
                    {singleObj.required && <span className="mLeft5 red">*</span>}
                    {singleObj.type === 29 && (
                      <span className="Gray_9e">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>
                    )}
                  </div>
                  <SingleControlValue
                    key={cacheKey + i}
                    companyId={this.props.companyId}
                    processId={this.props.processId}
                    selectNodeId={this.props.selectNodeId}
                    controls={data.addControls}
                    formulaMap={data.formulaMap}
                    fields={data.fields}
                    updateSource={this.updateSource}
                    item={item}
                    i={i}
                  />
                </div>
              );
            })}
          </Fragment>
        )}

        {isApproval && <div className="mTop20 bold">{_l('未获取到数据时：继续执行')}</div>}
      </Fragment>
    );
  }

  /**
   * 选择工作表
   */
  selectWorksheet() {
    const { data } = this.state;
    const selectAppItem = data.appList.find(({ id }) => id === data.appId);
    const appList = data.appList
      .filter(item => !item.otherApkId)
      .map(item => {
        return {
          text: item.name,
          value: item.id,
          className: item.id === data.appId ? 'ThemeColor3' : '',
        };
      });
    const otherWorksheet = [
      {
        text: _l('其它应用下的工作表'),
        value: 'other',
        className: 'Gray_75',
      },
    ];

    return (
      <Dropdown
        className={cx('flowDropdown mTop10', { flowDropdownBorder: data.actionId === ACTION_ID.WORKSHEET_FIND })}
        data={[appList, this.props.relationType === RELATION_TYPE.NETWORK ? [] : otherWorksheet]}
        value={data.appId}
        renderTitle={
          !data.appId
            ? () => <span className="Gray_9e">{_l('请选择工作表')}</span>
            : data.appId && !selectAppItem
            ? () => <span className="errorColor">{_l('工作表无效或已删除')}</span>
            : () => (
                <Fragment>
                  <span>{selectAppItem.name}</span>
                  {selectAppItem.otherApkName && <span className="Gray_9e">（{selectAppItem.otherApkName}）</span>}
                </Fragment>
              )
        }
        border
        openSearch
        noData={_l('暂无工作表，请先在应用里创建')}
        onChange={appId => {
          if (appId === 'other') {
            this.setState({ showOtherWorksheet: true });
          } else {
            data.actionId === ACTION_ID.WORKSHEET_FIND
              ? this.getNodeDetail(this.props, { appId })
              : this.updateSource({ appId });
          }
        }}
      />
    );
  }

  /**
   * fields dropdown title
   */
  renderFieldsTitle(item) {
    if (!item) {
      return <span style={{ color: '#f44336' }}>{_l('字段已删除')}</span>;
    }

    return (
      <Fragment>
        <span className="Gray_9e mRight5">[{CONTROLS_NAME[item.type === 37 ? item.enumDefault2 : item.type]}]</span>
        <span>{item.controlName}</span>
      </Fragment>
    );
  }

  /**
   * 切换字段
   */
  switchFields = fieldId => {
    const { data } = this.state;
    const singleControl = _.find(data.controls, item => item.controlId === fieldId);
    const findFields = [
      {
        fieldId,
        type: singleControl.type,
        enumDefault: singleControl.enumDefault,
        fieldValue: singleControl.type === 26 || singleControl.type === 27 ? '[]' : '',
        fieldValueId: '',
        nodeId: '',
      },
    ];

    this.updateSource({ findFields, executeType: 2, fields: [] });
  };

  /**
   * 更新查找的值
   */
  updateFindFields = ({ fields, formulaMap }, callback = () => {}) => {
    if (fields) {
      const obj = fields[0];
      if (
        (obj.type !== 26 && obj.type !== 27 && obj.fieldValue) ||
        ((obj.type === 26 || obj.type === 27) && obj.fieldValue !== '[]') ||
        obj.fieldValueId
      ) {
        this.updateSource({ findFields: fields }, callback);
      } else {
        this.updateSource({ findFields: fields, executeType: 2, fields: [] }, callback);
      }
    }

    if (formulaMap) {
      this.updateSource({ formulaMap }, callback);
    }
  };

  /**
   * 切换后续执行方式
   */
  switchExecuteType = executeType => {
    const { data } = this.state;
    const fields = [];

    if (executeType === 1) {
      data.addControls.forEach(item => {
        fields.push({
          fieldId: item.controlId,
          type: item.type,
          enumDefault: item.enumDefault,
          nodeId: '',
          nodeName: '',
          fieldValueId: '',
          fieldValueName: '',
          fieldValue: item.type === 26 || item.type === 27 ? '[]' : '',
        });
      });
    }

    this.updateSource({ executeType, fields });
  };

  /**
   * 渲染字段和规则
   */
  renderFieldAndRule() {
    const { data, cacheKey } = this.state;

    if (!data.appId && !data.selectNodeId) return null;

    return (
      <FilterAndSort
        key={cacheKey}
        companyId={this.props.companyId}
        processId={this.props.processId}
        selectNodeId={this.props.selectNodeId}
        openNewFilter={!data.conditions.length}
        data={data}
        updateSource={this.updateSource}
        showRandom
        filterText={_l(
          '设置筛选条件，查找满足条件的数据。如果未添加筛选条件则表示只通过排序规则从所有记录中获得唯一数据',
        )}
        sortText={_l('当查找到多个数据时，将按照以下排序规则获得第一条数据。如果未设置规则，返回最近更新的一条数据')}
        filterEncryptCondition={data.actionId === ACTION_ID.WORKSHEET_FIND}
      />
    );
  }

  /**
   * 渲染记录链接获取
   */
  renderRecordLink() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('选择记录链接')}</div>
        <div className="Font13 Gray_9e mTop10">
          {_l('当前流程节点中的文本类型字段，系统将根据此链接获取相应的记录，供流程中其他节点使用')}
        </div>
        <div className="mTop10">
          <CustomTextarea
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
            type={2}
            height={0}
            content={data.link}
            formulaMap={data.formulaMap}
            onChange={(err, value, obj) => this.updateSource({ link: value })}
            updateSource={this.updateSource}
          />
        </div>

        <div className="mTop20 bold">{_l('选择目标工作表')}</div>
        <div className="Font13 Gray_9e mTop10">{_l('预计解析出的记录归属的工作表')}</div>
        {this.selectWorksheet()}

        <FindResult executeType={data.executeType} switchExecuteType={this.switchExecuteType} />
      </Fragment>
    );
  }

  render() {
    const { data, showOtherWorksheet } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-search"
          bg="BGYellow"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            data.actionId === ACTION_ID.WORKSHEET_FIND
              ? !!data.appId
              : data.actionId === ACTION_ID.BATCH_FIND
              ? !!data.selectNodeId
              : !!data.appId && !!data.link.trim()
          }
          onSave={this.onSave}
        />
        {showOtherWorksheet && (
          <SelectOtherWorksheetDialog
            projectId={this.props.companyId}
            worksheetType={0}
            selectedAppId={this.props.relationId}
            selectedWrorkesheetId={data.appId}
            visible
            onOk={(selectedAppId, selectedWrorkesheetId, { workSheetName, appName }) => {
              const isCurrentApp = this.props.relationId === selectedAppId;

              if (data.actionId === ACTION_ID.WORKSHEET_FIND) {
                this.getNodeDetail(this.props, { appId: selectedWrorkesheetId });
              } else {
                this.updateSource({
                  appList: _.uniqBy(
                    data.appList.concat([
                      {
                        id: selectedWrorkesheetId,
                        name: workSheetName,
                        otherApkId: isCurrentApp ? '' : selectedAppId,
                        otherApkName: isCurrentApp ? '' : appName,
                      },
                    ]),
                    'id',
                  ),
                  appId: selectedWrorkesheetId,
                });
              }
            }}
            onHide={() => this.setState({ showOtherWorksheet: false })}
          />
        )}
      </Fragment>
    );
  }
}
