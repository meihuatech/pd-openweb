import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Textarea, Linkify } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);
import CellErrorTips from './comps/CellErrorTip';
import EditableCellCon from '../EditableCellCon';
import renderText from './renderText';
import { emitter, isKeyBoardInputChar } from 'worksheet/util';
import { FROM } from './enum';
import { browserIsMobile, accMul, formatStrZero, formatNumberFromInput } from 'src/util';
import _ from 'lodash';

const InputCon = styled.div`
  box-sizing: border-box
  padding: 0 6px;
  height: 34px;
  textarea {
    box-sizing: border-box;
    background: transparent;
    font-size: 13px;
    width: 100% !important;
    line-height: 34px;
    height: 34px;
    resize: none;
    white-space: pre;
    overflow: hidden;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
  }
`;

const MultipleLineTip = styled.div`
  position: absolute;
  padding: 4px;
  bottom: 2px;
  left: 2px;
  right: 2px;
  font-size: 12px;
  color: #bdbdbd;
  background: #fff;
`;

const Input = React.forwardRef((props, ref) => {
  const { className, onChange, ...rest } = props;
  return (
    <InputCon className={className}>
      <textarea
        {...rest}
        className="stopPropagation"
        ref={ref}
        onChange={e => onChange(e.target.value.replace(/\r\n|\n/g, ''))}
      />
    </InputCon>
  );
});
Input.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
};

