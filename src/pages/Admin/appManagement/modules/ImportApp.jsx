import React, { Fragment } from 'react';
import { Progress } from 'antd';
import SvgIcon from 'src/components/SvgIcon';
import { Checkbox, Tooltip, Support } from 'ming-ui';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';
import Config from '../../config';
import cx from 'classnames';
import './index.less';
import { formatFileSize } from 'src/util';

const ERRORMSG = {
  3: _l('密码错误，验证失败'),
  4: _l('失败次数过多，请于15分钟后尝试'),
  6: _l('导入失败，导入将导致目标网络的工作表总数超过上限'),
};

const ALERTMSG = {
  1: _l('导入失败，导入将导致目标网络的应用数量超过上限'),
  6: _l('导入失败，导入将导致目标网络的工作表总数超过上限'),
};

export default class ImportApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      list: [],
      file: {},
      errTip: '',
      password: '',
      url: '',
      matchOffice: true,
      appBeyond: null, //应用是否超标或工作表超标
      isHighVersions: false, // 应用版本高于环境版本
    };
  }

  componentDidMount() {
    this.initUpload();
  }

  //上传文件
  initUpload() {
    this.uploader = createUploader({
      runtimes: 'html5',
      max_file_count: 1,
      browse_button: this.uploadFile,
      drop_element: 'importExcel',
      bucket: 3,
      filters: {
        mime_types: [{ extensions: 'mdy' }],
      },
      init: {
        BeforeUpload: (up, file) => {
          if (File.GetExt(file.name) != 'mdy') {
            alert(_l('上传失败，文件类型错误'), 2, 1000);
            return false;
          }
          this.setState({ file: file });
        },
        FilesAdded: up => {
          up.setOption('auto_start', true);
        },
        UploadProgress: (uploader, file) => {
          this.setState({ file });
        },
        FileUploaded: (up, file, info) => {
          const { key } = info.response;
          this.setState(
            {
              file: file,
              url: md.global.FileStoreConfig.documentHost + key,
              errTip: '',
            },
            () => {
              this.checkPassword();
            },
          );
        },
        Error: (up, err, errTip) => {
          this.setState({
            file: {},
            url: '',
            password: '',
            errTip: _l('文件上传失败'),
          });
        },
      },
    });
  }

  //验证密码是否正确
  checkPassword() {
    const params = {
      password: this.state.password,
      url: this.state.url,
      accountId: md.global.Account.accountId,
      projectId: this.props.projectId ? this.props.projectId : Config.projectId,
    };
    $.ajax({
      type: 'POST',
      url: `${md.global.Config.AppFileServer}AppFile/Check`,
      data: JSON.stringify(params),
      dataType: 'JSON',
      contentType: 'application/json',
    }).done(({ data: { errorCode, apps = [], isHighVersions } }) => {
      if (errorCode === 5) {
        this.setState({ errTip: _l('解析失败，不是有效的应用文件') });
      } else if (ERRORMSG[errorCode]) {
        alert(ERRORMSG[errorCode], 2, 4000);
      } else {
        this.setState(
          {
            step: errorCode >= 2 ? 2 : 3,
            list: apps,
            appBeyond: errorCode,
            isHighVersions,
          },
          () => this.uploader.destroy(),
        );
      }
    });
  }

  //app导入
  importApp() {
    if (this.state.appBeyond) {
      alert(ALERTMSG[this.state.appBeyond], 3);
      return;
    }
    const params = {
      password: this.state.password,
      url: this.state.url,
      accountId: md.global.Account.accountId,
      projectId: this.props.projectId ? this.props.projectId : Config.projectId,
      matchOffice: this.state.matchOffice,
      groupId: this.props.groupId,
      groupType: this.props.groupType,
    };
    this.props.closeDialog();
    $.ajax({
      type: 'POST',
      url: `${md.global.Config.AppFileServer}AppFile/Import`,
      data: JSON.stringify(params),
      dataType: 'JSON',
      contentType: 'application/json',
    });
  }

  renderFileInfo() {
    const { file, errTip } = this.state;
    if (file.name) {
      return (
        <Fragment>
          <div className="Font17">{file.name}</div>
          {errTip ? (
            <div className="mTop6 errorColor">
              <span className="icon-info TxtMiddle Font15 mRight6"></span>
              <span>{_l(errTip)}</span>
            </div>
          ) : (
            <div className="Gray_75 mTop6">{_l('大小：%0', formatFileSize(file.size))}</div>
          )}
        </Fragment>
      );
    } else {
      return <div className="Gray_bd">{_l('请选择.mdy格式的应用文件')}</div>;
    }
  }

  renderStepContent() {
    const { step, password, list, file, errTip, isHighVersions } = this.state;
    switch (step) {
      case 1:
        return (
          <div
            className={cx('importAppContent importAppContentCenter', file.name ? 'solidBorder' : 'dashBorder')}
            id="importExcel"
          >
            <img
              className="uploadImg"
              src={
                file.name
                  ? '/src/pages/Admin/appManagement/img/import_active.png'
                  : '/src/pages/Admin/appManagement/img/import_disabled.png'
              }
            ></img>
            {this.renderFileInfo()}
            <button
              type="button"
              className={cx('ming Button exportBtn mTop24 Bold', { Hidden: !errTip && file.name })}
              ref={input => {
                this.uploadFile = input;
              }}
            >
              {errTip ? _l('重新上传') : _l('上传文件')}
            </button>

            {file.name && (
              <div className={cx('flexRow mTop16', { Hidden: file.loaded === file.size })}>
                <Progress
                  style={{ width: 250 }}
                  trailColor="#eaeaea"
                  strokeColor="#2196f3"
                  strokeWidth={8}
                  percent={Math.floor((file.loaded / (file.size || 0)) * 100)}
                />
                <span
                  className="icon-cancel1 Gray_9e Font16 Hover_49 mLeft12 LineHeight22"
                  onClick={() => {
                    this.uploader.stop();
                    this.uploader.removeFile(file);
                    this.setState({
                      file: {},
                      errTip: '',
                    });
                  }}
                ></span>
              </div>
            )}
            {file.name && file.loaded === file.size && !errTip && (
              <div className="flexRow mTop16">
                <div className="notificationIconWrap">
                  <i className="icon-loading_button Font20 ThemeColor3"></i>
                </div>
                <span className="Gray_75 mLeft10">{_l('正在解析文件...')}</span>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="importAppContent solidBorder importAppContentCenter">
            <div className="Font14">{_l('文件已加密，需验证通过才能导入')}</div>
            <input
              className="passwordInputBox mTop16 mBottom16"
              placeholder={_l('请输入密码')}
              value={password}
              onChange={e => this.setState({ password: e.target.value })}
            />
            <button
              type="button"
              disabled={!password}
              className={cx('ming Button Button--primary submitPassword Bold', { disabled: !password })}
              onClick={() => this.checkPassword()}
            >
              {_l('确认')}
            </button>
          </div>
        );
      case 3:
        return (
          <div className="importAppContent solidBorder pAll15">
            <div className="Gray_75 mBottom15">{_l('文件解析成功，即将导入以下%0个应用', list.length)}</div>
            {list.map(item => {
              return (
                <div className="importAppContentItem" key={item.appId}>
                  <div className="mRight15 svgBox" style={{ backgroundColor: item.iconColor }}>
                    <SvgIcon url={item.iconUrl} fill="#fff" size={14} />
                  </div>
                  <div className="flex ellipsis">{item.name}</div>
                  {isHighVersions && <span className="Gray_9e">{_l('（从高版本系统导出）')}</span>}
                </div>
              );
            })}
          </div>
        );
    }
  }

  render() {
    const { matchOffice, step } = this.state;
    return (
      <div className="importAppContainer">
        <div className="mBottom24">
          <span className="Gray_75">
            {_l(
              '将应用文件导入组织生成一个新的应用，以实现应用快速迁移或创建。在导入私有部署环境前，请确认私有部署的版本，高版本向低版本导入，可能会导入失败。',
            )}
          </span>
          <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/apply3" />
        </div>
        {this.renderStepContent()}
        {step === 3 && (
          <div className="exportBottomOption mTop16">
            <div className="flexCenter">
              <Checkbox
                className="TxtMiddle mRight6"
                checked={matchOffice}
                onClick={checked => this.setState({ matchOffice: !checked })}
              >
                {_l('导入时匹配人员部门职位')}
              </Checkbox>
              <Tooltip
                popupPlacement="top"
                text={<span>{_l('将工作表、工作流、角色中的人员部门职位与网络中的进行匹配可保证应用的完整性')}</span>}
              >
                <span className="Gray_bd icon-help1 Font15"></span>
              </Tooltip>
            </div>
            <button
              type="button"
              className="ming Button Button--primary Hover_49 importBtn Bold"
              onClick={() => this.importApp()}
            >
              {_l('立即导入')}
            </button>
          </div>
        )}
      </div>
    );
  }
}
