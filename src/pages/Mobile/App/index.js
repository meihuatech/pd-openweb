import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { List, Flex, ActionSheet, Modal, ActivityIndicator, Accordion, Switch, TabBar } from 'antd-mobile';
import { Icon, WaterMark } from 'ming-ui';
import cx from 'classnames';
import * as actions from './redux/actions';
import { ROLE_TYPES } from 'src/pages/Role/config.js';
import Back from '../components/Back';
import guideImg from './img/guide.png';
import DocumentTitle from 'react-document-title';
import { AppPermissionsInfo } from '../components/AppPermissions';
import RecordList from 'mobile/RecordList';
import CustomPage from 'mobile/CustomPage';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import FixedPage from './FixedPage';
import PortalAppHeader from 'src/pages/PageHeader/PortalAppHeader/index.jsx';
import WorksheetUnNormal from 'mobile/RecordList/State';
import { isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import _ from 'lodash';
const Item = List.Item;
let modal = null;

class App extends Component {
  constructor(props) {
    super(props);
    const { match, history } = props;
    const { hash } = history.location;
    const isHideTabBar = hash.includes('hideTabBar') || !!sessionStorage.getItem('hideTabBar');
    const hideSheetVisible = localStorage.getItem(`hideSheetVisible-${match.params.appId}`);
    this.state = {
      isHideTabBar,
      hideSheetVisible: hideSheetVisible ? false : true,
      selectedTab: match.params.worksheetId || 'more',
    };
    if (isHideTabBar) {
      sessionStorage.setItem('hideTabBar', true);
    }
  }

  componentDidMount() {
    const { params } = this.props.match;
    this.props.dispatch(actions.getAppDetail(params.appId, this.detectionUrl));
    $('html').addClass('appListMobile');
  }

  componentWillReceiveProps(nextProps) {
    const nextWorksheetId = nextProps.match.params.worksheetId;
    const appNaviStyle = _.get(nextProps, 'appDetail.detail.appNaviStyle');
    if (nextWorksheetId !== this.props.match.params.worksheetId) {
      this.setState({
        selectedTab: nextWorksheetId ? nextWorksheetId : 'more',
      });
      if (appNaviStyle === 2 && nextWorksheetId) {
        safeLocalStorageSetItem('currentNavWorksheetId', nextWorksheetId);
      }
    }
  }

  componentWillUnmount() {
    $('html').removeClass('appListMobile');
    sessionStorage.removeItem('detectionUrl');
    if (modal) {
      modal.close();
    } else {
      modal = null;
    }
    ActionSheet.close();
  }

  navigateTo(url) {
    url = (window.subPath || '') + url;

    if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
      url = url + '#publicapp' + window.publicAppAuthorization;
    }
    this.props.history.push(url);
  }

  detectionUrl = ({ appRoleType, isLock, appNaviStyle, appSectionDetail }) => {
    const { params } = this.props.match;
    if (appNaviStyle === 2 && !params.worksheetId && !sessionStorage.getItem('detectionUrl')) {
      const isCharge = isHaveCharge(appRoleType, isLock);
      const { appSectionId, workSheetInfo } = appSectionDetail[0];
      const { workSheetId } = isCharge
        ? workSheetInfo[0]
        : workSheetInfo.filter(o => o.status === 1 && !o.navigateHide)[0];
      window.mobileNavigateTo(`/mobile/app/${params.appId}/${appSectionId}/${workSheetId}`);
    }
  };

  handleOpenSheet = (data, item) => {
    const { params } = this.props.match;
    localStorage.removeItem('currentNavWorksheetId');
    if (item.type === 0) {
      const storage = localStorage.getItem(`mobileViewSheet-${item.workSheetId}`);
      let viewId = storage || '';
      this.navigateTo(
        `/mobile/recordList/${params.appId}/${data.appSectionId}/${item.workSheetId}${viewId ? `/${viewId}` : ''}`,
      );
    }
    if (item.type === 1) {
      this.navigateTo(`/mobile/customPage/${params.appId}/${data.appSectionId}/${item.workSheetId}`);
    }
  };

  handleSwitchSheet = (item, data) => {
    const { params } = this.props.match;
    const { appSectionId } = item;
    this.navigateTo(`/mobile/app/${params.appId}/${appSectionId}/${item.workSheetId}`);
    safeLocalStorageSetItem('currentNavWorksheetId', item.workSheetId);
  };

  renderList(data) {
    const { hideSheetVisible } = this.state;
    const { appDetail } = this.props;
    const { detail } = appDetail;
    return (
      <List>
        {data.workSheetInfo
          .filter(item => (hideSheetVisible ? true : item.status !== 2))
          .map(item => (
            <Item
              multipleLine
              key={item.workSheetId}
              thumb={<SvgIcon url={item.iconUrl} fill={detail.iconColor} size={22} />}
              extra={item.status === 2 ? <Icon icon="public-folder-hidden" /> : null}
              onClick={e => {
                if (_.includes(e.target.classList, 'icon-public-folder-hidden')) {
                  return;
                }
                this.handleOpenSheet(data, item);
              }}
            >
              <span className="Font16 Gray Bold LineHeight40">{item.workSheetName}</span>
            </Item>
          ))}
      </List>
    );
  }

  renderSudoku(data) {
    const { hideSheetVisible } = this.state;
    const { appDetail } = this.props;
    const { detail } = appDetail;
    return (
      <Flex className="sudokuWrapper" wrap="wrap">
        {data.workSheetInfo
          .filter(item => (hideSheetVisible ? true : item.status !== 2))
          .map(item => (
            <div key={item.workSheetId} className="sudokuItemWrapper">
              <div
                className="sudokuItem flexColumn valignWrapper"
                onClick={() => {
                  this.handleOpenSheet(data, item);
                }}
              >
                {item.status === 2 && <Icon icon="public-folder-hidden" />}
                <SvgIcon addClassName="mTop20" url={item.iconUrl} fill={detail.iconColor} size={30} />
                <div className="name">{item.workSheetName}</div>
              </div>
            </div>
          ))}
      </Flex>
    );
  }

  renderHeader(data) {
    return (
      <Fragment>
        <Icon icon="expand_more" />
        <div className="mLeft5">{data.name}</div>
      </Fragment>
    );
  }

  renderAppHeader() {
    const { isHideTabBar } = this.state;
    const { appDetail, match } = this.props;
    const { appName, detail, processCount } = appDetail;
    const { params } = match;
    const { fixed, permissionType, webMobileDisplay } = detail;
    const isAuthorityApp = permissionType >= ROLE_TYPES.ADMIN;
    if (md.global.Account.isPortal) {
      return (
        <PortalAppHeader
          appId={params.appId}
          isMobile={true}
          name={appName}
          iconUrl={detail.iconUrl}
          iconColor={detail.iconColor}
        />
      );
    }
    if (detail.appNaviStyle === 2 && !((fixed && !isAuthorityApp) || webMobileDisplay)) {
      return (
        <div className="flexRow valignWrapper appNaviStyle2Header">
          <div
            className={cx('flex flexRow valignWrapper Gray_75 process Relative', { hide: window.isPublicApp })}
            onClick={() => {
              this.navigateTo(`/mobile/processMatters?appId=${params.appId}`);
            }}
          >
            <Icon className="Font17" icon="knowledge_file" />
            <div className="mLeft5 Font14">{_l('流程事项')}</div>
            {!!processCount && (
              <div className="flexRow valignWrapper processCount">{processCount > 99 ? '99+' : processCount}</div>
            )}
          </div>
          <div
            className={cx('flex flexRow valignWrapper Gray_75 star', { hide: window.isPublicApp })}
            onClick={() => {
              this.props.dispatch(actions.updateAppMark(params.appId, detail.projectId, !detail.isMarked));
            }}
          >
            <Icon className={cx('Font17', { active: detail.isMarked })} icon="star_3" />
            <div className="mLeft5 Font14">{_l('星标')}</div>
          </div>
          <div
            className="flex flexRow valignWrapper Gray_75"
            onClick={() => {
              this.navigateTo(`/mobile/members/${params.appId}`);
            }}
          >
            <Icon className="Font17" icon="group" />
            <div className="mLeft5 Font14">{_l('人员管理')}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="appName flexColumn pLeft20 pRight20">
        <div className="content flex White flexRow valignWrapper">
          <div className="Font24 flex WordBreak overflow_ellipsis appNameTxt">
            <span className="Gray">{appName}</span>
          </div>
          {!webMobileDisplay && (
            <React.Fragment>
              <div className={cx('Relative flexRow valignWrapper', { hide: window.isPublicApp })}>
                <Icon
                  icon="knowledge_file"
                  className="Font26 Gray_bd"
                  onClick={() => {
                    this.navigateTo(`/mobile/processMatters?appId=${params.appId}`);
                  }}
                />
                {!!processCount && (
                  <div className="flexRow valignWrapper processCount">{processCount > 99 ? '99+' : processCount}</div>
                )}
              </div>
              <Icon
                icon="star_3"
                className={cx('mLeft15 Font26 Gray_bd', { active: detail.isMarked, hide: window.isPublicApp })}
                onClick={() => {
                  this.props.dispatch(actions.updateAppMark(params.appId, detail.projectId, !detail.isMarked));
                }}
              />
              <Icon
                icon="group"
                className="mLeft15 Font26 Gray_bd"
                onClick={() => {
                  this.navigateTo(`/mobile/members/${params.appId}`);
                }}
              />
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }

  renderSection(data) {
    const { appDetail } = this.props;
    const { appNaviStyle } = appDetail.detail;
    return (
      <Accordion.Panel header={this.renderHeader(data)} key={data.appSectionId}>
        {[0, 2].includes(appNaviStyle) && this.renderList(data)}
        {appNaviStyle === 1 && this.renderSudoku(data)}
      </Accordion.Panel>
    );
  }

  renderModal = () => {
    return (
      <Modal
        visible={!this.props.isQuitSuccess}
        transparent
        maskClosable={false}
        title={_l('无法退出通过部门加入的应用')}
        footer={[
          {
            text: _l('确认'),
            onPress: () => {
              this.props.dispatch({ type: 'MOBILE_QUIT_FAILED_CLOSE' });
            },
          },
        ]}
      >
        <div style={{ overflow: 'scroll' }}>{_l('您所在的部门被加入了此应用，只能由应用管理员进行操作')}</div>
      </Modal>
    );
  };

  renderGuide = () => {
    const { params } = this.props.match;
    return (
      <div className="guideWrapper">
        <div className="guide" />
        <img className="guideImg Absolute" src={guideImg} />
        <div className="text Absolute Font18 White bold">
          {_l('新应用仅您自己可见，请在“人员设置”将角色分配给协作者，再开始使用。')}
        </div>
        <div
          className="ok Absolute Font18 White bold"
          onClick={() => {
            this.navigateTo(`/mobile/app/${params.appId}`);
          }}
        >
          {_l('知晓了')}
        </div>
      </div>
    );
  };

  renderContent() {
    const { appDetail, match } = this.props;
    let { appName, detail, appSection, status } = appDetail;
    const { fixed, webMobileDisplay, fixAccount, fixRemark, permissionType } = detail;
    const isAuthorityApp = permissionType >= ROLE_TYPES.ADMIN;
    appSection = isAuthorityApp
      ? appSection
      : appSection
        .map(item => {
          return {
            ...item,
            workSheetInfo: item.workSheetInfo.filter(o => o.status === 1 && !o.navigateHide),
          };
        })
        .filter(o => o.workSheetInfo && o.workSheetInfo.length > 0);
    const { isHideTabBar, hideSheetVisible } = this.state;
    const { params } = match;
    const editHideSheetVisible = _.flatten(appSection.map(item => item.workSheetInfo)).filter(
      item => item.status === 2,
    ).length;
    const isEmptyAppSection = appSection.length === 1 && !appSection[0].name;
    if (!detail || detail.length <= 0) {
      return <AppPermissionsInfo appStatus={2} appId={params.appId} />;
    } else if (status === 4) {
      return <AppPermissionsInfo appStatus={4} appId={params.appId} />;
    } else {
      return (
        <Fragment>
          {appName && <DocumentTitle title={appName} />}
          {params.isNewApp && this.renderGuide()}
          <div
            className="flexColumn h100"
            style={(fixed && permissionType !== ROLE_TYPES.ADMIN) || webMobileDisplay ? { background: '#fff' } : {}}
          >
            {this.renderAppHeader()}
            {(fixed && !isAuthorityApp) || webMobileDisplay ? (
              <FixedPage fixAccount={fixAccount} fixRemark={fixRemark} isNoPublish={webMobileDisplay} />
            ) : (
              <div className="appSectionCon flex">
                {status === 5 ||
                  (detail.permissionType === ROLE_TYPES.MEMBER &&
                    appSection.length <= 1 &&
                    (appSection.length <= 0 || appSection[0].workSheetInfo.length <= 0)) ? (
                  // 应用无权限||成员身份 且 无任何数据
                  <AppPermissionsInfo appStatus={5} appId={params.appId} />
                ) : appSection.length <= 1 &&
                  (appSection.length <= 0 || appSection[0].workSheetInfo.length <= 0) &&
                  [ROLE_TYPES.OWNER, ROLE_TYPES.ADMIN].includes(detail.permissionType) ? (
                  // 管理员身份 且 无任何数据
                  <AppPermissionsInfo appStatus={1} appId={params.appId} />
                ) : (
                  <Fragment>
                    <Accordion
                      className={cx({ emptyAppSection: isEmptyAppSection })}
                      defaultActiveKey={appSection.map(item => item.appSectionId)}
                    >
                      {appSection.filter(item => item.workSheetInfo.length).map(item => this.renderSection(item))}
                    </Accordion>
                    {[ROLE_TYPES.OWNER, ROLE_TYPES.ADMIN].includes(detail.permissionType) && !!editHideSheetVisible && (
                      <div className="pAll20 pLeft16 flexRow valignWrapper">
                        <Switch
                          checked={hideSheetVisible}
                          color="#2196F3"
                          onChange={checked => {
                            this.setState({
                              hideSheetVisible: checked,
                            });
                            if (checked) {
                              localStorage.removeItem(`hideSheetVisible-${params.appId}`);
                            } else {
                              safeLocalStorageSetItem(`hideSheetVisible-${params.appId}`, true);
                            }
                          }}
                        />
                        <span className="Font15 Gray_9e">{_l('查看隐藏项')}</span>
                      </div>
                    )}
                  </Fragment>
                )}
              </div>
            )}
          </div>
          {((!isHideTabBar &&
            !window.isPublicApp &&
            !md.global.Account.isPortal &&
            detail.appNaviStyle !== 2 &&
            !fixed) ||
            (fixed && isAuthorityApp)) && (
              <Back
                style={{ bottom: detail.appNaviStyle == 2 && location.href.includes('mobile/app') ? '78px' : '20px' }}
                className="low"
                onClick={() => {
                  let currentGroupInfo =
                    localStorage.getItem('currentGroupInfo') && JSON.parse(localStorage.getItem('currentGroupInfo'));
                  if (_.isEmpty(currentGroupInfo)) {
                    this.navigateTo('/mobile/appHome');
                  } else {
                    history.back();
                  }
                }}
              />
            )}
          {!this.props.isQuitSuccess && this.renderModal()}
        </Fragment>
      );
    }
  }

  renderRecordList(data) {
    if (!data) {
      return <WorksheetUnNormal type="sheet" />; //应用项无权限或者已删除
    }
    const { type } = data;
    const { detail = {}, appSection } = this.props.appDetail;
    const { appNaviStyle } = detail;
    if (type === 0) {
      return <RecordList now={Date.now()} />;
    }
    if (type === 1) {
      return (
        <CustomPage
          pageTitle={data.workSheetName}
          now={Date.now()}
          appNaviStyle={appNaviStyle}
          appSection={appSection}
        />
      );
    }
  }

  renderBody() {
    const { appSection, detail } = this.props.appDetail;
    const { fixed, permissionType, webMobileDisplay } = detail;
    const isAuthorityApp = permissionType >= ROLE_TYPES.ADMIN;
    const { batchOptVisible } = this.props;

    if ([0, 1].includes(detail.appNaviStyle) || (fixed && !isAuthorityApp) || webMobileDisplay) {
      return this.renderContent();
    }

    const { selectedTab, isHideTabBar } = this.state;
    const sheetList = _.flatten(
      appSection.map(item => {
        item.workSheetInfo.forEach(sheet => {
          sheet.appSectionId = item.appSectionId;
        });
        return item.workSheetInfo;
      }),
    )
      .filter(item => (isAuthorityApp ? true : item.status === 1 && !item.navigateHide)) //左侧列表状态为1 且 角色权限没有设置隐藏
      .slice(0, 4);
    const data = _.find(sheetList, { workSheetId: selectedTab });
    const isHideNav = detail.permissionType < ROLE_TYPES.ADMIN && sheetList.length === 1 && !!data;
    return (
      <div className="flexColumn h100">
        <div className={cx('flex overflowHidden', { recordListWrapper: !isHideNav })}>
          {/* 外部门户显示头部导航 */}
          {selectedTab !== 'more' && md.global.Account.isPortal && this.renderAppHeader()}
          {selectedTab === 'more' ? this.renderContent() : this.renderRecordList(data)}
        </div>
        {sheetList.length > 0 && !batchOptVisible && (
          <TabBar
            unselectedTintColor="#949494"
            tintColor={detail.iconColor}
            barTintColor="white"
            hidden={isHideNav}
            noRenderContent={true}
          >
            {sheetList.map((item, index) => (
              <TabBar.Item
                title={item.workSheetName}
                key={item.workSheetId}
                icon={<SvgIcon url={item.iconUrl} fill="#757575" size={20} />}
                selectedIcon={<SvgIcon url={item.iconUrl} fill={detail.iconColor} size={20} />}
                selected={selectedTab === item.workSheetId}
                onPress={() => {
                  this.handleSwitchSheet(item, data);
                }}
              />
            ))}
            <TabBar.Item
              title={_l('更多')}
              key="more"
              icon={<Icon className="Font20" icon="menu" />}
              selectedIcon={<Icon className="Font20" icon="menu" />}
              selected={selectedTab === 'more'}
              onPress={() => {
                const { params } = this.props.match;
                this.navigateTo(`/mobile/app/${params.appId}`);
                sessionStorage.setItem('detectionUrl', 1);
              }}
            />
          </TabBar>
        )}
      </div>
    );
  }

  render() {
    const { isAppLoading, appDetail } = this.props;

    if (isAppLoading) {
      return (
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }

    const { detail } = appDetail;

    return <WaterMark projectId={detail.projectId}>{this.renderBody()}</WaterMark>;
  }
}

export default connect(state => {
  const { appDetail, isAppLoading, isQuitSuccess, batchOptVisible } = state.mobile;
  // status: null, // 0: 加载中 1:正常 2:关闭 3:删除 4:不是应用成员 5:是应用成员但未分配视图
  return {
    appDetail,
    isAppLoading,
    isQuitSuccess,
    batchOptVisible,
  };
})(App);
