import { getSuffix } from 'src/pages/PortalAccount/util';
import api from 'src/api/homeApp';
import { browserIsMobile } from 'src/util';

export const compatibleWorksheetRoute = (worksheetId, rowId) => {
  //工作表老路由id补齐
  api.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId, workSheetId }) => {
    if (appId) {
      let url = '';
      if (rowId) {
        if (getSuffix(location.href) !== md.global.Account.addressSuffix) {
          url = `/app/${appId}/${workSheetId}/row/${rowId}`;
        } else {
          url = `/${md.global.Account.addressSuffix}/${workSheetId}/row/${rowId}`;
        }
      } else if (appSectionId) {
        if (getSuffix(location.href) !== md.global.Account.addressSuffix) {
          url = `/app/${appId}/${appSectionId}/${workSheetId}`;
        } else {
          url = `/${md.global.Account.addressSuffix}/${appSectionId}/${workSheetId}`;
        }
      }
      location.href = `${window.subPath || ''}${url}`;
    }
  });
};

export function formatPortalHref(props) {
  // 外部门户 并且应用id对应不上 自定义后缀也对应不上
  if (
    md.global.Account.isPortal &&
    ![md.global.Account.appId, md.global.Account.addressSuffix].includes(_.get(props, 'computedMatch.params.appId')) &&
    getSuffix(location.href) !== md.global.Account.addressSuffix
  ) {
    if (location.href.indexOf('worksheet/') >= 0 && _.get(props, 'computedMatch.params.worksheetId')) {
      compatibleWorksheetRoute(
        _.get(props, 'computedMatch.params.worksheetId'),
        _.get(props, 'computedMatch.params.rowId'),
      );
    } else {
      location.href = `${window.subPath || ''}/logout?ReturnUrl=${encodeURIComponent(location.href)}`;
    }
  }
  //h5打开外部门户自定义后缀地址访问 地址处理
  if (md.global.Account.isPortal && browserIsMobile() && getSuffix(location.href) === md.global.Account.addressSuffix) {
    let url = location.href;
    url = url.replace('/' + md.global.Account.addressSuffix, '/app/' + md.global.Account.appId);
    location.href = url;
  }
}
