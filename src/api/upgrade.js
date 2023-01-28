export default {
  /**
  * 申请顾问
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {} args.type 升级后选择进入网络
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyForSalesAssistance: function (args, options = {}) {
     
     return $.api('Upgrade', 'ApplyForSalesAssistance', args, options);
   },
  /**
  * 获取网络升级信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectUpgradeInfo: function (args, options = {}) {
     
     return $.api('Upgrade', 'GetProjectUpgradeInfo', args, options);
   },
  /**
  * 获取合同信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectContractInfo: function (args, options = {}) {
     
     return $.api('Upgrade', 'GetProjectContractInfo', args, options);
   },
  /**
  * 修改合同信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.companyName 公司名称
  * @param {integer} args.geographyId 地区
  * @param {string} args.address 地址
  * @param {string} args.postcode 邮政编码
  * @param {string} args.email email
  * @param {string} args.recipientName 发票接收人
  * @param {string} args.mobilePhone 手机
  * @param {string} args.fax 传真
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateProjectContractInfo: function (args, options = {}) {
     
     return $.api('Upgrade', 'UpdateProjectContractInfo', args, options);
   },
  /**
  * 获取订单合同信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.versionId 版本
  * @param {integer} args.userNum 用户数
  * @param {integer} args.years 年数
  * @param {boolean} args.unLimited 是否无限人数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOrderContractInfo: function (args, options = {}) {
     
     return $.api('Upgrade', 'GetOrderContractInfo', args, options);
   },
};
