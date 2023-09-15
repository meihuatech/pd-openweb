export const seachdateList = [
  { value: 0, label: _l('今天') },
  { value: 1, label: _l('昨天') },
  { value: 2, label: _l('本周') },
  { value: 3, label: _l('上周') },
  { value: 4, label: _l('本月') },
  { value: 5, label: _l('上月') },
  { value: 6, label: _l('最近7天') },
  { value: 7, label: _l('最近30天') },
  { value: 8, label: _l('半年') },
];

export const TAB_LIST = [
  { tab: 0, tabName: _l('全部') },
  { tab: 1, tabName: _l('应用管理') },
  { tab: 2, tabName: _l('记录操作') },
  { tab: 3, tabName: _l('用户行为') },
];

export const MODULE_LIST = [
  { value: 1, label: _l('应用') },
  { value: 2, label: _l('工作表') },
  { value: 7, label: _l('自定义页面') },
  { value: 3, label: _l('工作流') },
  { value: 4, label: _l('用户') },
  // { value: 5, label: _l('统计图表') },
  // { value: 6, label: _l('外部门户') },
  { value: 8, label: _l('工作表记录') },
];

export const OPERATE_LIST = [
  { value: 1, label: _l('创建') },
  { value: 2, label: _l('删除') },
  { value: 3, label: _l('更新') },
  { value: 7, label: _l('还原') },
  { value: 4, label: _l('浏览') },
  // { value: 5, label: _l('分享') },
  { value: 6, label: _l('导出') },
  { value: 14, label: _l('批量创建') },
  { value: 8, label: _l('批量删除') },
  { value: 9, label: _l('批量更新') },
  { value: 10, label: _l('打印') },
  { value: 11, label: _l('自定义动作') },
  { value: 12, label: _l('附件下载') },
  // { value: 13, label: _l('附件预览') },
];

export const LOGIN_LOG_COLUMNS = [
  {
    title: _l('用户'),
    dataIndex: 'accountId',
    fixed: 'left',
    disabled: true,
  },
  {
    title: _l('登录/登出时间'),
    dataIndex: 'date',
    width: 200,
  },
  {
    title: _l('登录方式'),
    dataIndex: 'loginVenue',
  },
  {
    title: _l('登录类型'),
    dataIndex: 'loginType',
  },
  {
    title: 'IP',
    dataIndex: 'ip',
  },
  {
    title: _l('IP归属地'),
    dataIndex: 'geoCity',
  },
  {
    title: _l('浏览器'),
    dataIndex: 'browserName',
  },
  {
    title: _l('浏览器版本'),
    dataIndex: 'browserVersion',
  },
  {
    title: _l('操作系统类型'),
    dataIndex: 'systemInfo',
  },
  {
    title: _l('操作系统版本'),
    dataIndex: 'systemVersion',
  },
  {
    title: _l('经纬度'),
    dataIndex: 'latitudeAndLongitude',
  },
  {
    title: _l('设备类型'),
    dataIndex: 'platform',
  },
  {
    title: _l('设备型号'),
    dataIndex: 'deviceModel',
  },
  {
    title: _l('设备ID'),
    dataIndex: 'deviceId',
  },
  // {
  //   title: _l('IMEI'),
  //   dataIndex: 'imei',
  // },
];

export const APP_WORKSHEET_LOG_COLUMNS = [
  {
    title: _l('用户'),
    dataIndex: 'accountId',
    disabled: true,
    fixed: 'left',
  },
  {
    title: _l('应用名称'),
    dataIndex: 'appId',
  },
  {
    title: _l('应用项'),
    dataIndex: 'worksheetId',
  },
  {
    title: _l('操作内容'),
    dataIndex: 'opeartContent',
    width: 400,
  },
  {
    title: _l('操作对象'),
    dataIndex: 'module',
    width: 120,
  },
  {
    title: _l('操作类型'),
    dataIndex: 'operationType',
    width: 120,
  },
  {
    title: _l('操作时间'),
    dataIndex: 'operationDatetime',
    width: 200,
  },
  // {
  //   title: _l('停留时长'),
  //   dataIndex: '停留时长',
  // },
];

export const PRIVATE_APP_WORKSHEET_LOG_COLUMNS = [
  {
    title: 'IP',
    dataIndex: 'ip',
  },
  {
    title: _l('IP归属地'),
    dataIndex: 'geoCity',
  },
  {
    title: _l('浏览器'),
    dataIndex: 'browserName',
  },
  {
    title: _l('浏览器版本'),
    dataIndex: 'browserVersion',
  },
  {
    title: _l('操作系统类型'),
    dataIndex: 'systemInfo',
  },
  {
    title: _l('操作系统版本'),
    dataIndex: 'systemVersion',
  },
  {
    title: _l('经纬度'),
    dataIndex: 'latitudeAndLongitude',
  },
  {
    title: _l('设备类型'),
    dataIndex: 'platform',
  },
  {
    title: _l('设备型号'),
    dataIndex: 'deviceModel',
  },
  {
    title: _l('设备ID'),
    dataIndex: 'deviceId',
  },
  // {
  //   title: _l('IMEI'),
  //   dataIndex: 'imei',
  // },
];
