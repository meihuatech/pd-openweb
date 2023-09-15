import React, { Component, Fragment, useState, useEffect } from 'react';
import SvgIcon from 'src/components/SvgIcon';
import { Icon, MdLink, Tooltip } from 'ming-ui';
import cx from 'classnames';
import { convertColor } from '../WorkSheetLeft/WorkSheetItem';
import MoreOperation from '../WorkSheetLeft/MoreOperation';
import Drag from '../WorkSheetLeft/Drag';
import { canEditData, canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getEmbedValue } from 'src/components/newCustomFields/tools/utils.js';

const AppItem = props => {
  const { appItem, appPkg, projectId, appId, groupId, isCharge } = props;
  const { iconColor } = appPkg;
  const { workSheetId, iconUrl, status, parentStatus, configuration = {}, urlTemplate } = appItem;
  const isNewOpen = configuration.openType == '2';
  const getNavigateUrl = () => {
    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
    const viewId =
      (_.find(storage.worksheets || [], item => item.groupId === groupId && item.worksheetId === workSheetId) || {})
        .viewId || '';
    let url = `/app/${appId}/${groupId}/${workSheetId}${viewId ? `/${viewId}` : ''}`;
    return url;
  };
  const url = getNavigateUrl();
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
  const Content = (
    <Fragment>
      <div
        className="flex flexRow alignItemsCenter justifyContentCenter"
        style={{ backgroundColor: convertColor(iconColor) }}
      >
        <SvgIcon url={iconUrl} fill={iconColor} size={44} />
      </div>
      <div className="nameWrap flexRow alignItemsCenter justifyContentCenter">
        <span className="Gray">{appItem.workSheetName}</span>
      </div>
    </Fragment>
  );
  return (
    <Drag appItem={appItem} appPkg={appPkg} isCharge={isCharge}>
      <div className={cx('appItemWrap pointer', `workSheetItem-${workSheetId}`)}>
        {isNewOpen ? (
          <div className="flexColumn h100" onClick={handleNewOpen}>{Content}</div>
        ) : (
          <MdLink className="flexColumn h100" to={url}>{Content}</MdLink>
        )}
        {(canEditApp(_.get(appPkg, ['permissionType'])) ||
          canEditData(_.get(appPkg, ['permissionType']))) && (
          <MoreOperation {...props}>
            <div className="moreIcon">
              <Icon icon="more_horiz" className="Font18 Gray_9e" />
            </div>
          </MoreOperation>
        )}
        {(status === 2 || parentStatus === 2) && (
          <Tooltip popupPlacement="bottom" text={<span>{_l('仅系统角色可见（包含管理员、运营者、开发者）')}</span>}>
            <Icon className="Font16 mRight10 visibilityIcon" icon="visibility_off" style={{ color: '#ee6f09' }} />
          </Tooltip>
        )}
      </div>
    </Drag>
  );
};

export default AppItem;
