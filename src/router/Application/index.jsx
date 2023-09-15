import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import genRouteComponent from '../genRouteComponent';
import ROUTE_CONFIG from './config';
import PORTAL_ROUTE_CONFIG from './portalConfig';
import ajaxRequest from 'src/api/homeApp';
import { LoadDiv } from 'ming-ui';
import UnusualContent from './UnusualContent';
import FixedContent from './FixedContent';
import { getIds } from '../../pages/PageHeader/util';
import { connect } from 'react-redux';
import { setAppStatus } from '../../pages/PageHeader/redux/action';
import _ from 'lodash';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';

@connect(state => ({ appPkg: state.appPkg }), dispatch => ({ setAppStatus: status => dispatch(setAppStatus(status)) }))
export default class Application extends Component {
  constructor(props) {
    super(props);
    this.genRouteComponent = genRouteComponent();
    this.state = {
      status: 0, // 0: 加载中 1:正常 2:关闭 3:删除 4:不是应用成员 5:是应用成员但未分配视图
    };
  }

  componentDidMount() {
    let { appId, worksheetId } = this.props.match.params;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    if (appId) {
      this.checkApp(appId);
    }

    // 老路由 先补齐参数
    if (worksheetId) {
      this.compatibleWorksheetRoute(worksheetId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.match.params.appId !== this.props.match.params.appId ||
      (window.redirected && location.href.indexOf('from=system') > -1)
    ) {
      this.checkApp(nextProps.match.params.appId);
    }
  }

  /**
   * 检测应用有效性
   */
  checkApp(appId) {
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    ajaxRequest
      .checkApp({ appId }, { silent: true })
      .then(status => {
        this.setState({ status });
        this.props.setAppStatus(status);
      })
      .fail(() => {
        this.setState({ status: 3 });
        this.props.setAppStatus({ status: 3 });
      });
  }

  /**
   * 兼容老路由补齐参数
   */
  compatibleWorksheetRoute(worksheetId) {
    ajaxRequest
      .getAppSimpleInfo({ workSheetId: worksheetId }, { silent: true })
      .then(result => {
        const { appId, appSectionId } = result;

        if (!appId || !appSectionId) {
          this.setState({ status: 3 });
        }
      })
      .fail(() => {
        this.setState({ status: 3 });
      });
  }

  render() {
    let { status } = this.state;
    const {
      location: { pathname },
      appPkg,
    } = this.props;
    let { appId } = getIds(this.props);
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    const { permissionType, fixed, pcDisplay } = appPkg;
    const isAuthorityApp = canEditApp(permissionType);
    if (status === 0) {
      return <LoadDiv />;
    }
    if ((pcDisplay || fixed) && !isAuthorityApp && !_.includes(pathname, 'role')) {
      return <FixedContent appPkg={appPkg} isNoPublish={pcDisplay} />;
    }
    if (_.includes([1], status) || (status === 5 && _.includes(pathname, 'role'))) {
      return <Switch>{this.genRouteComponent(md.global.Account.isPortal ? PORTAL_ROUTE_CONFIG : ROUTE_CONFIG)}</Switch>;
    }
    return <UnusualContent appPkg={appPkg} status={status} appId={appId} />;
  }
}
