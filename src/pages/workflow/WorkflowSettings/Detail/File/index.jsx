import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown, Checkbox, Icon } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, SelectNodeObject, CustomTextarea } from '../components';
import cx from 'classnames';
import _ from 'lodash';

export default class File extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
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
  getNodeDetail(props, sId) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, selectNodeId: sId })
      .then(result => {
        this.setState({ data: result });
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
    const { name, selectNodeId, appId, fileName, pdf } = data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (!appId) {
      alert(_l('Word打印模板必选'), 2);
      return;
    }

    if (fileName && /[/:*?"<>|]/.test(fileName)) {
      alert(_l('非法文件名'), 2);
      return;
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
        selectNodeId,
        appId,
        fileName,
        pdf,
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
    const appList = data.appList.map(item => {
      return {
        text: item.name,
        value: item.id,
        className: item.id === data.appId ? 'ThemeColor3' : '',
      };
    });
    const selectAppItem = appList.find(item => item.value === data.appId);

    return (
      <Fragment>
        <div className="Gray_75 workflowDetailDesc pTop15 pBottom15">
          {_l(
            '将记录转为PDF或Word文件，可以通过新增记录、更新记录或发送邮件节点将文件写入附件。注：文档大小不得超过100M，作为邮件附件发送时不得超过10M。',
          )}
        </div>

        <div className="mTop20 bold">{_l('打印对象')}</div>
        <div className="Gray_75 mTop5">{_l('当前流程中的节点对象')}</div>

        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={sId => this.getNodeDetail(this.props, sId)}
        />

        <div className="mTop20 bold">{_l('打印模板')}</div>
        <Dropdown
          className={cx('flowDropdown mTop10', { 'errorBorder errorBG': data.appId && !selectAppItem })}
          data={appList}
          value={data.appId}
          renderTitle={
            !data.appId
              ? () => <span className="Gray_9e">{_l('请选择')}</span>
              : data.appId && !selectAppItem
              ? () => <span className="errorColor">{_l('模板已删除')}</span>
              : () => <span>{selectAppItem.text}</span>
          }
          border
          openSearch
          noData={_l('暂无Word打印模板')}
          onChange={appId => this.updateSource({ appId })}
        />

        <div className="mTop20 bold">{_l('文件名')}</div>
        <div className="Gray_75 mTop5">
          {_l('系统默认使用记录标题作为文件名，自定义名称时不得包含英文字符/:*?"<>|')}
        </div>
        <CustomTextarea
          processId={this.props.processId}
          selectNodeId={this.props.selectNodeId}
          type={2}
          height={0}
          content={data.fileName}
          formulaMap={data.formulaMap}
          onChange={(err, value, obj) => this.updateSource({ fileName: value })}
          updateSource={this.updateSource}
        />

        <div className="Font13 mTop20 bold">
          {_l('生成文件')}
          <span
            className="workflowDetailTipsWidth mLeft5 tip-top-right"
            data-tip={_l('系统默认会生成Word文件，生成的文件后续流程节点可直接使用')}
          >
            <Icon className="Font14 Gray_9e" icon="info" />
          </span>
        </div>
        <div className="mTop10 flexRow">
          <Checkbox
            className="InlineFlex"
            text={_l('生成PDF文件')}
            checked={data.pdf}
            disabled={!data.wpsConfig}
            onClick={checked => this.updateSource({ pdf: !checked })}
          />
        </div>
        {!data.wpsConfig && <div className="mTop5" style={{ color: '#ffa340' }}>{_l('未配置 PDF 转换服务')}</div>}
        {md.global.Config.IsPlatformLocal && data.pdf && (
          <div className="mTop5 Gray_9e">
            {_l('生成PDF文件是由WPS提供的第三方服务，收费标准为')}
            <span style={{ color: '#ffa340' }}>{_l('每个文件0.15元')}</span>
            {_l('，转换失败的文件将不收取费用。')}
          </div>
        )}
      </Fragment>
    );
  }

  render() {
    const { data } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-print"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={!!data.selectNodeId && !!data.appId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
