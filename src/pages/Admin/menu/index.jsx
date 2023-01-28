import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Tooltip } from 'ming-ui';
import pathToRegexp from 'path-to-regexp';
import { navigateTo } from 'src/router/navigateTo';
import { getFeatureStatus } from 'src/util';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

@withRouter
export default class AdminLeftMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCompanyName: '',
      isExtend: this.props.isExtend,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { projectId },
      },
    } = this.props;
    md.global.Account.projects &&
      md.global.Account.projects.map(item => {
        if (item.projectId === projectId) {
          this.setState({
            currentCompanyName: item.companyName,
          });
        }
      });
  }

  renderLinkItem = ({ icon, name, menuPath, routes, featureId, key }, index) => {
    const {
      location: { pathname },
      match: {
        params: { projectId },
      },
    } = this.props;
    if (key === 'billinfo' && !md.global.Config.IsPlatformLocal) return;
    if (key === 'workwxapp' && md.global.Config.IsPlatformLocal) return;
    const isActive = () => {
      return _.some(routes, route => pathToRegexp(route.path).test(pathname));
    };
    const route = routes[0] || {};
    const compile = pathToRegexp.compile(menuPath || route.path);
    const path =
      route.path && route.path.indexOf(':projectId') === -1 ? compile({ 0: projectId }) : compile({ projectId });
    let featureType = getFeatureStatus(projectId, featureId);
    if (_.includes(['workwxapp', 'ding', 'welink', 'feishu', 'analytics', 'contactsHidden'], key) && !featureType) return;
    return (
      <Tooltip
        disable={this.state.isExtend}
        popupPlacement="right"
        offset={[0, 0]}
        text={<span>{name}</span>}
        key={index}
      >
        <li className="item">
          <NavLink
            id="linkAct"
            to={path}
            className={cx('ThemeHoverBGColor7', this.state.isExtend ? 'extendAct' : 'closeAct')}
            activeClassName="activeItem"
            isActive={isActive}
          >
            <i className={cx('Font20 color_c iconBox', icon)} />
            <div className="subName">{name}</div>
          </NavLink>
        </li>
      </Tooltip>
    );
  };

  handleTransition() {
    this.setState(
      {
        isExtend: !this.state.isExtend,
      },
      () => {
        safeLocalStorageSetItem('adminList_isUp', this.state.isExtend);
      },
    );
  }

  render() {
    const { currentCompanyName, isExtend } = this.state;
    const { menuList, match } = this.props;
    const { params } = match;
    return (
      <div id="menuList" className={cx(isExtend ? 'extendList' : 'closeList')}>
        <div className="ThemeBGColor9 h100 Relative menuContainer">
          <div className="title">
            <div
              className="companyName Hand"
              onClick={() => {
                navigateTo(`/admin/home/${params.projectId}`);
              }}
            >
              {currentCompanyName}
            </div>
            <Tooltip
              popupPlacement="right"
              offset={[10, 0]}
              text={<span>{isExtend ? _l('隐藏侧边栏') : _l('展开侧边栏')}</span>}
            >
              <span
                className={cx('Hand Font12 ThemeColor9 titleIconBox Block', isExtend ? 'icon-back-02' : 'icon-next-02')}
                onClick={this.handleTransition.bind(this)}
              ></span>
            </Tooltip>
          </div>
          <div className="listContainer">
            {menuList &&
              menuList.map((item, index) => {
                return (
                  <div key={index} className={cx({ Hidden: item.subMenuList && !item.subMenuList.length })}>
                    <div className="Font12 mTop24 mBottom4 color_c pLeft20">
                      {!isExtend && item.title ? <span className="muneSplitLine"></span> : item.title}
                    </div>
                    <ul className="manageItems">{_.map(item.subMenuList, this.renderLinkItem)}</ul>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}
