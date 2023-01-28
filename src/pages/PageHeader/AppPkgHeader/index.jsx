import React, { Component } from 'react';
import api from 'api/homeApp';
import AppDetail from './AppDetail';
import { getIds } from '../util';
import { navigateTo } from '../../../router/navigateTo';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateSheetListLoading } from 'src/pages/worksheet/redux/actions/sheetList';
import './index.less';
import { getAppFeaturesVisible, browserIsMobile } from 'src/util';

@connect(
  undefined,
  dispatch => ({
    updateSheetListLoading: bindActionCreators(updateSheetListLoading, dispatch),
  }),
)
export default class AppPkgHeader extends Component {
  constructor(props) {
    super(props);
    if (
      (props.path === '/worksheet/:worksheetId?' || props.path === '/worksheet/:worksheetId/view/:viewId') &&
      location.href.indexOf('/row/') < 0
    ) {
      this.compatibleWorksheetRoute();
    }
    const { appId, groupId, worksheetId } = getIds(props);
    if (!worksheetId && !groupId) {
      this.completePara({ appId, groupId });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { appId, groupId, worksheetId } = getIds(nextProps);
    if (!worksheetId && !groupId) {
      this.completePara({ appId, groupId });
    }
  }

  // 兼容形如 /worksheet/:worksheetId?的旧工作表路由
  compatibleWorksheetRoute = () => {
    const { worksheetId, viewId } = getIds(this.props);
    api.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId, workSheetId }) => {
      if (appId && appSectionId) {
        if (browserIsMobile()) {
          location.href = `/mobile/recordList/${appId}/${appSectionId}/${workSheetId}${viewId ? '/' + viewId : ''}${location.search || ''}`;
        } else {
          navigateTo(
            `/app/${appId}/${appSectionId}/${workSheetId}${viewId ? '/' + viewId : ''}${location.search || ''}`,
            true,
          );
        }
      }
    });
  };

  /**
   * 参数补齐
   */
  completePara = ({ appId, groupId }) => {
    api.getAppFirstInfo({ appId, appSectionId: groupId }).then(({ appSectionId, workSheetId }) => {
      if (appSectionId) {
        navigateTo(`/app/${appId}/${appSectionId}/${workSheetId}`, true);
      } else {
        this.props.updateSheetListLoading(false);
      }
    });
  };

  render() {
    const { ...props } = this.props;
    // 获取url参数
    const { s, tb, tr } = getAppFeaturesVisible();

    if (!s && !tb && !tr) return null;

    return <AppDetail {...props} />;
  }
}
