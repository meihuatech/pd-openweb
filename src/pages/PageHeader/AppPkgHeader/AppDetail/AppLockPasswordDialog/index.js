import React, { Component, Fragment, useState, createRef, useEffect } from 'react';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { Dialog, Switch, Tooltip, Button } from 'ming-ui';
import { Input } from 'antd';
import ClipboardButton from 'react-clipboard.js';
import RegExp from 'src/util/expression';
import appManagementAjax from 'src/api/appManagement';
import { getRandomString, verifyPassword } from 'src/util';
import captcha from 'src/components/captcha';
import styled from 'styled-components';
import cx from 'classnames';

const PasswordInputBox = styled.div`
  display: flex;
  margin-top: 22px;
  margin-bottom: 20px;
  line-height: 34px;
  box-sizing: border-box;
  font-size: 12px;
  border-radius: 2px;
  .inputBox {
    border: none;
    background: #f5f5f5;
    padding-left: 16px;
    width: 166px;
    height: 36px;
    margin-right: 16px;
    &.editInput {
      background: #fff;
      border: 1px solid #2196f3;
    }
  }
  .icon-edit,
  .icon-content-copy {
    &:hover {
      color: #2196f3 !important;
    }
  }
  .error {
    font-size: 12px;
    color: #f44336;
  }
`;

const UnLockFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
`;

const checkPassword = password => {
  if (!password) {
    alert(_l('请输入密码'), 3);
    return true;
  }
  if (password.length < 8 || password.length > 20) {
    alert(_l('请输入8~20个字'), 3);
    return true;
  }
  if (!RegExp.isPasswordRule(password, /^[0-9A-Za-z]{8,20}$/)) {
    alert(_l('请输入字母数字'), 3);
    return true;
  }

  return false;
};

const RESULT_OBJ = {
  0: _l('设置失败'),
  1: _l('设置成功'),
  2: _l('密码错误'),
  3: _l('非应用拥有者'),
  4: _l('应用已锁定'),
  5: _l('当前应用无需解锁'),
  6: _l('应用类型不正确'),
  7: _l('您输入的新密码与旧密码一样'),
};

const ACTION_TEXT = {
  editLockPassword: _l('密码修改成功，需重新解锁'),
  resetLock: _l('您在应用下的操作权限已恢复锁定'),
  unlock: _l('您在应用下的操作权限已解锁'),
  addLock: _l('应用已开启锁定'),
  closeLock: _l('应用已关闭锁定'),
};

const actionFeedback = (msg, { onCancel, refreshPage }) => {
  onCancel();

  alert({
    msg,
    timeout: 1000,
    callback: refreshPage,
  });
};

const handleRequest = (requestName, requestParams, props) => {
  appManagementAjax[requestName](requestParams).then(res => {
    if (res === 1) {
      actionFeedback(ACTION_TEXT[requestName], props);
    } else {
      alert(RESULT_OBJ[res], _.includes([2, 3, 4, 5, 6, 7, 8], res) ? 3 : 2);
    }
  });
};

// 图形验证
const graphicVertify = (callback = () => {}) => {
  let cb = function(res) {
    if (res.ret !== 0) {
      return;
    }
    callback();
  };
  if (md.staticglobal.getCaptchaType() === 1) {
    new captcha(cb);
  } else {
    new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), cb).show();
  }
};

function VerifyUsePassword(props) {
  const { userPassword, setPassword = () => {}, isAutoFocus } = props;
  const passwordInput = createRef();

  useEffect(() => {
    if (isAutoFocus && passwordInput) {
      passwordInput.current.focus();
    }
  }, []);

  return (
    <Fragment>
      <div className="Fotn14 mBottom12" style={{ color: '#202328' }}>
        {_l('当前用户登录密码')}
      </div>
      <Input.Password
        className="boderRadAll_3"
        ref={passwordInput}
        autocomplete="new-password"
        placeholder={_l('请输入密码确认授权')}
        value={userPassword}
        onChange={e => setPassword(e.target.value)}
      />
    </Fragment>
  );
}

// 锁定应用（开启应用锁）
function LockApp(props) {
  const { visible, onCancel = () => {}, appId } = props;
  const passwordInputRef = createRef();
  const [isAddLock, setIsAddLock] = useState(false);
  const [canEdit, sstCanEdit] = useState(false);
  const [userPassword, setUserPassword] = useState('');
  const [password, setPassword] = useState(
    getRandomString(16, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'),
  );
  const inputExtra = canEdit ? {} : { readonly: 'readonly' };

  return (
    <Dialog
      width={670}
      visible={visible}
      title={<div className="Black Font17">{_l('锁定应用')}</div>}
      okText={_l('确定')}
      okDisabled={!isAddLock}
      onCancel={onCancel}
      onOk={() => {
        if (checkPassword(password)) {
          return;
        }
        if (!userPassword.trim()) {
          alert(_l('请输入用户登录密码'), 3);
          return;
        }

        verifyPassword({
          password: userPassword,
          success: () => {
            handleRequest('addLock', { appId, password }, props);
          },
        });
      }}
    >
      <div className="Font14 Gray_9e mBottom24">
        {_l(
          '应用锁定状态下所有用户（包括管理员）不能查看、修改应用的配置，用户验证密码后可解锁其在应用下的操作权限。锁定应用需验证身份。',
        )}
      </div>
      <Switch checked={isAddLock} onClick={checked => setIsAddLock(!checked)} />
      <span className="mLeft10 Font14 TxtMiddle">{!isAddLock ? _l('未开启') : _l('已开启')}</span>
      {isAddLock && (
        <Fragment>
          <PasswordInputBox>
            <div className="flexColumn">
              <input
                type="text"
                className={cx('inputBox', { editInput: canEdit })}
                value={password}
                ref={passwordInputRef}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => {
                  sstCanEdit(false);
                  checkPassword(password);
                }}
                {...inputExtra}
              />
            </div>
            <Tooltip text={<span>{_l('编辑')}</span>} popupPlacement="bottom">
              <span
                className="icon-edit Gray_9e Hand LineHeight36"
                onClick={() => {
                  sstCanEdit(true);
                  passwordInputRef.current.focus();
                }}
              />
            </Tooltip>
            <Tooltip offset={[5, 0]} text={<span>{_l('复制')}</span>} popupPlacement="bottom">
              <ClipboardButton
                className="adminHoverColor Hand Gray_9e"
                component="span"
                data-clipboard-text={password}
                onSuccess={() => alert(_l('复制成功'))}
              >
                <span className="icon-content-copy mLeft15 Hand" />
              </ClipboardButton>
            </Tooltip>
            <span className="Gray_9e mLeft15">
              {_l('请妥善复制密码进行保存，如果忘记密码只可通过关闭锁进行重新设置')}
            </span>
          </PasswordInputBox>
          <VerifyUsePassword setPassword={val => setUserPassword(val)} userPassword={userPassword} />
        </Fragment>
      )}
    </Dialog>
  );
}
// 解锁应用
class UnLockDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    if (this.passwordInput) {
      this.passwordInput.focus();
    }
  }

  // 解锁应用
  handleUnlock = () => {
    const { appId, isLock } = this.props;
    const { lockPassword } = this.state;
    // 恢复锁定
    if (!isLock) {
      handleRequest('resetLock', { appId }, this.props);
      return;
    }
    if (checkPassword(lockPassword)) return;

    graphicVertify(() => handleRequest('unlock', { appId, password: lockPassword }, this.props));
  };

  render() {
    const { visible, onCancel = () => {}, sourceType, isOwner, appId, isPassword, isLock } = this.props;
    const { lockPassword } = this.state;
    const isNormalApp = sourceType === 1;

    return (
      <Fragment>
        <Dialog
          width={640}
          visible={visible}
          anim={false}
          title={<div className="Black Font17">{isLock ? _l('解锁应用') : _l('恢复锁定')}</div>}
          okText={!isLock ? _l('恢复锁定') : _l('确定')}
          onCancel={onCancel}
          footer={
            <UnLockFooter>
              <div className="ThemeColor Font14">
                {isOwner && isPassword && (
                  <span
                    className="Hand"
                    onClick={() => {
                      modifyAppLockPassword({ appId, refreshPage: this.props.refreshPage });
                      onCancel();
                    }}
                  >
                    {_l('修改应用锁密码')}
                  </span>
                )}
                {isNormalApp && isOwner && (isLock || isPassword) && (
                  <span
                    className="Hand mLeft24"
                    onClick={() => {
                      closeLockFunc({ appId, refreshPage: this.props.refreshPage });
                      onCancel();
                    }}
                  >
                    {_l('关闭应用锁定')}
                  </span>
                )}
              </div>
              <div className="btns">
                <Button type="link" onClick={onCancel}>
                  {_l('取消')}
                </Button>
                <Button type="primary" onClick={this.handleUnlock}>
                  {_l('确定')}
                </Button>
              </div>
            </UnLockFooter>
          }
        >
          {isLock ? (
            <Fragment>
              <div className="Gray_9e Font14 mBottom25">
                {_l('当前应用为不可配置状态，验证应用锁密码后将会解锁您在该应用下的相关操作权限')}
              </div>
              <Input.Password
                ref={input => (this.passwordInput = input)}
                className="mBottom16"
                placeholder={_l('请输入应用锁密码')}
                autoComplete="new-password"
                value={lockPassword}
                onChange={e => this.setState({ lockPassword: e.target.value.trim() })}
              />
            </Fragment>
          ) : (
            <div className="Gray_9e Font14">
              {_l('您在当前应用下的相关权限已解锁。操作恢复锁定，将重新锁定您在当前应用下的权限。')}
            </div>
          )}
        </Dialog>
      </Fragment>
    );
  }
}
// 修改应用锁密码
function AppLockPasswordDialog(props) {
  const { visible, appId, onCancel = () => {} } = props;
  const [originPassword, setOriginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const passwordInput = createRef();

  useEffect(() => {
    if (passwordInput) {
      passwordInput.current.focus();
    }
  }, []);

  // 修改密码
  const confirmModifyPassword = (originPassword, newPassword) => {
    if (!originPassword) return alert(_l('请输入旧密码'), 3);
    if (checkPassword(newPassword)) return;
    if (_.trim(originPassword) === _.trim(newPassword)) {
      return alert(_l('您输入的新密码与旧密码一样'), 3);
    }

    graphicVertify(() => handleRequest('editLockPassword', { newPassword, password: originPassword, appId }, props));
  };

  return (
    <Dialog
      width={480}
      visible={visible}
      title={<div className="Black Font17">{_l('修改应用锁密码')}</div>}
      okText={_l('确定')}
      onCancel={onCancel}
      onOk={() => confirmModifyPassword(originPassword, newPassword)}
    >
      <div className="Gray Font14 mBottom15">{_l('旧密码')}</div>
      <Input.Password
        ref={passwordInput}
        placeholder={_l('旧密码')}
        autoComplete="new-password"
        value={originPassword}
        onChange={e => setOriginPassword(e.target.value.trim())}
      />
      <div className="Gray Font14 mBottom15 mTop50">{_l('新密码')}</div>
      <Input.Password
        placeholder={_l('新密码')}
        autoComplete="new-password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value.trim())}
      />
    </Dialog>
  );
}
// 关闭应用锁定
function CloseLock(props) {
  const { visible, onCancel = () => {}, appId } = props;
  const [userPassword, setUserPassword] = useState('');

  return (
    <Dialog
      width={640}
      visible={visible}
      title={<div className="Black Font17">{_l('关闭应用锁定')}</div>}
      okText={_l('确定')}
      onCancel={onCancel}
      onOk={() => {
        if (!userPassword.trim()) {
          alert(_l('请输入用户登录密码'), 3);
          return;
        }

        verifyPassword({
          password: userPassword,
          success: () => {
            handleRequest('closeLock', { appId }, props);
          },
        });
      }}
    >
      <div className="Gray_9e Font14 mBottom16">{_l('关闭后将不再对应用进行锁定。关闭应用锁定，需验证您的身份。')}</div>
      <VerifyUsePassword isAutoFocus={true} userPassword={userPassword} setPassword={val => setUserPassword(val)} />
    </Dialog>
  );
}
const closeLockFunc = props => functionWrap(CloseLock, { ...props });
const modifyAppLockPassword = props => functionWrap(AppLockPasswordDialog, { ...props });
export const lockAppFunc = props => functionWrap(LockApp, { ...props });
export const unlockAppLockPassword = props => functionWrap(UnLockDialog, { ...props });
