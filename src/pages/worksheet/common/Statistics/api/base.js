export const controllerName = 'Worksheet';

export default {
  // server: () => 'http://172.16.1.191:8086',
  server: () => md.global.Config.WsReportUrl,
  // server: () => 'https://lorealfinance.mohodata.com',
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
  },
};
