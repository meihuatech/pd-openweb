import { browserIsMobile } from 'src/util';
import render from '../shareMobile';
import renderPc from '../entrypoints/sharePc';

require.ensure([], require => {
  if (browserIsMobile() || location.href.indexOf('kcsharelocal') > -1) {
    render();
  } else {
    renderPc();
  }
});
