import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import { LoadDiv, Dialog } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import { isRelateRecordTableControl } from 'worksheet/util';
import './style.less';
import widgets from './widgets';
import RelateRecordMuster from './components/RelateRecordMuster';
import WidgetsDesc from './components/WidgetsDesc';
import WidgetsVerifyCode from './components/WidgetsVerifyCode';
import { convertControl, controlState, halfSwitchSize } from './tools/utils';
import { FORM_ERROR_TYPE, FROM } from './tools/config';
import { updateRulesData, checkAllValueAvailable } from './tools/filterFn';
import DataFormat, { checkRequired } from './tools/DataFormat';
import { browserIsMobile } from 'src/util';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import _ from 'lodash';
import FormLabel from './components/FormLabel';

export default class CustomFields extends Component {
  static propTypes = {
    flag: PropTypes.string,
    initSource: PropTypes.bool,
    from: PropTypes.number,
    projectId: PropTypes.string,
    worksheetId: PropTypes.string,
    recordId: PropTypes.string,
    appId: PropTypes.string,
    data: PropTypes.array,
    recordCreateTime: PropTypes.string,
    disabled: PropTypes.bool,
    forceFull: PropTypes.bool,
    onChange: PropTypes.func,
    disableRules: PropTypes.bool,
    rules: PropTypes.arrayOf(PropTypes.shape({})),
    getMasterFormData: PropTypes.func,
    openRelateRecord: PropTypes.func,
    openRelateSheet: PropTypes.func,
    registerCell: PropTypes.func,
    checkCellUnique: PropTypes.func,
    onFormDataReady: PropTypes.func,
    onWidgetChange: PropTypes.func,
  };

  static defaultProps = {
    initSource: false,
    getMasterFormData: () => {},
    onChange: () => {},
    openRelateRecord: () => {},
    openRelateSheet: () => {},
    registerCell: () => {},
    onFormDataReady: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      renderData: [],
      errorItems: [],
      uniqueErrorItems: [],
      rules: props.rules || [],
      rulesLoading: !props.disableRules && !props.rules,
      searchConfig: props.searchConfig || [],
      loadingItems: {},
      verifyCode: '', // 验证码
    };

