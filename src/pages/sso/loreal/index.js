
const lorealReferrer = 'https://data-report-cn.loreal.wans/index'
const toolReferrer = 'https://tool.mohodata.com'
const referrers = [lorealReferrer, toolReferrer]
// console.log('loreal referrer',document.referrer)

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

const referrerValue = getReferrerValue()

if (isReferrer() || location.href === 'http://localhost:30001/sso/loreal') {
  const expire = new Date()
  const sourceExpire = new Date()
  expire.setDate(expire.getDate() + 1)
  sourceExpire.setFullYear(sourceExpire.getFullYear() + 100)
  setCookie(md.staticglobal.CookieKeys.LOREAL_SSO, '1', expire)
  setCookie(md.staticglobal.CookieKeys.LOREAL_SSO_SOURCE, referrerValue, sourceExpire)
  setTimeout(() => {
    location.href = '/app/31ec8d09-d39f-4683-8fb3-b60974963bf3/'
  }, 100)
} else {
  if (referrerValue === 'tool') {
    location.href === md.staticglobal.SourceUrls.TOOL_SSO_URL
  } else {
    location.href = md.staticglobal.SourceUrls.LOREAL_SSO_URL
  }
}