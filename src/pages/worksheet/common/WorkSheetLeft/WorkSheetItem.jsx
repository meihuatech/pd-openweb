import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, MdLink, Tooltip } from 'ming-ui';
import tinycolor from '@ctrl/tinycolor';
import MoreOperation from './MoreOperation';
import SvgIcon from 'src/components/SvgIcon';
import Drag from './Drag';
import styled from 'styled-components';
import _ from 'lodash';
import { canEditData, canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getEmbedValue } from 'src/components/newCustomFields/tools/utils.js';
import { addBehaviorLog } from 'src/util';

const Wrap = styled.div`
  &.active .name::before {
    background-color: ${props => props.iconColor} !important;
  }
`;

export function convertColor(colorStr) {
  return colorStr ? tinycolor(colorStr).setAlpha(0.1) : '#bbdefb';
}

export default class WorkSheetItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  svgColor(isActive) {
    const { iconColor, currentPcNaviStyle, themeType } = this.props.appPkg;
    const darkColor = currentPcNaviStyle === 1 && !['light'].includes(themeType);
    if (darkColor) {
      return `rgba(255, 255, 255, ${isActive ? 1 : 0.9})`;
    } else if (currentPcNaviStyle === 1) {
      return isActive || ['light'].includes(themeType) ? iconColor : '#757575';
    } else {
      return isActive ? iconColor : '#757575';
    }
  }
  textColor(isActive) {
    const { iconColor, currentPcNaviStyle, themeType } = this.props.appPkg;
    const darkColor = currentPcNaviStyle === 1 && !['light'].includes(themeType);
    return darkColor ? `rgba(255, 255, 255, ${isActive ? 1 : 0.9})` : isActive ? iconColor : undefined;
  }
  bgColor() {
    const { iconColor, currentPcNaviStyle, themeType } = this.props.appPkg;
    if (currentPcNaviStyle === 1 && !['light'].includes(themeType)) {
      return themeType === 'theme' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
    } else {
      return convertColor(iconColor);
    }
  }
  getNavigateUrl(isActive) {
    const { appId, groupId, activeSheetId, appItem } = this.props;
    const { workSheetId } = appItem;
    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
    const viewId =
      (_.find(storage.worksheets || [], item => item.groupId === groupId && item.worksheetId === workSheetId) || {})
        .viewId || '';
    let url = `/app/${appId}/${groupId}/${workSheetId}${viewId ? `/${viewId}` : ''}`;
    if (isActive) {
      url += `?flag=${this.state.flag || Date.now()}`;
    }
    return url;
  }
  render() {
    const {
      projectId,
      appId,
      groupId,
      appItem,
      activeSheetId,
      className,
      isCharge,
      appPkg,
      sheetListVisible,
      disableTooltip,
      indentationBrands=[],
    } = this.props;

    // const { sheetInfo, match, isCharge, appPkg, sheetListVisible, projectId, indentationBrands=[] } = this.props;
    // const { workSheetId, workSheetName, icon, iconUrl, status, type } = sheetInfo;
    // const { iconColor } = appPkg;
    // let { appId, groupId } = match.params;
    
    // if (md.global.Account.isPortal) {
    //   appId = md.global.Account.appId;
    // }

    const { workSheetId, workSheetName, icon, iconUrl, status, parentStatus, type, configuration = {}, urlTemplate } = appItem;
    const isActive = activeSheetId === workSheetId;
    const { iconColor, currentPcNaviStyle, themeType } = appPkg;
    const isNewOpen = configuration.openType == '2';
    const url = this.getNavigateUrl(isActive);
    const handleNewOpen = () => {
      const dataSource = transferValue(urlTemplate);
      const urlList = [];
      dataSource.map(o => {
        if (!!o.staticValue) {
          urlList.push(o.staticValue);
        } else {
          urlList.push(
            getEmbedValue(
              {
                projectId,
                appId,
                groupId,
                worksheetId: workSheetId,
              },
              o.cid,
            ),
          );
        }
      });
      window.open(urlList.join(''));
    }

    /**
     * ##修改## 
     * 针对菜单缩进
     */
    // const pLeft = icon === 'table' ? 'pLeft20' : 'pLeft40'
    const pLeft = indentationBrands.includes(workSheetName) ? 'pLeft40' : 'pLeft20'

    const Content = (
      <Fragment>
        <div className="iconWrap">
          <SvgIcon url={iconUrl} fill={this.svgColor(isActive)} size={22} />
        </div>
        <span
          className={cx('name ellipsis Font14 mLeft10 mRight10', { bold: isActive })}
          title={workSheetName}
          style={{ color: this.textColor(isActive) }}
        >
          {workSheetName}
        </span>
        {isNewOpen && (
          <Tooltip
            popupPlacement="bottom"
            text={<span>{_l('新页面打开')}</span>}
          >
            <Icon className="Font16 mRight10 mTop2 openIcon" icon="launch" />
          </Tooltip>
        )}
        {(status === 2 || parentStatus === 2) && (
          <Tooltip
            popupPlacement="right"
            text={<span>{_l('仅系统角色在导航中可见（包含管理员、运营者、开发者），应用项权限依然遵循角色权限原则')}</span>}
          >
            <Icon
              className="Font16 mRight10"
              icon="visibility_off"
              style={{ color: currentPcNaviStyle === 1 && themeType === 'theme' ? '#FCD8D3' : '#ee6f09' }}
            />
          </Tooltip>
        )}
      </Fragment>
    );
    return (
      <Drag appItem={appItem} appPkg={appPkg} isCharge={isCharge}>
        <Tooltip
          popupAlign={{ offset: [-10, 0] }}
          disable={_.isUndefined(disableTooltip) ? sheetListVisible : disableTooltip}
          popupPlacement="right"
          text={<span>{workSheetName}</span>}
        >
        {/* <MdLink className={`NoUnderline valignWrapper ${pLeft} ThemeColor10 h100 nameWrap`} to={this.getNavigateUrl(appId, groupId, workSheetId)}>
            <div className="iconWrap">
              <SvgIcon url={iconUrl} fill={iconColor} size={22} />
            </div>
            <span className="name ellipsis Font14 mLeft10 mRight10" title={workSheetName}>
              {workSheetName}
            </span>
            {status === 2 && (
              <Tooltip popupPlacement="bottom" text={<span>{_l('仅管理员可见')}</span>}>
                <Icon className="Font16 mRight10" icon={'visibility_off'} style={{ color: '#ee6f09' }} />
              </Tooltip>
            )}
            <div className="flex" />
          </MdLink>
          {isCharge && (
            <Trigger
              popupVisible={this.state.menuIsVisible}
              onPopupVisibleChange={menuIsVisible => {
                this.setState({ menuIsVisible });
              }}
              action={['click']}
              popup={this.renderMenu({ appId, groupId, type })}
              popupAlign={{ points: ['tl', 'bl'], offset: [1, 1], overflow: { adjustX: 1, adjustY: 2 } }}
            >
              <div className="rightArea">
                <i className="icon icon-more_horiz Font18 moreBtn" /> */}
          <Wrap
            style={{
              backgroundColor: isActive && this.bgColor(),
            }}
            iconColor={['black'].includes(appPkg.themeType) ? appPkg.iconColor : ''}
            className={cx('workSheetItem flexRow Relative', className, `workSheetItem-${workSheetId}`, {
              active: isActive,
            })}
            data-id={workSheetId}
          >
            {isNewOpen ? (
              <div className={`NoUnderline valignWrapper ${pLeft} h100 nameWrap`} onClick={handleNewOpen}>
                {Content}
              </div>
            ) : (
              <MdLink
                className={`NoUnderline valignWrapper ${pLeft} h100 nameWrap`}
                to={url}
                onClick={() => {
                  if (type == 0) {
                    //浏览工作表埋点
                    addBehaviorLog('worksheet', workSheetId);
                  }
                  if (type == 1) {
                    //浏览自定义页面埋点
                    addBehaviorLog('customPage', workSheetId);
                  }
                  this.setState({ flag: Date.now() });
                }}
              >
                {Content}
              </MdLink>
            )}
            {(canEditApp(_.get(appPkg, ['permissionType'])) || canEditData(_.get(appPkg, ['permissionType']))) && (
              <MoreOperation {...this.props}>
                <div className="rightArea moreBtn">
                  <Icon icon="more_horiz" className="Font18 moreIcon" />
                </div>
              </MoreOperation>
            )}
          </Wrap>
        </Tooltip>
      </Drag>
    );
  }
}
