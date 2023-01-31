

const referrers = ['https://data-report-cn.loreal.wans/index','https://tool.mohodata.com']
// console.log('loreal referrer',document.referrer)

function isReferrer() {
  const referrer = document.referrer
  return referrers.some(v => referrer.indexOf(v) >= 0)
}

if (isReferrer() || location.href === 'http://localhost:30001/sso/loreal') {
  const expire = new Date()
  expire.setDate(expire.getDate() + 1)
  setCookie(md.staticglobal.CookieKeys.LOREAL_SSO, '1', expire)
  setTimeout(() => {
    location.href = '/app/my'
  }, 100)
} else {
  // location.href = '/404'
  location.href = md.staticglobal.SourceUrls.LOREAL_SSO_URL
}