import { ajax, login, browserIsMobile, getRequest, checkLogin } from 'src/util/sso';
import { setPssId } from 'src/util/pssId';
import _ from 'lodash';

const { code, p, i, s, ret, source, url, state } = getRequest();
const isMobile = browserIsMobile();

if (source === 'wxwork') {
  if (checkLogin()) {
    if (url) {
      location.href = decodeURIComponent(url);
    } else {
      location.href = isMobile ? `/mobile` : `/app`;
    }
  } else {
    ajax.post({
      url: __api_server__.main + 'Login/WorkWeiXinH5Login',
      data: {
        code,
      },
      async: true,
      succees: result => {
        const { accountResult, sessionId } = result.data;
        if (accountResult === 1) {
          setPssId(sessionId);
          if (url) {
            location.href = decodeURIComponent(url);
          } else {
            location.href = isMobile ? `/mobile` : `/app`;
          }
        }
      },
      error: login,
    });
  }
} else {
  if (checkLogin()) {
    if (ret) {
      location.href = ret;
    } else {
      location.href = isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
    }
  } else {
    ajax.post({
      url: __api_server__.main + 'Login/WorkWeiXinAppLogin',
      data: {
        code,
        state,
        apkId: i,
        secretId: s,
      },
      async: true,
      succees: result => {
        const { accountResult, sessionId } = result.data;
        if (accountResult === 1) {
          setPssId(sessionId);
          if (ret) {
            location.href = ret;
          } else {
            location.href = isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
          }
        } else {
          alert('登录失败');
          login();
        }
      },
      error: login,
    });
  }
}
