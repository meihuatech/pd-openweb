import React from 'react';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import styled from 'styled-components';
import { Slider } from 'ming-ui';
import cx from 'classnames';
import { FROM } from './enum';
import { autobind } from 'core-decorators';
import _ from 'lodash';

const ClickAway = createDecoratedComponent(withClickAway);

const Con = styled.div`
  ${({ isCard }) =>
    isCard
      ? `
  height: 100%;
  align-items: center;
  `
      : ''}
  &.canedit:hover {
    .OperateIcon {
      display: inline-block;
    }
  }
`;

const EditingCon = styled.div`
  padding: 7px 6px;
  background: #fff;
  box-shadow: inset 0 0 0 2px #2d7ff9 !important;
`;

const OperateIcon = styled.div`
  display: none;
  margin: -7px -6px 0 2px;
  width: 34px;
  height: 34px;
  text-align: center;
  line-height: 34px;
  color: #9e9e9e;
  font-size: 16px;
  cursor: pointer;
`;

function levelSafeParse(value) {
  let levelValue = parseFloat(value, 10);
  if (!_.isNumber(levelValue) || _.isNaN(levelValue)) {
    levelValue = undefined;
  }
  return levelValue;
}
export default class NumberSlider extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    rowHeight: PropTypes.number,
    isediting: PropTypes.bool,
    cell: PropTypes.shape({}),
    updateCell: PropTypes.func,
    onClick: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    popupContainer: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: levelSafeParse(props.cell.value),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: levelSafeParse(nextProps.cell.value) });
    }
  }

  get prevValueId() {
    const { rowIndex, cell } = this.props;
    return `numberSlider-${rowIndex}-${cell.controlId}`;
  }

  @autobind
  handleTableKeyDown(e) {
    const { cell, isediting, updateEditingStatus, updateCell } = this.props;
    const { min, max, numinterval } = cell.advancedSetting || {};
    const minNumber = levelSafeParse(min);
    const maxNumber = levelSafeParse(max);
    if (isediting && (e.key === 'Escape' || (e.key === 'Enter' && String(this.state.value) !== cell.value))) {
      updateEditingStatus(false);
      this.handleExit();
    } else if (isediting && _.includes(['ArrowUp', 'ArrowDown'], e.key)) {
      const step = levelSafeParse(numinterval);
      const value = levelSafeParse(this.state.value || min);
      const newValue = value + step * (e.key === 'ArrowUp' ? 1 : -1);
      if (newValue < minNumber || newValue > maxNumber) {
        return;
      }
      if (_.isNumber(newValue) && !_.isNaN(newValue)) {
        this.setState({ value: newValue });
      }
    } else if (/^[0-9]$/.test(e.key)) {
      let inputValue = Number(e.key);
      const { prevValueId } = this;
      if (!_.isNaN(inputValue)) {
        if (window[prevValueId]) {
          inputValue = Number(window[prevValueId] + '' + inputValue);
        }
        if (
          !_.isUndefined(minNumber) &&
          !_.isUndefined(maxNumber) &&
          (inputValue < minNumber || inputValue > maxNumber)
        ) {
          return;
        }
        window[prevValueId] = inputValue;
        setTimeout(() => {
          window[prevValueId] = undefined;
        }, 500);
        updateCell({
          value: inputValue,
        });
      }
    }
  }

  @autobind
  handleChange(value) {
    const { updateCell, updateEditingStatus } = this.props;
    this.setState({ value });
    updateEditingStatus(false);
    updateCell({
      value,
    });
  }

  @autobind
  handleExit() {
    const { updateEditingStatus, updateCell } = this.props;
    const { value } = this.state;
    updateEditingStatus(false);
    if (value !== this.props.cell.value) {
      updateCell({ value: this.state.value });
    }
  }

  render() {
    const {
      from,
      className,
      style,
      cell = {},
      isediting,
      rowHeight = 34,
      rowIndex,
      editable,
      onClick,
      popupContainer,
      updateEditingStatus,
    } = this.props;
    const { numinterval, min, max, itemcolor, itemnames, numshow } = cell.advancedSetting || {};
    const { value } = this.state;
    const sliderComp = (
      <Slider
        style={from === FROM.CARD ? { padding: 0 } : {}}
        readonly={!isediting}
        disabled={!editable}
        value={value}
        showInput={false}
        showTip={isediting}
        showScale={from !== FROM.CARD}
        showScaleText={isediting || rowHeight > 50}
        showAsPercent={numshow === '1'}
        numStyle={from === FROM.CARD ? { color: '#333' } : {}}
        tipDirection={rowIndex === 0 ? 'bottom' : undefined}
        min={levelSafeParse(min)}
        max={levelSafeParse(max)}
        step={levelSafeParse(numinterval)}
        itemnames={itemnames ? JSON.parse(itemnames) : ''}
        itemcolor={itemcolor ? JSON.parse(itemcolor) : ''}
        onChange={this.handleChange}
      />
    );
    if (isediting) {
      return (
        <Trigger
          zIndex={99}
          popup={
            <ClickAway onClickAway={this.handleExit}>
              <EditingCon style={{ width: style.width, minHeight: style.height }}>{sliderComp}</EditingCon>
            </ClickAway>
          }
          getPopupContainer={popupContainer}
          popupClassName="filterTrigger"
          popupVisible={isediting}
          destroyPopupOnHide
          popupAlign={{
            points: ['tl', 'tl'],
          }}
        >
          <div className={className} style={style} onClick={onClick} />
        </Trigger>
      );
    }
    return (
      <Con
        isCard={from === FROM.CARD}
        className={cx(className, 'cellControl flexRow', {
          canedit: editable,
        })}
        style={style}
        onClick={onClick}
      >
        <div className="flex">{sliderComp}</div>
        {editable && (
          <OperateIcon className="OperateIcon editIcon">
            <i className="ThemeHoverColor3 icon icon-edit" onClick={() => updateEditingStatus(true)} />
          </OperateIcon>
        )}
      </Con>
    );
  }
}
