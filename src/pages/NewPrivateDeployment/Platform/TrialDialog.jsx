import React, { useState, useEffect } from 'react';
import { Dialog, Textarea, LoadDiv } from 'ming-ui';
import privateGuideApi from 'src/api/privateGuide';
import _ from 'lodash';

export default props => {
  const { visible, extendFunType, onCancel, onSave } = props;
  const [licenseCode, setLicenseCode] = useState('');
  const [verifyLicenseCode, setVerifyLicenseCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPrivateKey = () => {
    if (_.isEmpty(licenseCode)) {
      setPrompt(_l('请输入密钥'));
      setVerifyLicenseCode('');
      return;
    }
    if (loading) return;
    setLoading(true);
    setVerifyLicenseCode('');
    setPrompt('');
    privateGuideApi.bindTrialLicenseCode({
      extendFunType,
      licenseCode,
    }).then(result => {
      setVerifyLicenseCode(result);
      setLoading(false);
      if (result) {
        alert(_l('添加成功'));
        onSave(result);
        onCancel();
        setLicenseCode('');
        setVerifyLicenseCode('');
      }
    }).fail(error => {
      setLoading(false);
      setPrompt(error.errorMessage);
    });
  }

  return (
    <Dialog
      visible={visible}
      anim={false}
      title={_l('试用密钥')}
      width={560}
      onOk={handleAddPrivateKey}
      onCancel={onCancel}
    >
      <div className="mBottom10">
        <span className="Gray_75 Font13">{_l('请输入您的密钥')}</span>
      </div>
      <Textarea
        value={licenseCode}
        onChange={value => {
          setLicenseCode(value);
        }}
      />
      {
        loading ? (
          <div className="flexRow verifyInfo Gray_75 mBottom10">
            <LoadDiv className="mAll0 mRight5" size="small" />
            {_l('正在验证您的试用密钥')}
          </div>
        ) : (
          (_.isBoolean(verifyLicenseCode) && !verifyLicenseCode) && <div className="mBottom10 Red">{_l('密钥验证失败, 请重新填写')}</div>
        )
      }
      {prompt ? <div className="mBottom10 Red">{prompt}</div> : null}
    </Dialog>
  );
}