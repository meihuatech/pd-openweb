import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { handleChangeOwner, updateRecordOwner } from '../crtl';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import _ from 'lodash';
export default function FormHeader(props) {
  const {
    isLock,
    recordbase,
    recordinfo,
    view = {},
    updateRecordDialogOwner,
    sheetSwitchPermit = {},
    viewId,
    maskinfo = {},
    from,
  } = props;
  const { isCharge, worksheetId, recordId, recordTitle, isSmall } = recordbase;
  const {
    allowEdit,
    projectId,
    ownerAccount = {},
    worksheetName,
    createTime,
    updateTime,
    createAccount = {},
    editAccount = {},
    formData,
    appId,
  } = recordinfo;
  const isPublicShare = _.get(window, 'shareState.isPublicRecord') || _.get(window, 'shareState.isPublicView');
  const { forceShowFullValue, maskPermissions, handleUnMask } = maskinfo;
  const ownerRef = useRef();
  const ownerControl = _.find(formData, c => c.controlId === 'ownerid');
  const showOwner =
    ownerControl &&
    !_.isEmpty(ownerAccount) &&
    !_.find(view.controls, controlId => controlId === 'ownerid') &&
    (controlState(ownerControl).visible || ownerControl.controlId === 'ownerid');
  const ownerEditable =
    ownerControl &&
    allowEdit &&
    ownerControl &&
    controlState(ownerControl).editable &&
    !isLock &&
    from !== RECORD_INFO_FROM.DRAFT &&
    !window.isPublicApp;
  let isOpenLogs = true;
  if (!isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId)) {
    isOpenLogs = false;
  }

  return (
    <div className={cx('recordInfoFormHeader Gray_9e', { isSmall })}>
      {!isPublicShare && (
        <div className="worksheetNameCon" style={{ marginTop: 16 }}>
          {!(window.isPublicApp || md.global.Account.isPortal) ? (
            <a className="worksheetName Gray_9e InlineBlock" target="_blank" href={`/worksheet/${worksheetId}`}>
              {worksheetName}
            </a>
          ) : (
            <span className="worksheetName Gray_9e InlineBlock">{worksheetName}</span>
          )}
          <div className="Right">
            {createTime && isOpenLogs && (
              <span className="lastLog InlineBlock Font12 Gray_9e">
                {createTime === updateTime ? createAccount.fullname : editAccount.fullname}
                {createTime === updateTime ? _l(' 创建于 ') : _l(' 更新于 ')}
                {createTimeSpan(createTime === updateTime ? createTime : updateTime)}
              </span>
            )}
            {showOwner && (
              <span className={cx('owner Font12 Gray_9e', { noBorder: !isOpenLogs })}>
                {_l('拥有者')}：
                <span
                  className={cx('ownerBlock', { disabled: !ownerEditable, Hand: ownerEditable })}
                  ref={ownerRef}
                  onClick={() => {
                    if (ownerEditable) {
                      handleChangeOwner({
                        recordId,
                        appId,
                        ownerAccountId: ownerAccount.accountId,
                        projectId,
                        target: ownerRef.current,
                        changeOwner: async (users, accountId) => {
                          try {
                            const { account, record } = await updateRecordOwner({
                              worksheetId,
                              recordId,
                              accountId:
                                accountId === 'user-self' ? _.get(md, ['global', 'Account', 'accountId']) : accountId,
                            });
                            updateRecordDialogOwner(account, record);
                            alert(_l('修改成功'));
                          } catch (err) {
                            alert(_l('修改失败'), 2);
                          }
                        },
                      });
                    }
                  }}
                >
                  <span className="InlineBlock">
                    <UserHead
                      className="cursorDefault"
                      size={24}
                      bindBusinessCard={
                        !_.includes(['user-workflow', 'user-publicform', 'user-api'], ownerAccount.accountId)
                      }
                      user={{
                        accountId: ownerAccount.accountId,
                        userHead: ownerAccount.avatar,
                      }}
                      headClick={() => {}}
                    />
                  </span>
                  <span className="Gray mLeft4">{ownerAccount.fullname}</span>
                  <i className="icon icon-arrow-down Hand Font12 Gray_75 mLeft4"></i>
                </span>
              </span>
            )}
          </div>
        </div>
      )}
      <div className="recordTitle flex">
        <span className={cx({ maskHoverTheme: maskPermissions })}>
          {recordTitle}
          {maskPermissions && (
            <i
              className="icon icon-eye_off Hand Font20 Gray_bd mLeft4"
              style={{ verticalAlign: 'middle' }}
              onClick={e => {
                if (!maskPermissions) return;
                e.stopPropagation();
                if (_.isFunction(handleUnMask)) {
                  handleUnMask();
                }
              }}
            ></i>
          )}
        </span>
      </div>
    </div>
  );
}

FormHeader.propTypes = {
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  view: PropTypes.shape({}),
  updateRecordDialogOwner: PropTypes.func,
};
