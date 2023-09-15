import React, { Component } from 'react';
import { Gauge, G2 } from '@antv/g2plot';
import { formatYaxisList, formatrChartValue, formatControlInfo, getChartColors, getStyleColor } from './common';
import { formatSummaryName, isFormatNumber } from 'statistics/common';
const { Util, registerShape } = G2;

registerShape('point', 'custom-gauge-indicator', {
  draw(cfg, container) {
    // 使用 customInfo 传递参数
    const { indicator, defaultColor } = cfg.customInfo;
    const { pointer, pin } = indicator;

    const group = container.addGroup();
    // 获取极坐标系下画布中心点
    const center = this.parsePoint({ x: 0, y: 0 });

    if (pin) {
      const pinStyle = pin.style || {};
      const { lineWidth = 2, fill = defaultColor } = pinStyle;
      const r = 6;
      group.addShape('circle', {
        name: 'pin-outer',
        attrs: {
          x: center.x,
          y: center.y,
          ...pin.style,
          fill,
          r: r * 1.5,
          lineWidth,
        },
      });
    }
    // 绘制指针
    if (pointer) {
      const { startAngle, endAngle } = Util.getAngle(cfg, this.coordinate);
      const radius = this.coordinate.getRadius();
      const midAngle = (startAngle + endAngle) / 2;
      const { x: x1, y: y1 } = Util.polarToCartesian(center.x, center.y, radius / 15, midAngle + 1 / Math.PI);
      const { x: x2, y: y2 } = Util.polarToCartesian(center.x, center.y, radius / 15, midAngle - 1 / Math.PI);
      const { x, y } = Util.polarToCartesian(center.x, center.y, radius * 0.65, midAngle);
      const { x: x0, y: y0 } = Util.polarToCartesian(center.x, center.y, radius * 0.1, midAngle + Math.PI);
      const sa = Math.PI / 2 + midAngle;
      const r1 = 5.5;
      const p1 = {
        x: center.x + Math.cos(sa) * r1,
        y: center.y + Math.sin(sa) * r1,
      };
      const p2 = {
        x: center.x - Math.cos(sa) * r1,
        y: center.y - Math.sin(sa) * r1,
      };
      const r2 = r1 / 4;
      const p11 = {
        x: x + Math.cos(sa) * r2,
        y: y + Math.sin(sa) * r2,
      };
      const p21 = {
        x: x - Math.cos(sa) * r2,
        y: y - Math.sin(sa) * r2,
      };

      const path = [
        ['M', p21.x, p21.y],
        // 参数信息: cx, cy, .., .., .., endPointX, endPointY
        ['A', r2, r2, 0, 0, 1, p11.x, p11.y],
        ['L', p1.x, p1.y],
        ['A', r1, r1, 0, 0, 1, p2.x, p2.y],
        ['Z'],
      ];
      // pointer
      group.addShape('path', {
        name: 'pointer',
        attrs: {
          path,
          fill: defaultColor,
          lineCap: 'round',
          ...pointer.style,
        },
      });
      // pointer
      group.addShape('circle', {
        name: 'pointer-center',
        attrs: {
          x: center.x,
          y: center.y,
          r: 2,
          fill: '#fff',
        },
      });
    }

    return group;
  }
});

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownVisible: false,
      offset: {},
      match: null
    }
    this.GaugeChart = null;
  }
  componentDidMount() {
    this.renderGaugeChart(this.props);
  }
  componentWillUnmount() {
    this.GaugeChart && this.GaugeChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    if (
      displaySetup.showDimension !== oldDisplaySetup.showDimension ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.showPercent !== oldDisplaySetup.showPercent ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      !_.isEqual(displaySetup.colorRules, oldDisplaySetup.colorRules) ||
      !_.isEqual(style, oldStyle)
    ) {
      const GaugeChartConfig = this.getComponentConfig(nextProps);
      this.GaugeChart.update(GaugeChartConfig);
    }
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      nextProps.direction !== this.props.direction
    ) {
      this.GaugeChart.destroy();
      setTimeout(() => {
        this.renderGaugeChart(nextProps);
      }, 0);
    }
  }
  renderGaugeChart(props) {
    const { reportData } = props;
    const GaugeChartConfig = this.getComponentConfig(props);
    this.GaugeChart = new Gauge(this.chartEl, GaugeChartConfig);
    this.GaugeChart.render();
  }
  getComponentConfig(props) {
    const { reportData, isThumbnail } = props;
    const { map, yaxisList, displaySetup, style } = reportData;
    const { showChartType, showDimension, showNumber, showPercent, colorRules } = displaySetup;
    const { indicatorVisible, fontColor = 'rgba(0, 0, 0, 1)', gaugeColor, gaugeColorType = 1, sectionColorConfig = {}, isApplyGaugeColor } = style;
    const scaleType = _.isUndefined(style.scaleType) ? 1 : style.scaleType;
    const numberControlId = _.get(yaxisList[0], 'controlId');
    const numberControlName = _.get(yaxisList[0], 'rename') || _.get(yaxisList[0], 'controlName');
    const data = map[numberControlId];
    const { clientHeight } = this.chartEl;
    const colors = getChartColors(style);
    const fontColorRule = _.get(colorRules[0], 'dataBarRule') || {};
    const gaugeColorRule = _.get(colorRules[1], 'dataBarRule') || {};
    const maxValue = data.max || 1;
    const percent = data.value <= data.min ? 0 : (data.value - data.min) / (maxValue - data.min);
    const getOffset = () => {
      if (showChartType === 1) {
        return clientHeight / 7;
      }
      if (showChartType === 2) {
        return 0;
      }
      return clientHeight / 9;
    }
    const getFontColor = () => {
      if (isApplyGaugeColor) {
        if (gaugeColorType === 1) {
          return getGaugeColor();
        } else {
          const ticks = getTicks();
          const sectionColors = getSectionColors();
          const getIndex = () => {
            let index = null;
            ticks.forEach((n, i) => {
              if (n >= percent && _.isNull(index)) {
                index = i;
              }
            });
            return index - 1;
          }
          return sectionColors[getIndex()];
        }
      } else if (_.isEmpty(fontColorRule)) {
        return fontColor;
      } else {
        const controlId = yaxisList[0].controlId;
        const color = getStyleColor({
          value: data.value,
          controlMinAndMax: {
            [controlId]: {
              min: data.min,
              max: data.max,
              center: (data.max + data.min) / 2
            }
          },
          rule: fontColorRule,
          controlId
        });
        return color || fontColor;
      }
    }
    const getGaugeColor = () => {
      if (_.isEmpty(gaugeColorRule)) {
        return gaugeColor || colors[0];
      } else {
        const controlId = yaxisList[0].controlId;
        const color = getStyleColor({
          value: Number((percent * 100).toFixed(0)),
          controlMinAndMax: {
            [controlId]: {
              min: data.min,
              max: data.max,
              center: (data.max + data.min) / 2
            }
          },
          rule: gaugeColorRule,
          controlId
        });
        return color || gaugeColor || colors[0];
      }
    }
    const getSectionColors = () => {
      const { sectionColors = [] } = sectionColorConfig;
      return sectionColors.map((data, index) => data.color || colors[index]).reverse();
    }
    const getTicks = () => {
      const { sectionColors = [] } = sectionColorConfig;
      return [0].concat(_.cloneDeep(sectionColors).reverse().map(data => data.value / 100));
    }
    const base = {
      percent,
      appendPadding: [20, 10, showChartType == 2 ? 65 : 50, 10],
      range: {
        color: gaugeColorType === 2 && !_.isEmpty(sectionColorConfig) ? getSectionColors() : getGaugeColor(),
        ticks: gaugeColorType === 2 && !_.isEmpty(sectionColorConfig) ? getTicks() : undefined,
        width: 32
      },
      indicator: {
        shape: 'custom-gauge-indicator',
        pointer: {
          style: {
            stroke: '#D0D0D0',
            lineWidth: 1,
            fill: '#333',
          },
        },
        pin: {
          style: {
            lineWidth: 2,
            stroke: '#D0D0D0',
            fill: '#D0D0D0',
          },
        },
      },
      axis: {
        label: {
          offset: scaleType === 2 ? -24 : (isThumbnail ? getOffset() : 60),
          formatter(value) {
            if (scaleType === null) {
              return undefined;
            }
            if (scaleType === 1) {
              if (value == 0) {
                return formatrChartValue(data.min, false, yaxisList);
              }
              if (value == 1) {
                return formatrChartValue(data.max, false, yaxisList);
              }
              return undefined;
            } else {
              return `${value * 100}%`;
            }
          },
        },
        tickLine: scaleType === null ? false : {
          style: (item, index) => {
            if (scaleType === 1) {
              return {
                strokeOpacity: 0
              }
            } else {
              return item;
            }
          }
        },
        subTickLine: {
          count: 0,
        },
      },
      statistic: {
        content: (showNumber || showPercent) ? {
          formatter: ({ percent }) => {
            const value = formatrChartValue(data.value, false, yaxisList);
            const percentValue = `(${(percent * 100).toFixed(0)}%)`;
            return `${showNumber ? value : ''} ${showPercent ? percentValue : ''}`;
          },
          style: {
            color: getFontColor(),
            fontSize: '20px',
            lineHeight: '24px',
            width: '50%',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: 'block',
          },
          offsetY: showChartType == 2 ? clientHeight / 2 : 40
        } : null,
        title: showDimension ? {
          formatter: ({ percent }) => `${numberControlName}`,
          style: {
            color: '#9e9e9e',
            lineHeight: 4,
            fontSize: '13px',
          },
          offsetY: showChartType == 2 ? clientHeight / 2 : 43
        } : null
      },
    }
    if (indicatorVisible === false) {
      base.indicator.pointer = null;
      base.indicator.pin = null;
    }
    if (showChartType == 2) {
      base.startAngle = Math.PI + 0.6;
      base.endAngle = 2 * Math.PI - 0.6;
      base.range.width = isThumbnail ? 44 : 64;
      base.axis.label.offset = -24;
    }
    if (showChartType === 3) {
      base.type = 'meter';
      base.meter = {
        stepRatio: 0.7
      }
    }
    return base;
  }
  render() {
    const { displaySetup = {} } = this.props.reportData;
    return (
      <div className="flex flexColumn chartWrapper">
        <div className={displaySetup.showTotal ? 'showTotalHeight' : 'h100'} ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
