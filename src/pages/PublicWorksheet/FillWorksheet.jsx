import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { autobind } from 'core-decorators';
import { Button, RichText } from 'ming-ui';
import captcha from 'src/components/captcha';
import CustomFields from 'src/components/newCustomFields';
import { addWorksheetRow } from './action';
import { getSubListError, filterHidedSubList } from 'worksheet/util';
import { checkMobileVerify, controlState } from 'src/components/newCustomFields/tools/utils';
import './index.less';
import _ from 'lodash';
import moment from 'moment';
import { TIME_TYPE } from '../publicWorksheetConfig/enum';
import { getLimitWriteTimeDisplayText } from '../publicWorksheetConfig/utils';
import FilledRecord from './FilledRecord';
import { FILL_STATUS } from './enum';
import CountDown from '../publicWorksheetConfig/common/CountDown';
import { getRgbaByColor } from '../widgetConfig/util';

const ImgCon = styled.div`
  position: relative;
  display: inline-block;
  margin-top: 32px;
  height: 40px;
  img {
    height: 40px;
    max-width: 100%;
    object-fit: contain;
  }
  .icon {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 18px;
    color: #bdbdbd;
  }
`;

const LoadMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2;
`;

export default class FillWorksheet extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    rules: PropTypes.arrayOf(PropTypes.shape({})),
    publicWorksheetInfo: PropTypes.shape({}),
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    onSubmit: PropTypes.func,
    status: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      showError: false,
      formData: props.formData,
    };
  }

  componentDidMount() {
    if (!this.props.isPreview) {
      window.onbeforeunload = function (e) {
        e = e || window.event;
        if (e) {
          e.returnValue = '关闭提示';
        }
        return '关闭提示';
      };
    }
  }

  con = React.createRef();
  customwidget = React.createRef();
  cellObjs = {};

  @autobind
  handleSubmit() {
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  }

  @autobind
  onSave(error, { data, updateControlIds }) {
    if (this.issubmitting) {
      return;
    }
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    if (!this.customwidget.current) return;
    const { publicWorksheetInfo = {}, onSubmit } = this.props;
    const {
      shareId,
      worksheetId,
      needCaptcha,
      smsVerificationFiled,
      smsVerification,
      cacheFieldData = {},
    } = publicWorksheetInfo;
    let hasError;
    const subListControls = filterHidedSubList(data, 2);
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value:
            control.value &&
            control.value.rows &&
            control.value.rows.length &&
            getSubListError(
              {
                rows: control.value.rows,
                rules:
                  _.get(this.cellObjs || {}, `${control.controlId}.cell.rules`) ||
                  _.get(this.cellObjs || {}, `${control.controlId}.cell.worksheettable.current.table.rules`),
              },
              _.get(this.cellObjs || {}, `${control.controlId}.cell.controls`) || control.relationControls,
              control.showControls,
              2,
            ),
        }))
        .filter(c => !_.isEmpty(c.value));
      if (errors.length) {
        hasError = true;
        errors.forEach(error => {
          const errorSublist = (this.cellObjs || {})[error.id];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: !_.isEmpty(error.value),
              cellErrors: error.value,
            });
          }
        });
      } else {
        subListControls.forEach(control => {
          const errorSublist = (this.cellObjs || {})[control.controlId];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: false,
              cellErrors: {},
            });
          }
        });
      }
      if (this.con.current.querySelector('.cellControlErrorTip')) {
        hasError = true;
      }
    }

    const submit = res => {
      if (res && !res.ticket) {
        this.setState({
          submitLoading: false,
        });
        return;
      }
      this.issubmitting = true;
      let params = res
        ? {
            ticket: res.ticket,
            randStr: res.randstr,
            captchaType: md.staticglobal.getCaptchaType(),
          }
        : {};
      if (smsVerification && checkMobileVerify(data, smsVerificationFiled)) {
        params.verifyCode = this.customwidget.current.state.verifyCode;
      }
      addWorksheetRow(
        {
          worksheetId,
          shareId,
          formData: data,
          publicWorksheetInfo,
          triggerUniqueError: badData => {
            if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
              this.customwidget.current.uniqueErrorUpdate(badData);
            }
          },
          params,
        },
        (err, res) => {
          this.issubmitting = false;
          if (err) {
            this.setState({
              submitLoading: false,
            });
            return;
          }
          if (!res) {
            alert(_l('当前表单已过期'), 3);
            this.setState({
              submitLoading: false,
            });
            return;
          }
          // 添加成功
          safeLocalStorageSetItem('publicWorksheetLastSubmit_' + publicWorksheetInfo.shareId, new Date().toISOString());
          if (cacheFieldData.isEnable) {
            safeLocalStorageSetItem('cacheFieldData_' + publicWorksheetInfo.shareId, JSON.stringify(data || []));
          }
          localStorage.removeItem('cacheDraft_' + publicWorksheetInfo.shareId); //提交成功，清除未提交缓存
          window.onbeforeunload = null;
          this.setState({
            submitLoading: false,
          });
          onSubmit();
        },
      );
    };
    if (hasError) {
      alert(_l('请正确填写'), 3);
      this.setState({
        submitLoading: false,
      });
      return false;
    } else {
      if (needCaptcha) {
        if (md.staticglobal.getCaptchaType() === 1) {
          captcha(submit, () => submit({}));
        } else {
          new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), submit).show();
        }
      } else {
        submit();
      }
    }
  }

  render() {
    const { loading, publicWorksheetInfo = {}, rules, status, isPreview } = this.props;
    const { submitLoading, formData, showError } = this.state;
    const {
      name,
      desc,
      worksheetId,
      logoUrl,
      submitBtnName,
      isWorksheetQuery,
      smsVerificationFiled,
      smsVerification,
      appId,
      projectId,
      linkSwitchTime,
      limitWriteCount,
      limitWriteTime,
      completeNumber,
      cacheDraft,
      themeBgColor,
    } = publicWorksheetInfo;

    return (
      <React.Fragment>
        {submitLoading && <LoadMask />}
        <div className="infoCon" style={{ padding: '0 30px' }}>
          {logoUrl ? (
            <ImgCon>
              <img className="logo" src={logoUrl} />
            </ImgCon>
          ) : (
            <div style={{ marginTop: 32 }}></div>
          )}
          <div className="worksheetName">{name || _l('未命名表单')}</div>

          <div className="mdEditor">
            {!!desc && (
              <RichText
                data={desc || ''}
                className="worksheetDescription WordBreak mdEditorContent "
                disabled={true}
                minHeight={64}
              />
            )}
          </div>
          {!isPreview && (
            <React.Fragment>
              <div className="worksheetLimitInfo" style={{ borderColor: getRgbaByColor(themeBgColor, 0.2) }}>
                {linkSwitchTime && linkSwitchTime.isEnable && (
                  <div className="itemInfo">
                    <React.Fragment>
                      {linkSwitchTime.isShowCountDown ? (
                        <CountDown
                          className="Gray"
                          endTime={linkSwitchTime.endTime}
                          beforeText={_l('链接将于')}
                          afterText={_l('后截止')}
                          arriveText={_l('链接已截止') + ';'}
                        />
                      ) : (
                        <React.Fragment>
                          <span>{_l('链接将于')}</span>
                          <span className="bold Gray mLeft5 mRight5">
                            {moment(linkSwitchTime.endTime).format('YYYY-MM-DD HH:mm')}
                          </span>
                          <span>{_l('截止')};</span>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  </div>
                )}
                {limitWriteCount && limitWriteCount.isEnable && (
                  <div className="itemInfo">
                    <span>{_l('已收集')}</span>
                    <span className="Gray mLeft5 mRight5">
                      {_l(`${completeNumber || 0}/${limitWriteCount.limitWriteCount} `)}
                    </span>
                    <span>{_l('份, 还剩')}</span>
                    <span className="Gray mLeft5 mRight5">
                      {limitWriteCount.limitWriteCount - (completeNumber || 0)}
                    </span>
                    <span>{_l('份结束收集')};</span>
                  </div>
                )}
                {limitWriteTime && limitWriteTime.isEnable && (
                  <div className="itemInfo">
                    <span className="Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.MONTH, limitWriteTime)}</span>
                    <span className="mLeft5 mRight5">{_l('的')}</span>
                    <span className="Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.DAY, limitWriteTime)}</span>
                    {!!getLimitWriteTimeDisplayText(TIME_TYPE.HOUR, limitWriteTime) && (
                      <span className="mLeft5 mRight5">{_l('的')}</span>
                    )}
                    <span className="Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.HOUR, limitWriteTime)}</span>
                    <span className="mLeft5">{_l('可填写')}</span>
                  </div>
                )}
              </div>
              <FilledRecord
                isFillPage={true}
                publicWorksheetInfo={publicWorksheetInfo}
                formData={formData}
                rules={rules}
                status={status}
              />
            </React.Fragment>
          )}
        </div>
        <div className="formMain" ref={this.con} style={{ padding: '0 32px' }}>
          {!loading && (
            <CustomFields
              widgetStyle={publicWorksheetInfo.advancedSetting}
              rules={rules}
              ref={this.customwidget}
              data={formData}
              appId={appId}
              projectId={projectId}
              from={4}
              worksheetId={worksheetId}
              isWorksheetQuery={isWorksheetQuery}
              smsVerificationFiled={smsVerificationFiled}
              smsVerification={smsVerification}
              showError={showError}
              registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
              onChange={(data, id) => {
                cacheDraft &&
                  safeLocalStorageSetItem('cacheDraft_' + publicWorksheetInfo.shareId, JSON.stringify(data || []));
                this.setState({
                  formData: data,
                });
              }}
              onSave={this.onSave}
              onError={() => {
                this.setState({ submitLoading: false });
              }}
            />
          )}
        </div>
        <div className="submitCon">
          <Button
            className="submitBtn"
            disabled={
              !formData.filter(c => controlState(c, 4).visible).length ||
              status === FILL_STATUS.NOT_IN_FILL_TIME ||
              isPreview
            }
            loading={submitLoading}
            style={{ height: '40px', lineHeight: '40px', background: themeBgColor, padding: 0 }}
            onClick={this.handleSubmit}
          >
            <span className="InlineBlock ellipsis w100">{submitBtnName}</span>
          </Button>
        </div>
      </React.Fragment>
    );
  }
}
