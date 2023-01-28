import React, { Component } from 'react';
import { Radio, Input } from 'antd';
import { Icon, LoadDiv } from 'ming-ui';
import Config from '../../config';
import projectController from 'src/api/project';
import accountController from 'src/api/account';
import { encrypt } from 'src/util';
import captcha from 'src/components/captcha';
import _ from 'lodash';
import moment from 'moment';
const { TextArea } = Input;

const reasons = [
  _l('我要离职了'),
  _l('我是这个组织的最后一个用户'),
  _l('未能满足我的需求'),
  _l('产品价格太贵了'),
  _l('我找到了其他替代产品了'),
  _l('其他原因'),
];

const errorMsg = {
  6: _l('密码错误'),
  8: _l('验证码错误'),
};
export default class CloseNet extends Component {
  constructor() {
    super();
    this.state = {
      licenseType: 0,
      expireDays: 0,
      password: '',
      step: 1,
      disabled: false,
      reasonNumber: -1,
      reason: '',
      postDate: '',
      logoffs: [],
      isShow: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate() {
    $('input.ant-input').attr('autocomplete', 'new-password');
  }

  getData() {
    this.setState({ isLoading: true });
    $.when(this.getLicenseType(), this.getExpireDays()).then(({ licenseType, logoffs }, { expireDays, isTrial }) => {
      const firstItem = logoffs[0] || {};
      this.setState({
        expireDays: isTrial ? expireDays : 0,
        licenseType,
        logoffs,
        password: '',
        disabled: false,
        reasonNumber: -1,
        reason: '',
        step: firstItem.type === 1 ? 3 : 1,
        postDate: firstItem.createTime,
        isLoading: false,
      });
    });
  }

  getExpireDays() {
    return Config.AdminController.projectExpireDays({
      projectId: Config.projectId,
    });
  }

  getLicenseType() {
    return projectController.getProjectLogOff({
      projectId: Config.projectId,
    });
  }

  handleChange(e) {
    this.setState({
      password: e.target.value,
    });
  }

  handlePostPassword() {
    const { password, licenseType } = this.state;
    if (password) {
      this.setState({ disabled: true });

      var throttled = _.throttle(
        res => {
          if (res.ret === 0) {
            accountController
              .checkAccount({
                ticket: res.ticket,
                randStr: res.randstr,
                captchaType: md.staticglobal.getCaptchaType(),
                password: encrypt(password),
              })
              .then(data => {
                if (data === 1) {
                  if (_.includes([0, 1], licenseType)) {
                    //付费、免费
                    this.setState({
                      step: 2,
                      disabled: false,
                    });
                  } else if (licenseType == 2) {
                    //试用
                    this.removeProjectTrialLicense(data => {
                      if (data) {
                        alert(_l('退出付费版试用成功'), 1, 2000, function () {
                          window.location.href = '/personal?type=enterprise';
                        });
                      } else {
                        this.setState({ disabled: false });
                        alert(_l('退出付费版试用失败'), 3);
                      }
                    });
                  }
                } else {
                  this.setState({ disabled: false });
                  alert(errorMsg[data] || _l('操作失败'), 3);
                }
              });
          }
        },
        10000,
        { leading: true },
      );

      if (md.staticglobal.getCaptchaType() === 1) {
        new captcha(throttled);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
      }
    } else {
      alert(_l('请输入登录密码'), 3, 1000);
    }
  }

  //移除网络试用授权
  removeProjectTrialLicense = callback => {
    projectController
      .removeProjectTrialLicense({
        projectId: Config.projectId,
      })
      .then(function (data) {
        callback(data);
      });
  };

  onChange(e) {
    this.setState({
      reasonNumber: e.target.value,
    });
  }

  handleTextChange(e) {
    this.setState({
      reason: e.target.value,
    });
  }

  handleSubmit() {
    const { reasonNumber, reason } = this.state;
    const currentReason = reasonNumber === 5 ? reason : reasons[reasonNumber];
    if (!currentReason) {
      this.setState(
        {
          reasonNumber: 5,
        },
        () => {
          alert(_l('请输入内容'), 3);
        },
      );
      return;
    }
    this.setState({ disabled: true });
    projectController
      .applyCancelProject({
        reason,
        projectId: Config.projectId,
      })
      .then(data => {
        this.setState({ disabled: false });
        if (data) {
          this.setState({
            step: 3,
            reasonNumber: -1,
            reason: '',
            postDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          });
        } else {
          alert(_l('申请失败'), 2);
        }
      });
  }

  handleUnSubmit() {
    projectController
      .removeApplyCancelProject({
        projectId: Config.projectId,
      })
      .then(data => {
        if (data) {
          alert(_l('已取消注销'));
          this.getData();
        } else {
          alert(_l('取消注销失败'), 2);
        }
      });
  }

  showList() {
    this.setState({
      isShow: !this.state.isShow,
    });
  }

  render() {
    const {
      isShow,
      expireDays,
      password,
      licenseType,
      step,
      disabled,
      reason,
      reasonNumber,
      postDate,
      logoffs,
      isLoading,
    } = this.state;
    return (
      <div className="system-set-box">
        <div className="system-set-header">
          <Icon
            icon="backspace"
            className="Hand mRight18 TxtMiddle Font24"
            onClick={() => {
              step === 1 || step === 3
                ? this.props.setLevel(1)
                : this.setState({
                    step: this.state.step - 1,
                  });
            }}
          ></Icon>
          <span className="Font17">{_l('注销组织')}</span>
        </div>
        <div className="system-set-content">
          {isLoading ? (
            <LoadDiv />
          ) : (
            <div className="closeNet">
              <div id="stepOne" className={`${step === 1 ? '' : 'Hidden'}`}>
                <div className="Bold Font24 title">
                  <i className="icon-error error Font28 mRight8"></i>
                  {licenseType === 2 ? _l('退出付费版试用') : _l('申请注销')}
                </div>
                <div className="mTop16 Font13 subTitle">
                  {licenseType === 2
                    ? _l('付费版试用还有%0天，退出试用后将无法恢复。', expireDays || 0)
                    : _l('注销后，关于该组织的所有数据将被删除')}
                </div>
                <div className="mTop30">
                  <div className="Bold Font13 title">{_l('请输入您的登录密码')}</div>
                  <Input.Password
                    value={password}
                    disabled={disabled}
                    autocomplete="new-password"
                    className="mTop10 passwordInput"
                    placeholder={_l('请输入你的登录密码')}
                    onChange={this.handleChange.bind(this)}
                  />
                  <button
                    type="button"
                    className="ming Button Button--primary confirmBtn Block"
                    onClick={this.handlePostPassword.bind(this)}
                  >
                    {_l('确定')}
                  </button>
                </div>
              </div>
              <div id="stepTwo" className={`${step === 2 ? '' : 'Hidden'}`}>
                <div className="Bold Font24 title">
                  <i className="icon-error error Font28 mRight8"></i>
                  {_l('申请注销')}
                </div>
                <div className="mTop16 Font13 subTitle">{_l('提交申请后部署顾问将尽快与您联系办理注销手续')}</div>
                <div className="mTop20">
                  <Radio.Group
                    className="content"
                    onChange={this.onChange.bind(this)}
                    value={reasonNumber}
                    disabled={disabled}
                  >
                    {reasons.map((item, index) => {
                      return (
                        <Radio className="mTop20" value={index} key={index}>
                          {item}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                  <div className="mTop10 inputText">
                    <TextArea
                      className={`${reasonNumber === 5 ? '' : 'Hidden'}`}
                      value={reason}
                      onChange={this.handleTextChange.bind(this)}
                      placeholder={_l('请输入其他原因')}
                    />
                  </div>
                  <div className="pTop10">
                    <button
                      type="button"
                      className="ming Button Button--primary confirmBtn Block"
                      onClick={this.handleSubmit.bind(this)}
                    >
                      {_l('提交申请')}
                    </button>
                  </div>
                </div>
              </div>
              <div id="stepThree" className={`${step === 3 ? '' : 'Hidden'}`}>
                <div className="Bold Font24 title">{_l('已提交退出付费版申请')}</div>
                <div className="mTop20 Font13 subTitle">{_l('部署顾问将尽快与您联系办理退出手续')}</div>
                <div className="mTop32 ">
                  <div className="rowDetail">
                    <div className="rowLabel">{_l('申请人')}</div>
                    <span>{md.global.Account.fullname}</span>
                  </div>
                  <div className="mTop12 rowDetail">
                    <div className="rowLabel">{_l('申请时间')}</div>
                    <span>{postDate}</span>
                  </div>
                </div>
                <div className="pTop10">
                  <button
                    type="button"
                    className="ming Button Button--primary confirmBtn Block"
                    onClick={this.handleUnSubmit.bind(this)}
                  >
                    {_l('取消申请')}
                  </button>
                </div>
              </div>
              <div className={`hisListContainer ${licenseType == 1 ? '' : 'Hidden'}`}>
                <div className="mTop20 ThemeColor3">
                  <span className="Hand" onClick={this.showList.bind(this)}>
                    {_l('申请记录')}
                    <i className={`${isShow ? 'icon-arrow-down' : 'icon-arrow-up'} font8`}></i>
                  </span>
                </div>
                <div className={`tableViewContent mTop10 ${isShow ? '' : 'hidden'}`}>
                  <table className="LineHeight40 w100">
                    <thead>
                      <tr>
                        <th className="pLeft20 tableUser">{_l('申请人')}</th>
                        <th className="tableOption">{_l('操作')}</th>
                        <th className="tableTime">{_l('申请时间')}</th>
                      </tr>
                    </thead>
                  </table>
                  <div className="closeNetTableContent">
                    <table className="w100 LineHeight40">
                      <tbody>
                        {logoffs.length
                          ? logoffs.map((list, index) => {
                              return (
                                <tr key={index}>
                                  <td className="pLeft20 tableUser">{list.createUser && list.createUser.fullname}</td>
                                  <td className={`tableOption ${list.type == 1 ? '' : 'Gray_c'}`}>
                                    {list.type === 1 ? _l('申请注销') : _l('取消注销')}
                                  </td>
                                  <td className="tableTime">{list.createTime}</td>
                                </tr>
                              );
                            })
                          : ''}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
