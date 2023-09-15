import React, { useState, Component, Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { formatNumberFromInput } from 'src/util';
import { Input, Radio, Space } from 'antd';

const ColorWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 3px;
  padding: 4px;
  border: 1px solid #DDDDDD;
  background-color: #fff;
  .colorBlock {
    width: 100%;
    height: 100%;
  }
  .colorInput {
    width: 100%;
    height: 100%;
    opacity: 0;
  }
`;

const QuadrantName = props => {
  const { data, quadrant, onChangeQuadrant } = props;
  const [name, setName] = useState(quadrant[data.textKey] || data.name);
  return (
    <Input
      value={name}
      className="chartInput flex"
      placeholder={data.name}
      onChange={event => {
        setName(event.target.value.slice(0, 20));
      }}
      onBlur={() => {
        onChangeQuadrant({
          [data.textKey]: name
        });
      }}
    />
  );
}

const QuadrantAxisValue = props => {
  const [value, setValue] = useState(props.value);
  return (
    <Input
      value={value}
      className="chartInput mLeft10 flex"
      placeholder={_l('默认')}
      onChange={event => {
        setValue(formatNumberFromInput(event.target.value));
      }}
      onBlur={event => {
        props.onChange(value ? Number(value) : value);
      }}
      onKeyDown={event => {
        event.which === 13 && props.onChange(Number(value ? Number(value) : value));
      }}
    />
  );
}

export default class Quadrant extends Component {
  constructor(props) {
    super(props);
  }
  renderQuadrantItem(data) {
    const { quadrant, onChangeQuadrant } = this.props;
    return (
      <Fragment>
        <div className="flexRow valignWrapper mBottom12">
          <QuadrantName data={data} {...this.props} />
          <ColorWrap className="mLeft10">
            <div className="colorBlock" style={{ backgroundColor: quadrant[data.bgColorKey] }}>
              <input
                type="color"
                className="colorInput pointer"
                value={quadrant[data.bgColorKey]}
                onChange={(event) => {
                  onChangeQuadrant({
                    [data.bgColorKey]: event.target.value
                  });
                }}
              />
            </div>
          </ColorWrap>
        </div>
      </Fragment>
    );
  }
  render() {
    const { quadrant, onChangeQuadrant } = this.props;
    return (
      <Fragment>
        <div className="flexRow valignWrapper mBottom16">
          <div className="mRight10" style={{ width: 60 }}>{_l('象限轴')}</div>
          <ColorWrap>
            <div className="colorBlock" style={{ backgroundColor: quadrant.axisColor }}>
              <input
                type="color"
                className="colorInput pointer"
                value={quadrant.axisColor}
                onChange={(event) => {
                  onChangeQuadrant({
                    axisColor: event.target.value
                  });
                }}
              />
            </div>
          </ColorWrap>
        </div>
        <div className="flexRow valignWrapper mBottom16">
          <div className="mRight10" style={{ width: 60 }}>{_l('文本')}</div>
          <ColorWrap>
            <div className="colorBlock" style={{ backgroundColor: quadrant.textColor }}>
              <input
                type="color"
                className="colorInput pointer"
                value={quadrant.textColor}
                onChange={(event) => {
                  onChangeQuadrant({
                    textColor: event.target.value
                  });
                }}
              />
            </div>
          </ColorWrap>
        </div>
        <div className="mBottom16">
          <div className="mBottom12">{_l('位置')}</div>
          <div className="mTop10">
            <div className="flexRow valignWrapper mBottom10">
              <div>{_l('X轴')}</div>
              <QuadrantAxisValue
                value={quadrant.xValue}
                onChange={(value) => {
                  onChangeQuadrant({ xValue: value });
                }}
              />
            </div>
            <div className="flexRow valignWrapper">
              <div>{_l('Y轴')}</div>
              <QuadrantAxisValue
                value={quadrant.yValue}
                onChange={(value) => {
                  onChangeQuadrant({ yValue: value });
                }}
              />
            </div>
          </div>
        </div>
        <div className="mBottom16">
          <div className="mBottom12">{_l('象限名称和背景色')}</div>
          {this.renderQuadrantItem({
            textKey: 'topRightText',
            bgColorKey: 'topRightBgColor',
            name: _l('右上象限'),
          })}
          {this.renderQuadrantItem({
            textKey: 'topLeftText',
            bgColorKey: 'topLeftBgColor',
            name: _l('左上象限'),
          })}
          {this.renderQuadrantItem({
            textKey: 'bottomLeftText',
            bgColorKey: 'bottomLeftBgColor',
            name: _l('左下象限'),
          })}
          {this.renderQuadrantItem({
            textKey: 'bottomRightText',
            bgColorKey: 'bottomRightBgColor',
            name: _l('右下象限'),
          })}
        </div>
      </Fragment>
    );
  }
}
