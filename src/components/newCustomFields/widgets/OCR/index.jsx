import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Icon, QiniuUpload } from 'ming-ui';
import ajax from 'src/api/worksheet';
import { upgradeVersionDialog, browserIsMobile } from 'src/util';
import { getParamsByConfigs } from '../Search/util';
import { formatResponseData } from 'src/components/UploadFiles/utils.js';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

export default class Widgets extends Component {
  static propTypes = {
    worksheetId: PropTypes.string,
    controlId: PropTypes.string,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
    advancedSetting: PropTypes.object,
  };

  state = {
    isUploading: false,
  };

  componentDidMount() {
    if (this.file && this.file.upload) {
      this.width = this.file.upload.offsetWidth;
    }
  }

  handleUploaded = (up, file, info) => {
    const { worksheetId, controlId, advancedSetting, onChange } = this.props;
    const newVal = formatResponseData(file, JSON.stringify(info));

    // api集成
    if (advancedSetting.ocrapitype === '1') {
      // 保存识别源文件
      if (advancedSetting.ocroriginal) {
        onChange(
          JSON.stringify({ attachments: [newVal], knowledgeAtts: [], attachmentData: [] }),
          advancedSetting.ocroriginal,
        );
      }
      this.handleSearch(up, newVal);
      return;
    }

    ajax.ocr({ worksheetId, controlId, url: file.serverName + file.key, type: 1 }).then(result => {
      if (result.code === 1) {
        const ocrmap = JSON.parse(advancedSetting.ocrmap || '{}');

        result.data.forEach(item => {
          const currentItem = ocrmap.find(o => o.cid === item.controlId);
          let newValue;

          // 附件
          if (_.includes([1, 1001, 2001], parseInt(currentItem.type))) {
            newValue = JSON.stringify({
              attachments: [newVal],
              knowledgeAtts: [],
              attachmentData: [],
            });
          } else if (currentItem.subCid) {
            // 子表
            newValue = {
              action: 'clearAndSet',
              rows: item.childs,
            };
          } else {
            newValue = item.value;
          }

          onChange(newValue, item.controlId);
        });
      } else {
        alert(result.errorMsg, 2);
      }

      this.setState({ isUploading: false });
      up.disableBrowse(false);
    });
  };

  // api查询
  handleSearch = (up, file) => {
    const {
      advancedSetting: { requestmap } = {},
      dataSource,
      formData,
      worksheetId,
      controlId,
      projectId,
      appId,
      getControlRef,
    } = this.props;

    if (!dataSource) {
      this.setState({ isUploading: false });
      up && up.disableBrowse(false);
      return alert(_l('模版为空或已删除'), 3);
    }
    const requestMap = safeParse(requestmap || '[]');

    // 有配置api和请求参数
    if (this.postList) {
      this.postList.abort();
    }

    const paramsData = getParamsByConfigs(requestMap, formData, file, getControlRef);

    let params = {
      data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
      projectId,
      workSheetId: worksheetId,
      controlId,
      apkId: appId,
      apiTemplateId: dataSource,
    };

    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    this.postList = ajax.excuteApiQuery(params);

    this.postList.then(res => {
      if (res.code === 20008) {
        this.setState({ isUploading: false });
        up && up.disableBrowse(false);
        upgradeVersionDialog({
          projectId,
          okText: _l('立即充值'),
          hint: _l('余额不足，请联系管理员充值'),
          explainText: <div></div>,
          onOk: () => {
            location.href = `/admin/valueaddservice/${projectId}`;
          },
        });
        return;
      }

      if (res.message) {
        alert(res.message, 3);
        this.setState({ isUploading: false });
        up && up.disableBrowse(false);
        return;
      }

      this.setState({ isUploading: false }, () => {
        up && up.disableBrowse(false);
        this.handleUpdate(res.apiQueryData);
      });
    });
  };

  handleUpdate = (itemData = {}) => {
    const { advancedSetting: { responsemap } = {}, formData } = this.props;
    const responseMap = safeParse(responsemap || '[]');
    responseMap.map(item => {
      const control = _.find(formData, i => i.controlId === item.cid);
      if (control && !_.isUndefined(itemData[item.cid])) {
        // 子表直接赋值
        if (control.type === 34 && _.includes([10000007, 10000008], item.type)) {
          this.props.onChange(
            {
              action: 'clearAndSet',
              rows: safeParse(itemData[item.cid] || '[]').map(i => {
                return {
                  ...i,
                  rowid: `temprowid-${uuidv4()}`,
                  allowedit: true,
                  addTime: new Date().getTime(),
                };
              }),
            },
            control.controlId,
          );
        } else if (!item.subid) {
          // 普通数组特殊处理
          const itemVal =
            item.type === 10000007 && itemData[item.cid] && _.isArray(safeParse(itemData[item.cid]))
              ? safeParse(itemData[item.cid]).join(',')
              : itemData[item.cid];
          this.props.onChange(itemVal, control.controlId);
        }
        this.setState({ data: null, open: false, keywords: '' });
      }
    });
  };

  renderContent = () => {
    const { enumDefault, advancedSetting = {}, hint = '' } = this.props;
    const { isUploading } = this.state;

    const TYPES = [
      {},
      { text: _l('文字识别'), icon: 'ocr' },
      { text: _l('身份证识别'), icon: 'ocr_id_card' },
      { text: _l('增值税发票识别'), icon: 'ocr_invoice' },
    ];

    return (
      <Fragment>
        {isUploading ? (
          <span style={{ width: this.width - 50, textAlign: 'center' }}>
            <Icon icon="loading_button" className="Font16 customOCRLoading" />
          </span>
        ) : (
          <Fragment>
            <Icon icon={TYPES[enumDefault].icon} className="Font20 mRight5 Gray_9e" />
            <span className="overflow_ellipsis Bold">
              {advancedSetting.ocrapitype === '1' ? hint || _l('识别文字') : hint || TYPES[enumDefault].text}
            </span>
          </Fragment>
        )}
      </Fragment>
    );
  };

  render() {
    const { enumDefault, advancedSetting = {} } = this.props;
    const isMobile = browserIsMobile();
    const requestMap = safeParse(advancedSetting.requestmap || '[]');

    if (
      advancedSetting.ocrapitype === '1' &&
      requestMap.length > 0 &&
      _.every(
        requestMap,
        i => !_.find(safeParse(i.defsource || '[]'), c => _.includes(['ocr-file', 'ocr-file-url'], c.cid)),
      )
    ) {
      return (
        <div
          className="customFormControlBox customFormControlOCR"
          onClick={() => {
            this.setState({ isUploading: true }, this.handleSearch);
          }}
        >
          {this.renderContent()}
        </div>
      );
    }

    return (
      <QiniuUpload
        className="customFormControlBox customFormControlOCR"
        ref={file => {
          this.file = file;
        }}
        options={{
          multi_selection: false,
          chunk_size: 0,
          filters: {
            mime_types: [
              {
                title: 'image',
                extensions:
                  advancedSetting.ocrapitype === '1' || enumDefault === 3 ? 'jpg,jpeg,png,pdf' : 'jpg,jpeg,png',
              },
            ],
          },
        }}
        onUploaded={this.handleUploaded}
        onAdd={(up, files) => {
          this.setState({ isUploading: true });
          up.disableBrowse();
        }}
        onInit={() => {
          if (isMobile && _.get(this.props, 'strDefault') === '10') {
            // 是否禁用相册
            const ele = this.file.upload.nextSibling.querySelector('input');

            ele.setAttribute('capture', 'camera');
          }
        }}
      >
        {this.renderContent()}
      </QiniuUpload>
    );
  }
}
