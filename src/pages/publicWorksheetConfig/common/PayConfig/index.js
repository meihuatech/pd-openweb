import React, { Component, Fragment } from 'react';
import { Support, Icon, Dropdown, Switch, LoadDiv, Button, Tooltip } from 'ming-ui';
import { Select } from 'antd';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import { FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import MapField from './components/MapField';
import ShowBtnFilterDialog from 'src/pages/worksheet/common/CreateCustomBtn/components/ShowBtnFilterDialog';
import FilterViewRange from './components/FilterViewRange';
import worksheetSettingAjax from 'src/api/worksheetSetting';
import paymentAjax from 'src/api/payment';
import worksheetAjax from 'src/api/worksheet';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { navigateTo } from 'src/router/navigateTo';
import './index.less';
import cx from 'classnames';
import _ from 'lodash';

const checkIsDeleted = (value, data = []) => !value || _.findIndex(data, v => v.controlId === value) === -1;

const filterDeleteFields = (fieldMaps, controls) => {
  fieldMaps = !_.isEmpty(fieldMaps)
    ? fieldMaps
    : {
        orderNo: '',
        totalFee: '',
        payMethod: '',
        payStatus: '',
        createOrderTime: '',
        payTime: '',
        refundFee: '',
        settleFee: '',
        tradeFee: '',
        mchId: '',
        sourceType: '',
        payAccount: '',
      };
  const newFieldMaps = _.clone(fieldMaps);
  _.forEach(Object.keys(newFieldMaps), item => {
    if (checkIsDeleted(newFieldMaps[item], controls)) {
      newFieldMaps[item] = '';
    }
  });
  return newFieldMaps;
};

const getMapControls = (controls, fieldMapIds, field) => {
  return controls
    .filter(v => {
      let relationControls = [];
      if (v.type === 30) {
        relationControls = (_.find(controls, c => `$${c.controlId}$` === v.dataSource) || {}).relationControls || [];
      }
      if (field === 'content') {
        return (
          (v.type === 2 || _.find(relationControls, r => r.controlId === v.sourceControlId && r.type === 2)) &&
          !_.includes([...NORMAL_SYSTEM_FIELDS_SORT, ...WORKFLOW_SYSTEM_FIELDS_SORT, ...fieldMapIds], v.controlId)
        );
      }
      return (
        (_.includes([6, 8, 31, 37], v.type) ||
          _.find(relationControls, r => r.controlId === v.sourceControlId && _.includes([6, 8, 31], r.type))) &&
        !_.includes(fieldMapIds, v.controlId)
      );
    })
    .map(c => ({ text: c.controlName, value: c.controlId }));
};

export default class PayConfig extends Component {
  constructor(props) {
    super(props);

    this.state = {
      merchantList: [],
      worksheetList: [],
      fieldMaps: {},
      expireTime: 10,
      loading: true,
      isRefundAllowed: false, //是否启用退款
      scenes: {},
      enableOrderVisible: false,
      internalUser: {
        isEnable: true,
        viewIds: [],
        filter: [],
      },
      externalUser: {
        isEnable: false,
        viewIds: [],
        filter: [],
      },
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    const { worksheetInfo = {} } = this.props;
    const { projectId, appId, worksheetId } = worksheetInfo;

    Promise.all([
      worksheetSettingAjax.getPaymentSetting({
        projectId,
        appId,
        worksheetId,
      }),
      paymentAjax.getMerchantsForDropdownList({ projectId, appId }),
      worksheetAjax.getWorksheetInfo({ getRelationSearch: true, worksheetId, getViews: true, resultType: 2 }),
    ]).then(([settings = {}, merchantList = [], worksheetInfo = {}]) => {
      const {
        orderVisibleViewId,
        worksheetPaymentSetting = {},
        isEnabledExternalPortal,
        isEnabledPublicForm,
        boundControlIds = [],
      } = settings;
      const { internalUser = {}, externalUser = {} } = worksheetPaymentSetting;
      const controls = _.get(worksheetInfo, 'template.controls') || [];
      const list = merchantList
        .filter(v => v.status === 3)
        .map(({ shortName, merchantNo }) => ({
          text: shortName || merchantNo,
          value: merchantNo,
        }));
      const initSettings = {
        ..._.pick(settings, [
          'projectId',
          'worksheetId',
          'mchid',
          'scenes',
          'payContentControlId',
          'payAmountControlId',
          'mapWorksheetId',
          'expireTime',
          'enableOrderVisible',
          'orderVisibleViewId',
          'isRefundAllowed',
        ]),
        fieldMaps: filterDeleteFields(settings.fieldMaps, controls),
        internalUser: {
          isEnable: _.isUndefined(internalUser.isEnable) ? true : internalUser.isEnable,
          viewIds: internalUser.viewId ? JSON.parse(internalUser.viewId) : [],
          filter: internalUser.filter ? JSON.parse(internalUser.filter) : [],
        },
        externalUser: {
          isEnable:
            _.isUndefined(externalUser.isEnable) && isEnabledExternalPortal ? true : externalUser.isEnable || false,
          viewIds: externalUser.viewId ? JSON.parse(externalUser.viewId) : [],
          filter: externalUser.filter ? JSON.parse(externalUser.filter) : [],
        },
      };
      this.setState({
        ...initSettings,
        loading: false,
        merchantList: list,
        initSettings,
        initExpireTime: settings.expireTime,
        controls,
        worksheetInfo,
        orderVisibleViewIds: orderVisibleViewId ? JSON.parse(orderVisibleViewId) : [],
        isEnabledExternalPortal,
        isEnabledPublicForm,
        boundControlIds,
      });
    });
  };

  changeViewRange = ({ type, viewIds = [] }) => {
    if (type === 'recordDetail') {
      this.setState({ orderVisibleViewIds: viewIds });
    } else {
      this.setState({ [type]: { ...this.state[type], viewIds } });
    }
  };

  changeScenes = (checked, key) => {
    const { scenes = {}, merchantList = [], mchid, initSettings = {} } = this.state;
    const { publicWorkSheet, workSheet } = scenes;

    this.setState({
      scenes: { ...scenes, [key]: !checked },
      mchid: mchid ? mchid : !checked && !_.isEmpty(merchantList) ? merchantList[0].value : initSettings.mchid,
    });
  };

  onSave = () => {
    const { worksheetInfo = {} } = this.props;
    const { projectId, appId, worksheetId } = worksheetInfo;
    const {
      mchid,
      scenes,
      payContentControlId,
      payAmountControlId,
      fieldMaps,
      expireTime,
      initSettings,
      enableOrderVisible,
      controls,
      merchantList = [],
      isRefundAllowed,
      orderVisibleViewIds = [],
      internalUser = {},
      externalUser = {},
    } = this.state;

    if (scenes.publicWorkSheet) {
      if (!mchid || !_.find(merchantList, v => v.value === mchid)) {
        alert(_l('请选择商户'), 2);
        return;
      }
      if (checkIsDeleted(payContentControlId, controls)) {
        alert(_l('请选择支付内容'), 2);
        return;
      }
      if (checkIsDeleted(payAmountControlId, controls)) {
        alert(_l('请选择支付金额'), 2);
        return;
      }
    }
    worksheetSettingAjax
      .savPaymentSetting({
        projectId,
        worksheetId,
        appId,
        mchid,
        scenes,
        payContentControlId,
        payAmountControlId,
        mapWorksheetId: worksheetId,
        fieldMaps: filterDeleteFields(fieldMaps, controls),
        expireTime,
        enableOrderVisible,
        isRefundAllowed,
        orderVisibleViewId: JSON.stringify(orderVisibleViewIds),
        worksheetPaymentSetting: {
          internalUser: {
            isEnable: internalUser.isEnable,
            viewId: JSON.stringify(internalUser.viewIds),
            filter: JSON.stringify(internalUser.filter),
          },
          externalUser: {
            isEnable: externalUser.isEnable,
            viewId: JSON.stringify(externalUser.viewIds),
            filter: JSON.stringify(externalUser.filter),
          },
        },
      })
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          this.setState({
            initExpireTime: expireTime,
            initSettings: {
              ...initSettings,
              mchid,
              scenes,
              payContentControlId,
              payAmountControlId,
              fieldMaps: filterDeleteFields(fieldMaps, controls),
              expireTime,
              enableOrderVisible,
              isRefundAllowed,
              orderVisibleViewId: JSON.stringify(orderVisibleViewIds),
              internalUser,
              externalUser,
            },
          });
        } else {
          alert(_l('保存失败'), 2);
        }
      });
  };

  comparePayConfigData = () => {
    const {
      initSettings = {},
      projectId,
      worksheetId,
      mchid,
      scenes,
      payContentControlId,
      payAmountControlId,
      mapWorksheetId,
      fieldMaps,
      expireTime,
      enableOrderVisible,
      internalUser,
      externalUser,
      isRefundAllowed,
      orderVisibleViewIds = [],
    } = this.state;
    const { publicWorkSheet, workSheet } = scenes;

    const currentSettings =
      !publicWorkSheet && !workSheet && !initSettings.publicWorkSheet && !initSettings.workSheet && !initSettings.mchid
        ? initSettings
        : {
            projectId,
            worksheetId,
            mchid,
            scenes,
            payContentControlId,
            payAmountControlId,
            mapWorksheetId,
            fieldMaps,
            expireTime,
            enableOrderVisible,
            orderVisibleViewId: JSON.stringify(orderVisibleViewIds),
            internalUser,
            externalUser,
            isRefundAllowed,
          };

    return !_.isEqual(currentSettings, initSettings);
  };

  // 支付按钮设置（工作表记录）
  renderWorksheetSetting = () => {
    const { worksheetInfo } = this.props;
    const { projectId, appId, switches = [] } = worksheetInfo;
    const { showFilterDialog, filterType, controls = [], isEnabledExternalPortal } = this.state;

    return (
      <Fragment>
        <div className="title">{_l('支付按钮设置（工作表记录）')}</div>
        {[
          { key: 'internalUser', text: _l('应用内成员可用') },
          { key: 'externalUser', text: _l('外部门户用户可用') },
        ].map(item => {
          const { key, text } = item;
          const { isEnable, viewIds, filter = [] } = this.state[key] || {};
          const hasFilters = !_.isEmpty(filter);

          return (
            <Fragment>
              <div className="flexRow" key={key}>
                {key === 'externalUser' && !isEnabledExternalPortal && !isEnable ? (
                  <Tooltip text={_l('请先开启外部门户功能')} popupPlacement="bottom">
                    <span>
                      <Switch
                        size="small"
                        className="mTop2 mRight8"
                        checked={isEnable}
                        disabled={true}
                        onClick={checked => this.setState({ [key]: { ...this.state[key], isEnable: !checked } })}
                      />
                    </span>
                  </Tooltip>
                ) : (
                  <Switch
                    size="small"
                    className="mTop2 mRight8"
                    checked={isEnable}
                    onClick={checked => this.setState({ [key]: { ...this.state[key], isEnable: !checked } })}
                  />
                )}

                <div className="flex">
                  <div
                    className={cx('Font14 bold', {
                      mBottom20: key === 'internalUser' || (key === 'externalUser' && isEnable),
                    })}
                  >
                    {text}
                  </div>
                  {isEnable && (
                    <Fragment>
                      <div className="mBottom10 bold Font14">{_l('使用范围')}</div>
                      <FilterViewRange
                        className="filterView"
                        type={key}
                        worksheetInfo={worksheetInfo}
                        viewIds={viewIds}
                        changeViewRange={this.changeViewRange}
                      />

                      <div className="mTop20 mBottom10 bold Font14">{_l('按钮显示条件')}</div>
                      <div className="flexRow mBottom10">
                        <div className="Gray_75">
                          {_l('当支付内容、支付金额字段不为空时') + (hasFilters ? _l('，且满足以下条件：') : '')}
                        </div>
                        <div className="flex"></div>
                        {hasFilters && (
                          <div
                            className="ThemeColor"
                            onClick={() => this.setState({ [key]: { ...this.state[key], filter: [] } })}
                          >
                            {_l('清除条件')}
                          </div>
                        )}
                      </div>
                      {hasFilters ? (
                        <FilterItemTexts
                          filterItemTexts={filterData(controls, filter)}
                          loading={false}
                          editFn={() => this.setState({ showFilterDialog: true, filterType: key })}
                        />
                      ) : (
                        <div
                          className={cx('Hand filterTxt ', { mBottom30: key === 'internalUser' })}
                          onClick={() => this.setState({ showFilterDialog: true, filterType: key })}
                        >
                          <i className="icon icon-plus" />
                          {_l('筛选条件')}
                        </div>
                      )}
                    </Fragment>
                  )}
                </div>
              </div>
              {showFilterDialog && filterType === key && (
                <ShowBtnFilterDialog
                  sheetSwitchPermit={switches}
                  projectId={projectId}
                  appId={appId}
                  columns={controls}
                  filters={filter}
                  isShowBtnFilterDialog={showFilterDialog}
                  showType={1}
                  setValue={value =>
                    this.setState({
                      [key]: { ...this.state[key], filter: value.filters },
                      showFilterDialog: value.isShowBtnFilterDialog,
                    })
                  }
                />
              )}
            </Fragment>
          );
        })}
      </Fragment>
    );
  };

  render() {
    const { worksheetInfo = {} } = this.props;
    const { projectId } = worksheetInfo;
    const {
      mchid,
      scenes = {},
      payAmountControlId,
      payContentControlId,
      showMapFieldsDialog,
      merchantList,
      fieldMaps = {},
      expireTime,
      loading,
      searchValue,
      dropdownVisible,
      enableOrderVisible,
      initExpireTime,
      isRefundAllowed,
      controls = [],
      orderVisibleViewIds = [],
      isEnabledPublicForm,
      boundControlIds,
    } = this.state;

    const isEmptyField = Object.keys(fieldMaps).every(v => !fieldMaps[v]);
    const fieldMapIds = Object.values(fieldMaps);

    if (loading) {
      return <LoadDiv className="mTop20" />;
    }

    let options = [
      { label: _l('10分钟'), value: 10 },
      { label: _l('15分钟'), value: 15 },
      { label: _l('20分钟'), value: 20 },
      { label: _l('25分钟'), value: 25 },
      { label: _l('30分钟'), value: 30 },
    ];
    options =
      !dropdownVisible && !_.includes([10, 15, 20, 25, 30], expireTime)
        ? options.concat([{ label: _l('%0分钟', expireTime), value: expireTime }])
        : options;

    return (
      <div className="payConfigWrap w100 h100">
        <div className="payConfigCon">
          <h1>{_l('支付')}</h1>
          <div className="Gray_9e mTop10">
            {_l('注：修改支付相关配置，可能影响已经支付订单，请谨慎操作')}
            <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/org/payment" />
          </div>
          <div className="payConfigContent">
            {/* <div className="Font16 bold mBottom16">{_l('支付场景')}</div> */}
            <ul className="enableScene">
              {[
                {
                  key: 'publicWorkSheet',
                  title: _l('公开表单'),
                  text: _l('在公开表单提交后支付，常用于活动报名等场景'),
                },
                {
                  key: 'workSheet',
                  title: _l('工作表记录'),
                  text: _l('在工作表记录中显示支付按钮，可以在用户使用外部门户时支付，或组织内完成支付'),
                },
              ].map(item => {
                return (
                  <li className="flexColumn">
                    <div className="Font15 bold mBottom10">{item.title}</div>
                    <div className="Gray_9e flex mBottom15">{item.text}</div>
                    {item.key === 'publicWorkSheet' && !isEnabledPublicForm && !scenes.publicWorkSheet ? (
                      <div>
                        <Tooltip text={_l('请先开启公开表单功能')} popupPlacement="bottom">
                          <span>
                            <Switch
                              size="small"
                              className="mRight18"
                              checked={scenes[item.key]}
                              disabled={true}
                              onClick={checked => this.changeScenes(checked, item.key)}
                            />
                          </span>
                        </Tooltip>
                      </div>
                    ) : (
                      <Switch
                        size="small"
                        className="mRight18"
                        checked={scenes[item.key]}
                        onClick={checked => this.changeScenes(checked, item.key)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            {scenes.publicWorkSheet || scenes.workSheet ? (
              <Fragment>
                <div className="title">{_l('支付设置')}</div>
                <div className="subTitle">{_l('选择商户')}</div>
                {_.isEmpty(merchantList) ? (
                  <div
                    className="emptyMerchant Hand"
                    onClick={() => navigateTo(`/admin/merchant/${projectId}?iscreate=true`)}
                  >
                    {_l('创建商户')}
                  </div>
                ) : (
                  <Dropdown
                    disabled={merchantList.length === 1 && mchid === merchantList[0].value}
                    className="w100"
                    menuClass="w100"
                    border
                    value={mchid}
                    data={merchantList}
                    onChange={value => this.setState({ mchid: value })}
                  />
                )}
                <div className="subTitle required">{_l('支付内容')}</div>
                <div className="Gray_9e mBottom16">{_l('订单/支付页面显示的商品/产品简要描述')}</div>
                <Dropdown
                  className={cx('w100', {
                    emptyDropdown: checkIsDeleted(payContentControlId, controls),
                  })}
                  menuClass="w100"
                  border
                  placeholder={_l('选择文本字段')}
                  value={payContentControlId}
                  data={getMapControls(controls, fieldMapIds.concat(boundControlIds), 'content')}
                  onChange={value => this.setState({ payContentControlId: value })}
                />
                <div className="subTitle required">{_l('支付金额')}</div>
                <div className="Gray_9e mBottom16">
                  {_l(
                    '支持字段：金额、数值、公式、汇总；限制在2位小数（超过只取前两位数值），可支付的金额范围：0.01~10000',
                  )}
                </div>
                <Dropdown
                  className={cx('w100', {
                    emptyDropdown: checkIsDeleted(payAmountControlId, controls),
                  })}
                  menuClass="w100"
                  border
                  placeholder={_l('选择金额、数值、公式、汇总字段')}
                  value={payAmountControlId}
                  data={getMapControls(controls, fieldMapIds.concat(boundControlIds), 'amount')}
                  onChange={value => this.setState({ payAmountControlId: value })}
                />
                <div className="subTitle flexRow">
                  <Switch
                    className="mRight12"
                    size="small"
                    checked={expireTime}
                    onClick={checked => this.setState({ expireTime: checked ? 0 : initExpireTime || 15 })}
                  />
                  {_l('设置交易有效期')}
                </div>
                <div className={cx('Gray_9e', { mBottom16: expireTime })}>
                  {_l('开启后用户需要在系统设置的时间内完成交易，逾期平台将关闭交易，同时该记录将不再支持用户支付')}
                </div>
                {expireTime ? (
                  <Select
                    className="w100 mdAntSelect"
                    showSearch
                    placeholder={_l('选择或填写时间')}
                    value={expireTime}
                    searchValue={searchValue}
                    suffixIcon={<i className="icon icon-arrow-down-border Gray_9e" />}
                    options={options}
                    onChange={value => {
                      this.setState({ expireTime: value, searchValue: undefined });
                    }}
                    onSearch={value => {
                      let val = value.replace(/\D/g, '');
                      val = val && Number(val) > 30 ? '30' : val;
                      this.setState({ expireTime: val ? Number(val) : expireTime, searchValue: val });
                    }}
                    onDropdownVisibleChange={open => this.setState({ dropdownVisible: open })}
                  />
                ) : (
                  ''
                )}
                {scenes.workSheet && this.renderWorksheetSetting()}
                <div className="title">{_l('其他')}</div>
                {scenes.workSheet && (
                  <Fragment>
                    <div className="flexRow alignItemsCenter">
                      <Switch
                        className="mRight8"
                        size="small"
                        checked={isRefundAllowed}
                        onClick={checked => this.setState({ isRefundAllowed: !checked })}
                      />
                      <span className="bold Font14">{_l('允许退款')}</span>
                    </div>
                    <div className="Gray_9e mTop10 mBottom30">
                      {_l('开通后完成交易7天内的订单支持申请退款，目前仅付款人可申请退款')}
                    </div>
                  </Fragment>
                )}
                <div className="flexRow alignItemsCenter mBottom10">
                  <Switch
                    className="mRight8"
                    size="small"
                    checked={enableOrderVisible}
                    onClick={checked => this.setState({ enableOrderVisible: !checked })}
                  />
                  <span className="bold Font14">{_l('在记录详情侧边栏显示支付订单信息')}</span>
                </div>
                <FilterViewRange
                  className="filterView"
                  type="recordDetail"
                  worksheetInfo={worksheetInfo}
                  viewIds={orderVisibleViewIds}
                  changeViewRange={this.changeViewRange}
                />
                <div className="subTitle">{_l('字段映射')}</div>
                <div className="Gray_9e mBottom16">{_l('将订单明细映射到当前记录')}</div>
                <div className="mapSettingBtn Hand" onClick={() => this.setState({ showMapFieldsDialog: true })}>
                  {isEmptyField ? (
                    _l('点击设置')
                  ) : (
                    <Fragment>
                      <Icon icon="check_circle1" className="mRight10 Font18 TxtMiddle" style={{ color: '#4CAF50' }} />
                      {_l('已设置')}
                    </Fragment>
                  )}
                </div>
              </Fragment>
            ) : (
              ''
            )}
          </div>
        </div>

        {showMapFieldsDialog && (
          <MapField
            visible={showMapFieldsDialog}
            payContentControlId={payContentControlId}
            payAmountControlId={payAmountControlId}
            worksheetInfo={worksheetInfo}
            fieldMaps={fieldMaps}
            boundControlIds={boundControlIds}
            onCancel={() => this.setState({ showMapFieldsDialog: false })}
            onOk={data => {
              let fieldMaps = {};
              data.forEach(item => {
                fieldMaps[item.controlId] = item.mapFieldControlId || '';
              });
              this.setState({ fieldMaps });
            }}
          />
        )}
        <div className="footer">
          <Button type="primary" onClick={this.onSave}>
            {_l('保存设置')}
          </Button>
        </div>
      </div>
    );
  }
}