    this.controlRefs = {};
  }

  componentWillMount() {
    const { data, disabled, isWorksheetQuery } = this.props;
    const { rulesLoading, searchConfig } = this.state;

    if (!rulesLoading && !isWorksheetQuery) {
      this.initSource(data, disabled);
    } else if (rulesLoading) {
      this.getRules(
        undefined,
        () => {
          if (isWorksheetQuery && !searchConfig.length) {
            this.getSearchConfig();
          }
        },
        isWorksheetQuery && !searchConfig.length,
      );
    } else if (isWorksheetQuery && !searchConfig.length) {
      this.getSearchConfig();
    }
  }

  componentDidMount() {
    if (navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0) {
      // 处理微信webview键盘收起 网页未撑开
      $(document).on('blur', '.customFieldsContainer input', () => {
        window.scrollTo(0, 0);
      });
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.flag !== nextProps.flag || this.props.data.length !== nextProps.data.length) {
      this.initSource(nextProps.data, nextProps.disabled, {
        setStateCb: () => {
          this.updateErrorState(false);
          this.changeStatus = false;
        },
      });
    }
    if (this.props.worksheetId !== nextProps.worksheetId) {
      this.getRules(nextProps);
    }
    if (this.props.isWorksheetQuery !== nextProps.isWorksheetQuery && nextProps.isWorksheetQuery) {
      this.getSearchConfig(nextProps);
    }
  }

  con = React.createRef();

  /**
   * 初始化数据
   */
  initSource(data, disabled, { setStateCb = () => {} } = {}) {
    const {
      isCreate,
      projectId,
      initSource,
      recordId,
      recordCreateTime,
      from,
      onFormDataReady,
      masterRecordRowId,
      ignoreLock,
      verifyAllControls,
    } = this.props;
    const { rules = [] } = this.state;

    this.dataFormat = new DataFormat({
      projectId,
      data,
      isCreate: _.isUndefined(isCreate) ? initSource || !recordId : isCreate,
      disabled,
      recordCreateTime,
      masterRecordRowId,
      ignoreLock,
      rules,
      from,
      verifyAllControls,
      embedData: {
        ..._.pick(this.props, ['projectId', 'appId', 'groupId', 'worksheetId', 'recordId', 'viewId']),
      },
      searchConfig: this.state.searchConfig,
      updateLoadingItems: loadingItems => {
        this.setState({ loadingItems });
      },
      activeTrigger: () => {
        if (!this.changeStatus && this.dataFormat) {
          this.props.onChange(this.dataFormat.getDataSource(), this.dataFormat.getUpdateControlIds(), {
            noSaveTemp: true,
          });
          this.changeStatus = true;
        }
      },
      onAsyncChange: ({ controlId, value }) => {
        this.props.onChange(this.dataFormat.getDataSource(), [controlId]);
        this.changeStatus = true;
        this.setState(
          {
            renderData: this.getFilterDataByRule(true),
            errorItems: this.dataFormat.getErrorControls(),
          },
          () => {
            if (_.every(Object.values(this.state.loadingItems), i => !i) && this.submitBegin) {
              this.submitFormData();
            }
          },
        );
      },
    });

    this.setState(
      {
        renderData: this.getFilterDataByRule(true),
        errorItems: this.dataFormat.getErrorControls(),
        uniqueErrorItems: [],
        rulesLoading: false,
      },
      () => {
        setStateCb();
        onFormDataReady(this.dataFormat);
      },
    );
  }

  /**
   * 规则筛选数据
   */
  getFilterDataByRule(isInit) {
    const { ignoreHideControl } = this.props;
    const { rules = [] } = this.state;

    return updateRulesData({
      rules,
      data: this.dataFormat.getDataSource(),
      from: this.props.from,
      updateControlIds: this.dataFormat.getUpdateRuleControlIds(),
      ignoreHideControl,
      checkRuleValidator: (controlId, errorType, errorMessage, ruleId) => {
        this.dataFormat.setErrorControl(controlId, errorType, errorMessage, ruleId, isInit);
      },
    });
  }

  /**
   * 获取字段显示规则
   */
  getRules = (nextProps, cb = () => {}, noInitSource) => {
    const { worksheetId, disabled, onRulesLoad = () => {} } = nextProps || this.props;

    sheetAjax.getControlRules({ worksheetId, type: 1 }).then(rules => {
      const { data } = nextProps || this.props;
      onRulesLoad(rules);
      this.setState({ rules }, () => {
        if (!noInitSource) {
          this.initSource(data, disabled);
        }
        cb();
      });
    });
  };

  /**
   * 获取查询配置
   */
  getSearchConfig = nextProps => {
    const { worksheetId, disabled } = nextProps || this.props;

    sheetAjax.getQueryBySheetId({ worksheetId }).then(res => {
      this.setState({ searchConfig: formatSearchConfigs(res) }, () =>
        this.initSource((nextProps || this.props).data, disabled),
      );
    });
  };

  /**
   * 渲染表单
   */
  renderForm() {
    const { from, worksheetId, recordId, forceFull, controlProps } = this.props;
    const { errorItems, uniqueErrorItems, loadingItems } = this.state;
    const isMobile = browserIsMobile();
    const formList = [];
    let prevRow = -1;
    let preIsSection;
    let data = [].concat(this.state.renderData);

    data.sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });
    const richTextControlCount = data.filter(c => c.type === 41).length;
    data
      .filter(
        item =>
          !item.hidden &&
          controlState(item, from).visible &&
          (!isRelateRecordTableControl(item) || FROM.H5_ADD === from),
      ) // 过滤不可见的 && (过滤关联多条列表 || h5新增)
      .filter(item =>
        recordId
          ? !(
              isRelateRecordTableControl(item) &&
              (_.includes([FROM.SHARE, FROM.H5_EDIT, FROM.WORKFLOW, FROM.CUSTOM_BUTTON], from) || isMobile)
            )
          : true,
      )
      .forEach(item => {
        if ((item.row !== prevRow || isMobile || forceFull) && !preIsSection && prevRow > -1) {
          formList.push(<div className="customFormLine" key={`clearfix-${item.row}-${item.col}`} />);
        }

        // 兼容老数据没有size的情况
        if (!item.size) {
          item.size = halfSwitchSize(item, from);
        }

        const isFull = isMobile || forceFull || item.size === 12;

        formList.push(
          <div
            className="customFormItem"
            style={{
              width: isFull ? '100%' : `${(item.size / 12) * 100}%`,
              display: item.type === 49 && this.props.disabled ? 'none' : 'block',
            }}
            key={`item-${item.row}-${item.col}`}
          >
            {item.type === 22 && _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && (
              <div className="relative" style={{ height: 10 }}>
                <div className="Absolute" style={{ background: '#f5f5f5', height: 10, left: -1000, right: -1000 }} />
              </div>
            )}

            {!_.includes([45], item.type) && (
              <FormLabel
                from={from}
                worksheetId={worksheetId}
                recordId={recordId}
                item={item}
                errorItems={errorItems}
                uniqueErrorItems={uniqueErrorItems}
                loadingItems={loadingItems}
                updateErrorState={this.updateErrorState}
                handleChange={this.handleChange}
              />
            )}

            <div className="customFormItemControl">
              {this.getWidgets(Object.assign({}, item, controlProps, { richTextControlCount }))}
              {this.renderVerifyCode(item)}
            </div>

            {item.type === 22 && !_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && (
              <div className="customFormLine" style={{ background: '#ccc', margin: 0 }} />
            )}
          </div>,
        );

        prevRow = item.row;
        preIsSection = item.type === 22 || item.type === 10010;
      });

    return formList;
  }

  /**
   * 渲染短信验证码
   */
  renderVerifyCode(item) {
    const { controlId, type } = item;
    const { smsVerificationFiled, smsVerification } = this.props;

    if (
      window.isPublicWorksheet &&
      smsVerification &&
      type === 3 &&
      smsVerificationFiled === controlId &&
      controlState(item, 4).editable
    ) {
      return (
        <WidgetsVerifyCode
          {...item}
          verifyCode={this.state.verifyCode}
          worksheetId={this.props.worksheetId}
          handleChange={verifyCode => this.setState({ verifyCode })}
        />
      );
    }
    return null;
  }

  /**
   * 更新error显示状态
   */
  updateErrorState = (isShow, controlId) => {
    if (controlId) {
      this.setState({
        errorItems: this.state.errorItems.map(item =>
          item.controlId === controlId ? Object.assign({}, item, { showError: false }) : item,
        ),
      });
    } else {
      this.setState({
        errorItems: this.state.errorItems.map(item => Object.assign({}, item, { showError: isShow })),
      });
    }
  };

  /**
   * 更新errorItems,包含表单和业务规则必填错误
   */
  setErrorItemsByRule = (controlId, control) => {
    const newErrorItems = this.dataFormat.getErrorControls();
    this.setState({
      errorItems: newErrorItems.map(item =>
        item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.RULE_REQUIRED
          ? Object.assign({}, item, { showError: !!checkRequired(control) })
          : item,
      ),
    });
  };

  /**
   * 组件onChange方法
   */
  handleChange = (value, cid, item) => {
    const { onWidgetChange = () => {} } = this.props;
    const { uniqueErrorItems } = this.state;

    if (!_.get(value, 'rows')) {
      onWidgetChange();
    }
    if (item.value !== value || cid !== item.controlId) {
      this.dataFormat.updateDataSource({
        controlId: cid,
        value,
        removeUniqueItem: id => {
          _.remove(uniqueErrorItems, o => o.controlId === id && o.errorType === FORM_ERROR_TYPE.UNIQUE);
        },
        searchByChange: true,
      });
      this.setState({ renderData: this.getFilterDataByRule() }, () =>
        this.setErrorItemsByRule(cid, { ...item, value }),
      );

      const ids = this.dataFormat.getUpdateControlIds();
      if (ids.length) {
        this.props.onChange(this.dataFormat.getDataSource(), ids);
        this.changeStatus = true;
      }
    }
  };

  /**
   * 获取控件
   */
  getWidgets(item) {
    const {
      initSource,
      flag,
      projectId,
      worksheetId,
      recordId,
      viewId,
      appId,
      from,
      openRelateSheet = () => {},
      registerCell,
      sheetSwitchPermit = [],
      systemControlData,
      popupContainer,
      getMasterFormData,
      isCharge,
    } = this.props;

    // 他表字段
    if (convertControl(item.type) === 'SHEET_FIELD') {
      item = _.cloneDeep(item);
      item.value =
        item.sourceControlType === 3 && item.sourceControl.enumDefault === 1
          ? (item.value || '').replace(/\+86/, '')
          : item.value;
      item.type = item.sourceControlType === 3 ? 2 : item.sourceControlType;
      item.enumDefault = item.sourceControlType === 3 ? 2 : item.enumDefault;
      item.disabled = true;
      item.advancedSetting = (item.sourceControl || {}).advancedSetting || {};
    }

    const { type, controlId } = item;
    const Widgets = widgets[convertControl(type)];

    if (!Widgets) {
      return undefined;
    }

    const isEditable = controlState(item, from).editable;
    const maskPermissions = isCharge || _.get(item, 'advancedSetting.isdecrypt[0]') === '1';

    // (禁用或只读) 且 内容不存在
    if (
      (item.disabled || _.includes([25, 31, 32, 33, 37, 38], item.type) || !isEditable) &&
      ((!item.value && item.value !== 0 && !_.includes([28, 47], item.type)) ||
        (_.includes([21, 26, 27, 29, 48], item.type) &&
          _.isArray(JSON.parse(item.value)) &&
          !JSON.parse(item.value).length)) &&
      from !== 21
    ) {
      return (
        <React.Fragment>
          <div className="customFormNull" />
          {!recordId && <WidgetsDesc item={item} from={from} />}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Widgets
          {...item}
          flag={flag}
          isCharge={isCharge}
          maskPermissions={maskPermissions}
          popupContainer={popupContainer}
          sheetSwitchPermit={sheetSwitchPermit} // 工作表业务模板权限
          disabled={(item.disabled || !isEditable) && from !== 21}
          projectId={projectId}
          from={from}
          worksheetId={worksheetId}
          recordId={recordId}
          appId={appId}
          viewIdForPermit={viewId}
          initSource={initSource}
          onChange={(value, cid = controlId) => {
            this.handleChange(value, cid, item);
          }}
          onBlur={originValue => {
            const newValue = `${item.value}` ? `${item.value}`.trim() : '';
            if (item.unique && newValue) {
              this.checkControlUnique(controlId, type, newValue);
            }
            if (newValue && newValue !== originValue) {
              this.dataFormat.updateDataBySearchConfigs({ control: item, searchType: 'onBlur' });
            }
          }}
          openRelateSheet={openRelateSheet}
          registerCell={cell => {
            this.controlRefs[controlId] = cell;
            registerCell({ item, cell });
          }}
          getControlRef={key => this.controlRefs[key]}
          formData={this.dataFormat
            .getDataSource()
            .concat(systemControlData || [])
            .concat(getMasterFormData() || [])}
        />
        {!recordId && item.type !== 34 && <WidgetsDesc item={item} from={from} />}
      </React.Fragment>
    );
  }

  /**
   * 验证唯一值
   */
  checkControlUnique(controlId, controlType, controlValue) {
    const { worksheetId, recordId, checkCellUnique, onError = () => {} } = this.props;
    const { uniqueErrorItems, loadingItems } = this.state;

    if (_.isFunction(checkCellUnique)) {
      if (checkCellUnique(controlId, controlValue)) {
        _.remove(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE);
      } else {
        uniqueErrorItems.push({
          controlId,
          errorType: FORM_ERROR_TYPE.UNIQUE,
          showError: true,
        });
        this.setState({ uniqueErrorItems });
      }
      return;
    }

    this.setState({ loadingItems: { ...loadingItems, [controlId]: true } });

    worksheetAjax
      .checkFieldUnique({
        worksheetId,
        controlId,
        controlType,
        controlValue,
      })
      .then(res => {
        if (!res.isSuccess && res.data && res.data.rowId !== recordId) {
          uniqueErrorItems.push({
            controlId,
            errorType: FORM_ERROR_TYPE.UNIQUE,
            showError: true,
          });
          onError();
        } else if (res.isSuccess) {
          _.remove(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE);
        }

        this.setState({ uniqueErrorItems, loadingItems: { ...loadingItems, [controlId]: false } }, () => {
          if (res.isSuccess && this.submitBegin) {
            this.submitFormData();
          }
        });
      });
  }

  /**
   * 提交的时唯一值错误
   */
  uniqueErrorUpdate(uniqueErrorIds) {
    const { uniqueErrorItems } = this.state;

    alert(_l('记录提交失败：数据重复'), 2);

    (uniqueErrorIds || []).forEach(controlId => {
      if (
        !_.find(uniqueErrorItems, item => item.controlId === controlId && item.errorType === FORM_ERROR_TYPE.UNIQUE)
      ) {
        uniqueErrorItems.push({
          controlId,
          errorType: FORM_ERROR_TYPE.UNIQUE,
          showError: true,
        });
        this.setState({ uniqueErrorItems });
      }
    });
  }

  /**
   * 提交错误信息弹层
   */
  errorDialog(errors) {
    const isMobile = browserIsMobile();
    if (isMobile) {
      Modal.alert(
        _l('错误提示'),
        <div>
          {errors.map(item => (
            <div className="Gray_75 mBottom6 WordBreak">{item}</div>
          ))}
        </div>,
        [{ text: _l('取消'), onPress: _.noop }],
      );
    } else {
      Dialog.confirm({
        className: 'ruleErrorMsgDialog',
        title: <span className="Bold Font17 Red">{_l('错误提示')}</span>,
        description: (
          <div>
            {errors.map(item => (
              <div className="Gray_75 mBottom6 WordBreak">{item}</div>
            ))}
          </div>
        ),
        removeCancelBtn: true,
      });
    }
  }

  /**
   * 更新渲染数据
   */
  updateRenderData() {
    this.setState({ renderData: this.getFilterDataByRule() });
  }

  /**
   * 获取提交数据
   */
  getSubmitData({ silent, ignoreAlert, verifyAllControls } = {}) {
    const { from, recordId, ignoreHideControl } = this.props;
    const { errorItems, uniqueErrorItems, rules = [] } = this.state;
    const updateControlIds = this.dataFormat.getUpdateControlIds();
    const list = updateRulesData({
      rules,
      data: this.dataFormat.getDataSource(),
      checkAllUpdate: true,
      ignoreHideControl,
    });
    // 保存时必走，防止无字段变更判断错误
    const errors =
      updateControlIds.length || !recordId || this.submitBegin || verifyAllControls
        ? checkAllValueAvailable(rules, list, from)
        : [];
    const ids = verifyAllControls
      ? list.map(it => it.controlId)
      : list
          .filter(item => controlState(item, from).visible && controlState(item, from).editable)
          .map(it => it.controlId);
    const hasError = !!errorItems.concat(uniqueErrorItems).filter(it => _.includes(ids, it.controlId)).length;
    const hasRuleError = errors.length;

    // 提交时所有错误showError更新为true
    this.updateErrorState(hasError);

    let error;

    if (hasError) {
      if (!ignoreAlert && !silent) alert(_l('请正确填写记录'), 3);
      error = true;
    } else if ($(this.con.current, '.workSheetRecordInfo').find('.Progress--circle').length > 0) {
      alert(_l('附件正在上传，请稍后'), 3);
      error = true;
    } else if (hasRuleError) {
      error = true;
    }

    if (!hasError && hasRuleError && !silent) {
      this.errorDialog(errors);
    }

    return { data: list, updateControlIds, hasError, hasRuleError, error };
  }

  /**
   * 表单提交数据
   */
  submitFormData(options) {
    this.submitBegin = true;
    const { loadingItems } = this.state;
    const { onSave } = this.props;
    const { data, updateControlIds, error } = this.getSubmitData(options);

    if (!error && _.some(Object.values(loadingItems), i => i)) {
      return;
    }

    onSave(error, { data, updateControlIds });
    this.submitBegin = false;
  }

  render() {
    const { from, recordId, openRelateRecord, disabled } = this.props;
    const { rulesLoading, renderData } = this.state;

    if (rulesLoading) {
      return (
        <div className="customFieldsLoading" style={{ paddingTop: 50 }}>
          <LoadDiv />
        </div>
      );
    }

    const isMobile = browserIsMobile();
    const recordMuster = recordId
      ? renderData.filter(item => isRelateRecordTableControl(item) && controlState(item, from).visible)
      : [];

    return (
      <div
        className={cx('customFieldsContainer', {
          mobileContainer: isMobile,
          wxContainer: _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) && !disabled,
        })}
        ref={this.con}
      >
        {this.renderForm()}
        {!!recordMuster.length && _.includes([FROM.SHARE, FROM.WORKFLOW], from) && (
          <RelateRecordMuster data={recordMuster} openRelateRecord={openRelateRecord} />
        )}
      </div>
    );
  }
}
