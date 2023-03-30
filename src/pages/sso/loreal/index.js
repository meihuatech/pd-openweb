import { ajax, login, browserIsMobile, getRequest, getCurrentTime, checkLogin, replenishRet, saveLog } from 'src/util/sso';

const lorealReferrer = 'https://data-report-cn.loreal.wans/index'
const toolReferrer = 'https://tool.mohodata.com'
const referrers = [lorealReferrer, toolReferrer]
// console.log('loreal referrer',document.referrer)

const { token, from } = getRequest();
// const token = 'E5/OJ/9mhD+pUeMV+i7TNR/8aK1dtu+fs0KkB4/dSUZiAMcvTYlLiFWSUxCoNmdfAItmZ2tazj6q78zuD1PJtFBWRhj863cVZz6Cx+FHOJrXtsxhV/mda4Go+iZQCsbDXWzMPdw5onhE9dZs2/9/D667xc/l7UDuIgmUo5uFrZk='

const rsaKey = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAKZvIfkdPN7xIzA/sFeIVEqzhfeQNWZbp5qshVjp/FmJf6z33cUJgznUNt9LDzuMKwEH5lMLefgk0W0yVehLc7NdtIq7uzwWjxkYLGmsITJD235/R+BnlL1olFbsnpUpTDrTs6joVrXyiviS75oILiZrDY1mABJ+dYgptrZnxAPdAgMBAAECgYAhEUGBukJm1Sg1pOHHcmm08dgzKK7DaIBzZcWUteCSdZQtbI3eYRZ2fehtEv+yyBWfPc+QPl58Y+xMMs0Iuz0AWs1XRNQkPLlsCrISPWFkbjinC2+ZGQgihFvHqgkxi+CWdxET4XLvyKhg7V648SBELwA//XqHaKe8Fr/JBsM9LQJBAOFt9g4Y9xwgTFoTQ9ceKPk48k5hvVYpX8AWwiNI7FL210RdzHgQTUkqNPKEj4TnXwBOC9gkS+0ZmGmvY4M0IIsCQQC9ARRPqwRgVxL3vaETPqaaanNqv1EKq9d3GPA7NhfHwy+zwXbcoL6WEXEn08RExYE5O/ooQyIknSLMjgrTfdI3AkBc4u5MCMVpdXWAeAewD+FaL7jHy0Y0xn+Jqtb7qwSVethgdzXVEwKFbzq54x0v6hYfDgmbWflfDPjcM0SRv1zZAkEAgqpIXHui3ufT2SpkPWXG0GJfwKDbakE7CL9Y9daDwjsSs3dAsW7/08fjLuGcgt74Y5UvcL5Y0G9CK6DXozcNKQJBAM7XWqvsgyDyorGGQ/fEnbVzPQItCt27mZo6OM1w5lAGbbhVKaT7QOSuCvZXyeXJ1dCRxZS4GZnijwyNkCAzSNI='

const referrerValue = getReferrerValue()
const fromSource = from || ''

function isReferrer() {
  const referrer = document.referrer
  return referrers.some(v => referrer.indexOf(v) >= 0)
}

function getReferrerValue() {
  const referrer = document.referrer
  if (referrer.indexOf(lorealReferrer) >= 0) {
    return 'lor'
  } else if (referrer.indexOf(toolReferrer) >= 0) {
    return 'tool'
  }
  return 'lor'
}

function decodeRsa() {
  $.ajax({
    url: 'https://hubapi.mohodata.com/tool/rsa/decrypt_by_private_key',
    type: 'POST',
    data: {
      private_key: rsaKey,
      text: decodeURIComponent(token),
    },
    // async: true,
    contentType: 'application/x-www-form-urlencoded',
    success: result => {
      console.log('result', result)
      if (result.success) {
        const resData = JSON.parse(result.data || '{}');
        // console.log('data',resData.username,resData)
        const saveInfo = {
          ...resData,
        }
        saveLog({
          email: resData.username,
          remark: '登录token 时间：' + resData.timestamp,
          refferr: resData.sourceFrom,
        })
        saveLocal(saveInfo)
      } else {
        alert('登录失败');
        setTimeout(() => {
          jumpReturn()
        }, 2000)
      }
    },
    error: function() {
      alert('解析错误，请稍后重试')
    },
  })
}

// function saveLoginLog(option) {
//   $.ajax({
//     url: 'https://app.mohodata.com/api/workflow/hooks/NjNlZjRjNmM4OThmY2UzMTAyYjEyZjk2',
//     type: 'GET',
//     data: {
//       type: 'Login',
//       ...option,
//     },
//     contentType: 'application/x-www-form-urlencoded',
//   }).done(res => {
//     console.log('log success', res)
//   }).fail(err => {
//     console.log('err', err)
//   })
// }

function saveLocal(saveInfo) {
  const expire = new Date()
  const sourceExpire = new Date()
  expire.setDate(expire.getDate() + 1)
  sourceExpire.setFullYear(sourceExpire.getFullYear() + 100)
  setCookie(md.staticglobal.CookieKeys.LOREAL_SSO, JSON.stringify(saveInfo), expire)
  setCookie(md.staticglobal.CookieKeys.LOREAL_SSO_SOURCE, referrerValue, sourceExpire)
  setCookie(md.staticglobal.CookieKeys.LOREAL_SSO_FROM, fromSource, sourceExpire)
  // localStorage.setItem(md.staticglobal.StorageKeys.LOREAL_SSO_INFO, JSON.stringify(saveInfo))
  setTimeout(() => {
    if (fromSource === 'retailers') {
      location.href = '/app/31ec8d09-d39f-4683-8fb3-b60974963bf3/63f57c4a9649172b3e2b7d57/63f57e499649172b3e2b7d58?from=insite'
    } else {
      location.href = '/app/31ec8d09-d39f-4683-8fb3-b60974963bf3/'
    }
  }, 100)
}

function jumpReturn() {
  if (referrerValue === 'tool') {
    location.href === md.staticglobal.SourceUrls.TOOL_SSO_URL
  } else {
    location.href = md.staticglobal.SourceUrls.LOREAL_SSO_URL
  }
}


if (!token) {
  alert('未找到TOKEN')
  setTimeout(() => {
    jumpReturn()
  }, 2000)
} else {
  decodeRsa()
}




// if (isReferrer() || location.href === 'http://localhost:30001/sso/loreal') {
//   const expire = new Date()
//   const sourceExpire = new Date()
//   expire.setDate(expire.getDate() + 1)
//   sourceExpire.setFullYear(sourceExpire.getFullYear() + 100)
//   setCookie(md.staticglobal.CookieKeys.LOREAL_SSO, '1', expire)
//   setCookie(md.staticglobal.CookieKeys.LOREAL_SSO_SOURCE, referrerValue, sourceExpire)
//   setTimeout(() => {
//     location.href = '/app/31ec8d09-d39f-4683-8fb3-b60974963bf3/'
//   }, 100)
// } else {
//   if (referrerValue === 'tool') {
//     location.href === md.staticglobal.SourceUrls.TOOL_SSO_URL
//   } else {
//     location.href = md.staticglobal.SourceUrls.LOREAL_SSO_URL
//   }
// }