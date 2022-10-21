import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
import styled from "styled-components";
import { Spin, Modal, Button } from "antd";
import { CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import CryptoJS from "crypto-js";
import axios from 'axios';
import { getRequest, setItem, getItem } from 'src/util';
import { removePssId } from 'src/util/pssId';

const request = getRequest();

const ConWrapper = styled.div`
  
  .content {
    margin: 0 auto;
    padding: 50px 80px;
    max-width: 750px;
    text-align: center;
  }

  .spin-wrap {
    margin-bottom: 20px;
  }
  .success-icon {
    margin-bottom: 20px;
    font-size: 42px;
    color: green;
  }
  .error-icon {
    margin-bottom: 20px;
    font-size: 42px;
    color: red;
  }
  .login-btn {
    margin-top: 30px;
  }
`;


export default function MsCallback() {
  const [currStatus,setCurrStatus] = useState('pending');
  const [modal, contextHander] = Modal.useModal();

  useEffect(() => {
    checkOOS();
  }, [])

  const showError = () => {
    modal.error({
      title: '登录账号异常',
      okText: '确定',
      onOk: () => {
        toLogin();
      }
    })
  }

  const toLogin = () => {
    location.href = '/network';
  }
  
  const setRelogin = () => {
    removePssId();
    window.localStorage.removeItem('sso-microsoft-user');
    window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
    window.localStorage.setItem('login-clear','1');
  }

  const checkOOS = async () => {
    const userData = checkGetUserInfo();
    if (!userData.success) {
      setCurrStatus('error');
      showError();
      setRelogin();
      return;
    }
    const user = userData.user || {};
    // if (!await checkUsername(user.username)) {
    //   setCurrStatus('error');
    //   showError();
    //   setRelogin();
    //   return;
    // }
    setItem('sso-microsoft-user',user);
    setCurrStatus('success');
    setTimeout(() => {
      window.localStorage.removeItem('login-clear');
      const returnUrl = '/app/31ec8d09-d39f-4683-8fb3-b60974963bf3/617b6bd0e318f32523a873e7'
      console.log(`/network?ReturnUrl=${encodeURIComponent(returnUrl)}`)
      location.href = `/network?ReturnUrl=${encodeURIComponent(returnUrl)}`; // 跳转到登录
    }, 1000);
  }

  const checkGetUserInfo = () => {
    const username = request.username;
    const name = request.name;
    const refer = request.refer;
    const oid = request.oid;
    const signature = request.signature;
    const signatureMd5 = CryptoJS.MD5(username + name + refer + oid).toString();
    return {
      success: signature === signatureMd5,
      user: {
        username,
        name,
        refer,
        oid,
        signature,
      }
    };
  }

  const checkUsername = async (username) => {
    try {
      const param = {
        "appKey": "80b065391c247505",
        "sign": "ZGFlODY5ODgxYjk2YmFkMjljZWI5MTA4ZjgzYmI3NWI5Zjk0ODY5ODI2NmFlMzY0MTU4Y2U1YWI4Nzk2MDU0Yg==",
        "worksheetId": "azure_ad_user",
        "viewId": "635120971d176488ea623ccf",
        "pageSize": 1,
        "pageIndex": 1,
        "filters": [
          {
            "controlId": "username",
            "dataType": 2,
            "spliceType": 1,
            "filterType": 2,
            "value": "andy.fu@meihua.info" // 回调地址带的username 
          },
          {
            "controlId": "status",
            "dataType": 9,
            "spliceType": 1,
            "filterType": 2,
            "value": "normal"
          }
        ]
      }
      const response = await axios({
        url: 'https://app.mohodata.com:443/api/v2/open/worksheet/getFilterRows',
        method: 'POST',
        data: param,
      });
      const res = response.data || {}
      const resData = res.data || {}
      if (res.success && resData.total > 0) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
      return false
    }
  }



  return (
     <ConWrapper>
      <div className="content">
        {currStatus === 'pending' && <div className="pending">
          <div className="spin-wrap">
            <Spin />
          </div>
          <h1>校验中...</h1>
        </div>}
        {currStatus === 'error' && <div className="error">
          <div className="error-icon"><CloseCircleFilled /></div>
          <h1>登录账号异常</h1>
          <div className="login-btn">
            <Button type="primary" onClick={toLogin}>重新登录</Button>
          </div>
        </div>}
        {currStatus === 'success' && <div className="success">
          <div className="success-icon"><CheckCircleFilled /></div>
          <h1>登录成功，正在跳转...</h1>
          <div className="login-btn">
            <Button type="primary" onClick={toLogin}>没反应？点击这里</Button>
          </div>
        </div>}
      </div>
      {contextHander}
    </ConWrapper>
  )
}

ReactDOM.render(<MsCallback />, document.querySelector('#app'));