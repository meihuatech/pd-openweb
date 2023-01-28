import { PUSH_TYPE } from '../WorkflowSettings/enum';
import sheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import _ from 'lodash';

const getWorksheetInfo = worksheetId => {
  return new Promise((resolve, reject) => {
    sheetAjax.getWorksheetInfo({ worksheetId }).then(result => {
      if (result.resultCode === 1) {
        resolve(result.appId);
      } else {
        resolve('');
      }
    });
  });
};

const getAppSimpleInfo = workSheetId => {
  return new Promise((resolve, reject) => {
    homeAppAjax.getAppSimpleInfo({ workSheetId }, { silent: true }).then(result => {
      resolve(result);
    });
  });
};

export default () => {
  md.global.Config.pushUniqueId = (+new Date()).toString();

  IM.socket.on('workflow_push', result => {
    const pushType = parseInt(Object.keys(result)[0]);
    const { pushUniqueId, appId: worksheetId, rowId, viewId, content, openMode } = result[pushType];

    if (pushUniqueId !== md.global.Config.pushUniqueId) {
      return;
    }

    if (pushType === PUSH_TYPE.ALERT) {
      alert(content);
    }

    if (pushType === PUSH_TYPE.CREATE) {
      addRecord({
        showContinueAdd: false,
        worksheetId: worksheetId,
        onAdd: data => {
          alert(data ? _l('添加成功') : _l('添加失败'));
        },
      });
    }

    if (pushType === PUSH_TYPE.DETAIL) {
      getWorksheetInfo(worksheetId).then(appId => {
        if (appId) {
          if (openMode === 2) {
            window.open(`/app/${appId}/${worksheetId}/${viewId || 'undefined'}/row/${rowId}`);
          } else {
            openRecordInfo({
              appId: appId,
              worksheetId: worksheetId,
              recordId: rowId,
              viewId,
            });
          }
        }
      });
    }

    if (_.includes([PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], pushType)) {
      getAppSimpleInfo(worksheetId).then(({ appId, appSectionId }) => {
        if (appId && appSectionId) {
          const url = `/app/${appId}/${appSectionId}/${worksheetId}/${viewId}`;

          if (openMode === 1) {
            location.href = url;
          } else {
            window.open(url);
          }
        }
      });
    }

    if (pushType === PUSH_TYPE.LINK) {
      if (openMode === 1) {
        location.href = content;
      } else if (openMode === 2) {
        window.open(content);
      } else {
        const iTop = (window.screen.availHeight - 660) / 2; // 获得窗口的垂直位置;
        const iLeft = (window.screen.availWidth - 800) / 2; // 获得窗口的水平位置;
        const options =
          'width=800,height=600,toolbar=no,menubar=no,location=no,status=no,top=' + iTop + ',left=' + iLeft;

        window.open(content, '_blank', options);
      }
    }
  });
};
