import React, { useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { getStrBytesLength } from 'src/pages/Role/PortalCon/tabCon/util-pure.js';
import { getStringBytes } from 'src/util';
import { Icon } from 'ming-ui';
import MailSettingsDialog from 'src/pages/Role/PortalCon/components/MailSettingsDialog';
import SMSSettingsDialog from 'src/pages/Role/PortalCon/components/SMSSettingsDialog';
import { getCurrentProject } from 'src/util';

const Wrap = styled.div`
  .warnTxt {
    background: #fdf9dc;
    border-radius: 3px;
    padding: 12px;
    margin-bottom: 24px;
  }
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
    .sign {
      width: 200px;
      height: 36px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      padding: 0 14px;
      &:hover {
        border: 1px solid #bdbdbd;
      }
      &:focus {
        border: 1px solid #2196f3;
      }
    }
  }
  textarea {
    margin-top: 10px;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    padding: 12px;
    border-radius: 3px;
    height: 90px;
    resize: none;
  }
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: none;
    border: 1px solid #2196f3;
  }
  .sysBtn {
    line-height: 34px;
    background: #f5f5f5;
    border-radius: 4px;
    color: #2196f3;
    padding: 0 12px;
    display: inline-block;
    cursor: pointer;
    margin-top: 14px;
    font-weight: 500;
    i {
      display: inline-block;
      vertical-align: middle;
    }
    &:hover {
      color: #2182f3 !important;
    }
  }
  .line {
    height: 0px;
    border: 1px solid #000000;
    opacity: 0.08;
  }
`;

let preSign = '';
export default function TextMessage(props) {
  let { projectId, onChangePortalSet } = props;
  const hasWarn = getCurrentProject(projectId).licenseType !== 1; //非付费版需要提示
  const [sign, setSign] = useState(''); //签名
  const [emailSignature, setEmailSignature] = useState('');
  const [portalSetModel, setPortalSetModel] = useState({});
  const [{ showEmailDialog, showTelDialog }, setState] = useSetState({
    showEmailDialog: false,
    showTelDialog: false,
  });
  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {} } = portalSet;
    setPortalSetModel(portalSetModel);
    setSign(portalSetModel.smsSignature);
    setEmailSignature(portalSetModel.emailSignature);
  }, [props]);

  return (
    <Wrap>
      <div className="content">
        {!md.global.Config.IsLocal && hasWarn && (
          <div className="warnTxt">
            {_l(
              '因为平台安全措施需要，自定义的短信签名和通知内容暂时只对付费组织生效。免费和试用组织只能按默认内容发送',
            )}
          </div>
        )}
        <h6 className="Font16 Gray Bold mBottom0">{_l('短信通知')}</h6>
        <div className="mTop6 Gray_9e">
          { md.global.Config.IsPlatformLocal ? _l(
            '注册开启审核后，审核结果(通过、拒绝)会短信告知注册用户；外部门户类型设为私有后再添加用户后也会发送邀请通知，支持对短信内容自定义；针对相应的短信会进行收费收费标准：短信0.05元/条，自动从企业账务中心扣费。70字计一条短信，超过70字以67字每条计费。每个标点、空格、英文字母都算一个字。短信实际发送可能有10-20分钟的延时。',
          ) : _l(
            '注册开启审核后，审核结果(通过、拒绝)会短信告知注册用户；外部门户类型设为私有后再添加用户后也会发送邀请通知，支持对短信内容自定义。',
          )}
        </div>
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('签名')}</h6>
        <div className="mTop6 Gray_9e">
          {_l(
            '请谨慎填写您的组织简称、网站名、品牌名，2-8个汉字。如签名不符合规范，将会被运营商拦截。此签名适用于外部门户的短信场景:外部门户用户注册登录、邀请外部用户注册、外部用户审核(通过/拒绝)',
          )}
        </div>
        <input
          type="text"
          className="sign mTop6"
          placeholder={_l('请输入签名')}
          value={sign}
          onFocus={() => {
            preSign = sign;
          }}
          onBlur={e => {
            if (!e.target.value.trim()) {
              setSign(preSign);
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  smsSignature: preSign,
                },
              });
              return alert(_l('请输入签名'), 3);
            }
            if (!/^[\u4E00-\u9FA5A-Za-z]+$/.test(e.target.value)) {
              return alert(_l('只支持中英文'), 3);
            }
            if (getStringBytes(e.target.value) > 16) {
              setSign(getStrBytesLength(e.target.value));
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  smsSignature: getStrBytesLength(e.target.value),
                },
              });
              return alert(_l('最多只能16个字节'), 3);
            }
          }}
          onChange={e => {
            setSign(e.target.value.trim());
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                smsSignature: getStrBytesLength(e.target.value.trim()),
              },
            });
          }}
        />
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('内容')}</h6>
        <div
          className="sysBtn flexRow alignItemsCenter"
          onClick={() => {
            setState({
              showTelDialog: true,
            });
          }}
        >
          <Icon icon="textsms1" className="Font18 mRight6" /> {_l('短信设置')}
        </div>
        <div className="line mTop24"></div>
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('邮件通知')}</h6>
        <div className="mTop6 Gray_9e">
          {md.global.Config.IsPlatformLocal ? _l(
            '注册开启审核后，审核结果(通过、拒绝)会邮件告知注册用户；外部门户类型设为私有后再添加用户后也会发送邀请通知，支持对邮件内容自定义；针对相应的邮件会进行收费收费标准：邮件0.03元/封，自动从企业账务中心扣费。',
          ) : _l(
            '注册开启审核后，审核结果(通过、拒绝)会邮件告知注册用户；外部门户类型设为私有后再添加用户后也会发送邀请通知，支持对邮件内容自定义。',
          )}
        </div>

        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('发件人名称')}</h6>
        <input
          type="text"
          className="sign mTop6"
          placeholder={_l('请输入发件人名称')}
          value={emailSignature}
          onFocus={() => {
            preSign = emailSignature;
          }}
          maxLength={'32'} //32个字符以内
          onBlur={e => {
            if (!e.target.value.trim()) {
              setEmailSignature(preSign);
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  emailSignature: preSign,
                },
              });
              return alert(_l('请输入发件人名称'), 3);
            }
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                emailSignature: e.target.value.trim(),
              },
            });
          }}
          onChange={e => {
            setEmailSignature(e.target.value);
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                emailSignature: e.target.value,
              },
            });
          }}
        />
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('内容')}</h6>
        <div
          className="sysBtn flexRow alignItemsCenter"
          onClick={() => {
            setState({
              showEmailDialog: true,
            });
          }}
        >
          <Icon icon="email" className="Font18 mRight6" style={{ marginTop: -3 }} /> {_l('邮件设置')}
        </div>
      </div>
      {showTelDialog && (
        <SMSSettingsDialog
          {...props}
          sign={sign}
          onCancel={() => {
            setState({
              showTelDialog: false,
            });
          }}
        />
      )}
      {showEmailDialog && (
        <MailSettingsDialog
          {...props}
          onCancel={() => {
            setState({
              showEmailDialog: false,
            });
          }}
        />
      )}
    </Wrap>
  );
}
