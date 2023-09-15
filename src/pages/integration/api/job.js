import base, { controllerName } from './base';

var job = {

  /**
   * 创建job
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  job: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'job/';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'jobjob', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 重新启动job
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  run: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'job/run';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'jobrun', JSON.stringify(args), $.extend(base, options));
  }
};

export default job;