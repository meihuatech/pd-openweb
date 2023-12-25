import {
  ajax,
  login,
  browserIsMobile,
  getRequest,
  checkLogin,
  isBefore,
  replenishRet,
  formatOtherParam,
  addOtherParam,
} from 'src/util/sso';
import { setPssId } from 'src/util/pssId';
import preall from 'src/common/preall';

const { t, i, ret, url, code, p, pc_slide = '', ...otherParam } = getRequest();
const isPcSlide = pc_slide.includes('true');
const isMobile = browserIsMobile();
const otherParamString = formatOtherParam(otherParam);
const newRet = addOtherParam(ret, otherParamString);

function start() {
  if (t == '-1') {
    // 小程序
    if (checkLogin()) {
      if (url) {
        location.href = decodeURIComponent(url);
      } else {
        location.href = isMobile ? `/mobile` : `/app`;
      }
    } else {
      ajax.post({
        url: __api_server__.main + 'Login/WorkWeiXinMiniProgramLogin',
        data: {
          code,
        },
        async: true,
        withCredentials: false,
        succees: result => {
          const { accountResult, sessionId } = result.data;
          if (accountResult === 1) {
            preall({ type: 'function' });
            setPssId(sessionId);
            if (url) {
              location.href = decodeURIComponent(url);
            } else {
              location.href = isMobile ? `/mobile` : `/app`;
            }
          } else {
            window.nativeAlert('登录失败');
            login();
          }
        },
        error: login,
      });
    }
  } else if (t == '1') {
    if (checkLogin()) {
      if (newRet) {
        location.href = newRet;
      } else {
        location.href = isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
      }
    } else {
      // 企业微信
      ajax.post({
        url: __api_server__.main + 'Login/GetWorkWeiXinCorpInfo',
        data: {
          apkId: i,
        },
        async: true,
        succees: result => {
          const { corpId, state } = result.data;
          const redirect_uri = encodeURIComponent(`${location.origin}/sso/workweixin?ret=${newRet || ''}&i=${i || ''}`);
          location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirect_uri}&state=${state}&response_type=code&scope=snsapi_base#wechat_redirect`;
        },
        error: login,
      });
    }
  } else {
    const expDate = localStorage.getItem('md_pss_id_exp');

    if (checkLogin()) {
      // expDate && checkLogin() && isBefore(expDate)
      if (newRet) {
        location.href = `/${replenishRet(newRet, pc_slide)}`;
      } else {
        if (i) {
          location.href = isMobile || isPcSlide ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
        } else {
          location.href = isMobile || isPcSlide ? `/mobile/appHome` : `/app/my`;
        }
      }
    } else {
      const hosts = location.host.split('.');
      const projectId = p || hosts[0];
      function onFail(err) {
        window.nativeAlert(JSON.stringify(err));
      }
      // if (!dd.ios && !dd.android && !dd.pc) {
      //   window.nativeAlert('请在钉钉客户端内打开');
      //   location.href = 'https://www.mingdao.com';
      // }

      // 钉钉
      ajax.post({
        url: __api_server__.main + 'Login/GetDingDingCorpInfo',
        data: {
          projectId,
        },
        async: true,
        succees: result => {
          const { corpId, state, clientWorkingPattern } = result.data;
          if (corpId) {
            dd.ready(function() {
              dd.runtime.permission.requestAuthCode({
                corpId: corpId,
                onSuccess: function(result) {
                  const { code } = result;
                  const dingdingLoginUrl = `/sso/dingding?state=${state}&ret=${encodeURIComponent(
                    newRet || '',
                  )}&i=${i || ''}&code=${code}&pc_slide=${pc_slide}`;
                  if (dd.pc && !isPcSlide) {
                    if (clientWorkingPattern === 1) {
                      document.body.innerText = '已在默认浏览器打开';
                      window.open(dingdingLoginUrl);
                    } else {
                      window.location = dingdingLoginUrl;
                    }
                  } else {
                    window.location = dingdingLoginUrl;
                  }
                },
                onFail: onFail,
              });
            });
            dd.error(function(error) {
              onFail(error);
            });
          }
        },
        error: login,
      });
    }
  }
}

start();
