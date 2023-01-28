import React, { useState, Fragment } from 'react';
import { Dialog } from 'ming-ui';
import { Checkbox, Switch } from 'antd';
import '../less/manageBackupFilesDialog.less';
import { syncAppDetail } from 'src/pages/PageHeader/redux/action';
import { connect } from 'react-redux';
import cx from 'classnames';
import PasswordValidate from './PasswordValidate';
import moment from 'moment';

function RestoreAppDialog(props) {
  const {
    visible,
    changeRestoreAppVisible = () => {},
    fixed,
    appId,
    projectId,
    appPkg,
    onChangeStatus = () => {},
    actCurrentFileInfo = {},
    token = '',
    getList = () => {},
    currentValid,
    validLimit,
  } = props;
  const [isEndFixed, setIsEndFixed] = useState(false);
  const [isBackupCurrentVersion, setIsBackupCurrentVersion] = useState(false);
  const [showInputPassword, setShowInputPassword] = useState(false);

  // 改变应用维护状态
  const changeFixedStatus = checked => {
    if (checked) {
      props.onChangeFixStatus(true);
    }
    onChangeStatus({ fixed: checked })
  };

  const onOk = () => {
    if (isEndFixed) {
      onChangeStatus({ fixed: false });
    }
    changeRestoreAppVisible();
    setShowInputPassword(true);
  };

  return (
    <Fragment>
      <Dialog
        visible={visible}
        title={_l('还原应用')}
        className="restoreAppDialog"
        overlayClosable={false}
        onCancel={() => {
          setIsEndFixed(false);
          setIsBackupCurrentVersion(false);
          changeRestoreAppVisible();
        }}
        footer={
          <div className="backupRestoreDialogFooter">
            <span className=" cancelBtn" onClick={changeRestoreAppVisible}>
              {_l('取消')}
            </span>
            <span className={cx('disabledConfirmBtn', { confirmBtn: fixed })} onClick={fixed ? onOk : () => {}}>
              {_l('确定')}
            </span>
          </div>
        }
      >
        <div className="tipsInfo Gray_75">
          {_l('将应用还原到“%0”备份的版本，意味着', actCurrentFileInfo.backupFileName)}
          <span className="bold600 Gray">
            {_l(
              '在%0之后所有配置相关的更改都将丢失，',
              moment(actCurrentFileInfo.operationDateTime).format('YYYY-MM-DD HH:mm:ss'),
            )}
          </span>
          {_l('建议在还原之前先将当前版本进行备份，还原前请先打开应用维护状态。')}
        </div>
        <div className="fixStatus">
          <Switch checked={fixed} size="small" onChange={changeFixedStatus} />
          <span className="Gray mLeft10">{_l('应用维护状态')}</span>
        </div>
        <div className="isEndFixed">
          <Checkbox
            checked={isEndFixed}
            onChange={e => {
              let checked = e.target.checked;
              setIsEndFixed(checked);
            }}
          >
            {_l('还原成功后自动结束维护状态')}
          </Checkbox>
        </div>
        <div className="isBackupCurrentVersion">
          <Checkbox
            checked={isBackupCurrentVersion}
            disabled={currentValid >= validLimit}
            onChange={e => {
              let checked = e.target.checked;
              setIsBackupCurrentVersion(checked);
            }}
          >
            {_l('还原时同时备份当前版本')}
          </Checkbox>
          {currentValid >= validLimit && <span>{_l('（已有10个备份文件，不能进行备份）')}</span>}
        </div>
      </Dialog>
      <PasswordValidate
        projectId={projectId}
        appId={appId}
        actCurrentFileInfo={actCurrentFileInfo}
        isEndFixed={isEndFixed}
        isBackupCurrentVersion={isBackupCurrentVersion}
        token={token}
        getList={getList}
        setShowInputPassword={setShowInputPassword}
        showInputPassword={showInputPassword}
        setIsEndFixed={setIsEndFixed}
        setIsBackupCurrentVersion={setIsBackupCurrentVersion}
        getBackupCount={props.getBackupCount}
      />
    </Fragment>
  );
}

export default connect(
  state => {
    const { appPkg } = state;
    return { appPkg };
  },
  dispatch => ({ syncAppDetail: detail => dispatch(syncAppDetail(detail)) }),
)(RestoreAppDialog);