export default class Text extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    onValidate: PropTypes.func,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
    needLineLimit: PropTypes.bool,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
      oldValue: props.cell.value,
      forceShowFullValue: _.get(props.cell, 'advancedSetting.datamask') !== '1',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: nextProps.cell.value });
    }
    // 数值类小数点自动配置，聚焦时去零
    if (
      nextProps.isediting !== this.props.isediting &&
      nextProps.isediting &&
      _.get(nextProps, 'cell.advancedSetting.dotformat') === '1'
    ) {
      this.setState({ value: formatStrZero(nextProps.cell.value) });
    }
  }

  componentDidUpdate(prevProps) {
    const { value, oldValue } = this.state;
    if (!prevProps.isediting && this.props.isediting) {
      if (this.isNumberPercent && value) {
        this.setState({ value: accMul(value, 100), oldValue: oldValue ? accMul(oldValue, 100) : oldValue }, this.focus);
      } else {
        this.focus();
      }
    }
  }

  componentWillUnmount() {
    const { isSubList, isediting } = this.props;
    if (isSubList && isediting && !this.hadBlur) {
      this.handleBlur();
    }
  }

  get isNumberPercent() {
    const { cell } = this.props;
    return _.includes([6, 31, 37], cell.type) && cell.advancedSetting && cell.advancedSetting.numshow === '1';
  }

  get controlCanMask() {
    const { cell } = this.props;
    return (
      ((cell.type === 2 && cell.enumDefault === 2) || _.includes([6, 8, 3, 5, 7], cell.type)) &&
      _.get(cell, 'advancedSetting.datamask') === '1'
    );
  }

  get masked() {
    const { cell, isCharge } = this.props;
    return this.controlCanMask && this.state.value && (isCharge || _.get(cell, 'advancedSetting.isdecrypt') === '1');
  }

  get isMultipleLine() {
    const { cell } = this.props;
    return cell.type === 2 && cell.enumDefault === 1;
  }

  con = React.createRef();
  input = React.createRef();

  @autobind
  focus(time) {
    setTimeout(() => {
      if (this.input && this.input.current) {
        const valueLength = (this.input.current.value || '').length;
        this.input.current.focus();
        this.input.current.setSelectionRange(valueLength, valueLength);
      }
    }, time || 100);
  }

  @autobind
  handleEdit(e) {
    const { updateEditingStatus, cell } = this.props;
    e.stopPropagation();
    updateEditingStatus(true, this.focus);
  }

  @autobind
  handleBlur(target) {
    this.hadBlur = true;
    const { cell, error, updateCell, updateEditingStatus } = this.props;
    let { oldValue = '' } = this.state;
    let { value = '' } = this.state;
    if (this.isNumberPercent && value) {
      value = accMul(parseFloat(value), 1 / 100);
      oldValue = accMul(parseFloat(oldValue), 1 / 100);
    }
    if ((cell.type === 6 || cell.type === 8) && value === '-') {
      value = '';
      this.setState({ value });
    }

    if (oldValue === value) {
      if (this.isNumberPercent && value) {
        this.setState({ oldValue, value });
      }
      updateEditingStatus(false);
      return;
    } else if ((cell.enumDefault === 0 || cell.enumDefault === 2) && typeof value === 'string') {
      value = value.replace(/\r\n|\n/g, ' ').trim();
    }
    if (error) {
      updateEditingStatus(false);
      this.setState({
        value: this.state.oldValue,
      });
      return;
    }
    updateCell({
      value: value,
    });
    this.setState({
      oldValue: value,
      value,
    });
    updateEditingStatus(false);
  }
  @autobind
  handleChange(value) {
    const { cell, onValidate } = this.props;
    if (cell.type === 6 || cell.type === 8) {
      value = formatNumberFromInput(String(value), false);
    }
    onValidate(value);
    this.setState({
      value,
    });
  }

  @autobind
  handleTableKeyDown(e) {
    const { cell, updateEditingStatus } = this.props;
    const setKeyboardValue = value => {
      updateEditingStatus(true, () => {
        setTimeout(() => {
          const inputDom = this.input.current;
          if (inputDom) {
            inputDom.value = value;
            this.handleChange(value);
          }
        }, 10);
      });
    };
    function handleCopyFromWindow() {
      if (window.tempCopyForSheetView) {
        const data = safeParse(window.tempCopyForSheetView);
        if (data.type === 'text') {
          setKeyboardValue(data.value);
        } else {
          setKeyboardValue(data.textValue);
        }
      }
    }
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      if (_.isFunction(navigator.clipboard.readText)) {
        navigator.clipboard
          .readText()
          .then(setKeyboardValue)
          .catch(err => {
            if (window.tempCopyForSheetView) {
              handleCopyFromWindow();
            } else {
              alert(_l('请开启浏览器针对此页面的剪贴板读取权限'), 3);
            }
          });
      } else {
        handleCopyFromWindow();
      }
      return;
    }
    switch (e.key) {
      default:
        (() => {
          let value = e.key;
          if (cell.type === 6 || cell.type === 8) {
            value = formatNumberFromInput(e.key, false);
          }
          if (!e.isInputValue && (!value || !isKeyBoardInputChar(e.key))) {
            return;
          }
          updateEditingStatus(true, () => {
            setTimeout(() => {
              if (e.keyCode === 229) {
                this.handleChange('');
                return;
              }
              const inputDom = this.input.current;
              if (inputDom) {
                inputDom.value = value;
                this.handleChange(value);
              }
            }, 10);
            e.stopPropagation();
            e.preventDefault();
          });
        })();
        break;
    }
  }

  @autobind
  handleKeydown(e) {
    const { tableId, cell, updateEditingStatus } = this.props;
    if (e.keyCode === 27) {
      updateEditingStatus(false);
      this.setState({
        value: this.state.oldValue,
      });
      e.preventDefault();
    } else if (e.keyCode === 13) {
      if (this.isMultipleLine && !(e.ctrlKey || e.metaKey)) {
        return;
      }
      e.preventDefault();
      this.handleBlur();
      setTimeout(
        () =>
          emitter.emit('TRIGGER_TABLE_KEYDOWN_' + tableId, {
            keyCode: 40,
            action: 'text_enter_to_next',
            stopPropagation: () => {},
            preventDefault: () => {},
          }),
        100,
      );
    } else if (_.includes(['ArrowUp', 'ArrowDown'], e.key) && _.includes([6, 8], cell.type)) {
      const num = Number(this.state.value);
      if (_.isNumber(num) && !_.isNaN(num)) {
        this.handleChange(num + (e.key === 'ArrowUp' ? 1 : -1));
      }
      e.preventDefault();
    } else if (e.keyCode === 9) {
      this.handleBlur();
    }
  }

  @autobind
  handleUnMask(e) {
    if (!this.masked || window.shareState.shareId) {
      return;
    }
    e.stopPropagation();
    this.setState({ forceShowFullValue: true });
  }
  render() {
    const {
      className,
      tableType,
      style,
      rowIndex,
      from,
      rowHeight,
      needLineLimit,
      cell,
      error,
      popupContainer,
      editable,
      onClick,
    } = this.props;
    let { value, forceShowFullValue } = this.state;
    const isMobile = browserIsMobile();
    const disabledInput = cell.advancedSetting.dismanual === '1';
    let canedit =
      cell.type === 2 ||
      cell.type === 6 ||
      cell.type === 8 ||
      cell.type === 5 ||
      cell.type === 7 ||
      cell.type === 3 ||
      cell.type === 4;
    canedit = !disabledInput && canedit;
    const isediting = canedit && this.props.isediting;
    if (cell.type === 7) {
      value = (value || '').toUpperCase();
    }
    const isCard = from === FROM.CARD;
    const editProps = {
      ref: this.input,
      value: value,
      style: {
        width: style.width,
        height: style.height,
      },
      onClick: e => e.stopPropagation(),
      onKeyDown: this.handleKeydown,
    };
    if (cell.type === 38 && cell.enumDefault === 3 && cell.advancedSetting.hideneg === '1' && parseInt(value, 10) < 0) {
      value = '';
    }
    const isSafari = /^((?!chrome).)*safari.*$/.test(navigator.userAgent.toLowerCase());
    const isMacWxWork =
      /wxwork/.test(navigator.userAgent.toLowerCase()) && /applewebkit/.test(navigator.userAgent.toLowerCase());
    let text = renderText({ ...cell, value }, { noMask: forceShowFullValue });
    if (text.length > 3000) {
      text = text.slice(0, 3000);
    }
    const editcontent = (
      <ClickAwayable
        onClickAwayExceptions={[this.editIcon && this.editIcon.current]}
        onClickAway={this.handleBlur}
        style={{ fontSize: 0 }}
      >
        {cell.enumDefault === 0 || cell.enumDefault === 2 ? (
          <div
            className={cx('textControlInput cellControlEdittingStatus', { cellControlErrorStatus: error })}
            style={{
              display: 'block',
              width: style.width,
              height: style.height,
            }}
          >
            {isSafari || isMacWxWork ? ( // 子表行内编辑 input 位置会计算异常 改用textarea模拟
              <Input
                className="Ming stopPropagation"
                {...editProps}
                value={String(editProps.value || '').replace(/\r\n|\n/g, ' ')}
                onChange={this.handleChange}
              />
            ) : (
              <input
                type="text"
                className="Ming stopPropagation"
                {...editProps}
                value={String(_.isUndefined(editProps.value) ? '' : editProps.value).replace(/\r\n|\n/g, ' ')}
                style={{}}
                onChange={e => this.handleChange(e.target.value)}
              />
            )}
          </div>
        ) : (
          <Textarea
            className={cx('Ming textControlTextArea cellControlEdittingStatus stopPropagation', {
              isMultipleLine: this.isMultipleLine,
              cellControlErrorStatus: error,
            })}
            {...editProps}
            manualRef={ref => (this.input = { current: ref })}
            style={{
              width: style.width,
              minHeight: rowHeight,
              maxHeight: 154,
              borderRadius: 0,
            }}
            onChange={this.handleChange}
          />
        )}
        {error && <CellErrorTips pos={rowIndex === 0 ? 'bottom' : 'top'} error={error} />}
        {this.isMultipleLine && (
          <MultipleLineTip className="ellipsis">
            {navigator.userAgent.indexOf('Mac OS') > 0 ? _l('⌘+Enter结束编辑') : _l('Ctrl+Enter结束编辑')}
          </MultipleLineTip>
        )}
      </ClickAwayable>
    );
    return (
      <Trigger
        action={['click']}
        popup={editcontent}
        getPopupContainer={popupContainer}
        popupClassName="filterTrigger"
        popupVisible={isediting}
        destroyPopupOnHide={!(navigator.userAgent.match(/[Ss]afari/) && !navigator.userAgent.match(/[Cc]hrome/))} // 不是 Safari
        popupAlign={{
          points: ['tl', 'tl'],
          overflow: {
            adjustY: true,
          },
        }}
      >
        <EditableCellCon
          hideOutline
          onClick={onClick}
          className={cx(className, 'workSheetTextCell', {
            canedit: editable && canedit,
            masked: this.masked && !isCard,
            empty: !value,
            maskHoverTheme: this.masked && isCard && !forceShowFullValue,
            focusInput: cell.type === 2 && editable && canedit,
          })}
          style={style}
          iconName="hr_edit"
          isediting={isediting}
          editable={editable}
          onIconClick={this.handleEdit}
        >
          {!isediting &&
            (!!value || value == 0) &&
            (() => {
              if ((cell.type === 2 || cell.type === 32) && (cell.advancedSetting || {}).analysislink === '1') {
                return (
                  <span
                    className={
                      rowHeight > 34 && (cell.type === 32 || (cell.type === 2 && cell.enumDefault === 1))
                        ? cx('worksheetCellPureString nowrap', {
                            linelimit: needLineLimit,
                            ellipsis: isMobile,
                          })
                        : cx({ 'ellipsis w100 InlineBlock': isCard })
                    }
                    title={text}
                    onClick={this.handleUnMask}
                  >
                    <Linkify
                      properties={{
                        target: '_blank',
                        onClick: e => {
                          e.stopPropagation();
                        },
                      }}
                    >
                      {text}
                    </Linkify>
                  </span>
                );
              } else if (cell.type === 5 && !isMobile) {
                return (
                  <a
                    href={`mailto:${value}`}
                    title={text}
                    onClick={e => {
                      e.stopPropagation();
                      this.handleUnMask(e);
                    }}
                  >
                    {text}
                  </a>
                );
              } else {
                return (
                  <span
                    className={cx({
                      linelimit: needLineLimit,
                      ellipsis: isMobile,
                    })}
                    title={text}
                    onClick={this.handleUnMask}
                  >
                    {text}
                  </span>
                );
              }
            })()}
          {tableType === 'classic' && !text && !isediting && cell.hint && (
            <span className="guideText Gray_bd hide">{cell.hint}</span>
          )}
          {isCard && this.masked && !forceShowFullValue && (
            <i
              className="icon icon-eye_off Hand maskData Font16 Gray_bd mLeft4 mTop4 hoverShow"
              style={{ verticalAlign: 'text-top' }}
              onClick={this.handleUnMask}
            ></i>
          )}
        </EditableCellCon>
      </Trigger>
    );
  }
}
