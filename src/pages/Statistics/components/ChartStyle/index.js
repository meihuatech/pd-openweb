import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Collapse, Checkbox, Switch, Input, Tooltip, Select } from 'antd';
import { Count, Location } from './components/Count';
import DataFilter from './components/DataFilter';
import Label from './components/Label';
import XAxis from './components/XAxis';
import yAxisPanelGenerator, { bidirectionalBarChartYAxisPanelGenerator } from './components/YAxis';
import Quadrant from './components/Quadrant';
import MeasureAxis from './components/MeasureAxis';
import unitPanelGenerator from './components/Unit';
import { gaugeColorPanelGenerator, scalePanelGenerator, indicatorPanelGenerator } from './components/GaugeChartConfig';
import numberStylePanelGenerator, { numberSummaryPanelGenerator } from './components/NumberStyle';
import Color from './components/Color/index';
import PivotTableFieldColor from './components/PivotTableFieldColor/index';
import PreinstallStyle from './components/PreinstallStyle';
import TitleStyle from './components/TitleStyle';
import SubLineCount from './components/SubLineCount';
import topChartPanelGenerator from './components/TopChartPanel';
import { reportTypes, LegendTypeData } from 'statistics/Charts/common';
import { isTimeControl, isNumberControl } from 'statistics/common';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';
import './index.less';
import _ from 'lodash';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'reportData', 'worksheetInfo'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartStyle extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeDisplaySetup = (data, isRequest = false) => {
    this.props.changeCurrentReport({
      displaySetup: data
    }, isRequest);
  }
  handleChangeDisplayValue = (key, value, isRequest) => {
    const { displaySetup } = this.props.currentReport;
    this.handleChangeDisplaySetup(
      {
        ...displaySetup,
        [key]: value,
      },
      isRequest,
    );
  }
  handleChangeStyle = (data, isRequest = false) => {
    const { style } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        style: {
          ...style,
          ...data
        }
      },
      isRequest
    );
  }
  renderCount() {
    const { reportType, displaySetup, summary, yaxisList, rightY, pivotTable = {} } = this.props.currentReport;
    const isDualAxes = reportType === reportTypes.DualAxes;
    const isMultiaxis = [reportTypes.DualAxes, reportTypes.BidirectionalBarChart].includes(reportType);
    const dualAxesSwitchChecked = summary.showTotal || (rightY ? rightY.summary.showTotal : null);
    const switchChecked = isMultiaxis ? dualAxesSwitchChecked : displaySetup.showTotal;
    return (
      <Collapse.Panel
        key="count"
        header={_l('总计')}
        className={cx({ collapsible: !switchChecked })}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              if (isMultiaxis) {
                this.props.changeCurrentReport(
                  {
                    displaySetup: {
                      ...displaySetup,
                      showTotal: false,
                    },
                    summary: {
                      ...summary,
                      showTotal: checked,
                    },
                    rightY: {
                      ...rightY,
                      summary: {
                        ...rightY.summary,
                        showTotal: checked,
                      },
                    },
                  },
                  true,
                );
              } else {
                this.handleChangeDisplayValue('showTotal', checked, true);
              }
            }}
          />
        }
      >
        <Fragment>
          <Count
            smallTitle={
              isMultiaxis ? (
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={summary.showTotal}
                  onChange={() => {
                    this.props.changeCurrentReport(
                      {
                        displaySetup: {
                          ...displaySetup,
                          showTotal: false,
                        },
                        summary: {
                          ...summary,
                          showTotal: !summary.showTotal,
                        },
                      },
                      true,
                    );
                  }}
                >
                  {isDualAxes ? _l('Y轴') : _l('数值(1)')}
                </Checkbox>
              ) : null
            }
            summary={summary || {}}
            yaxisList={yaxisList}
            onChangeSummary={(data, isRequest = true) => {
              this.props.changeCurrentReport(
                {
                  summary: {
                    ...summary,
                    ...data,
                  },
                },
                isRequest,
              );
            }}
          />
          {isMultiaxis && (
            <Count
              smallTitle={
                isMultiaxis ? (
                  <Checkbox
                    className="mLeft0 mBottom15"
                    checked={rightY.summary.showTotal}
                    onChange={() => {
                      this.props.changeCurrentReport(
                        {
                          displaySetup: {
                            ...displaySetup,
                            showTotal: false,
                          },
                          rightY: {
                            ...rightY,
                            summary: {
                              ...rightY.summary,
                              showTotal: !rightY.summary.showTotal,
                            },
                          },
                        },
                        true,
                      );
                    }}
                  >
                    {isDualAxes ? _l('辅助Y轴') : _l('数值(2)')}
                  </Checkbox>
                ) : null
              }
              summary={rightY.summary || {}}
              yaxisList={rightY.yaxisList}
              onChangeSummary={(data, isRequest = true) => {
                this.props.changeCurrentReport(
                  {
                    rightY: {
                      ...rightY,
                      summary: {
                        ...rightY.summary,
                        ...data,
                      },
                    },
                  },
                  isRequest,
                );
              }}
            />
          )}
        </Fragment>
      </Collapse.Panel>
    );
  }
  renderNumberCount() {
    return numberSummaryPanelGenerator({ ...this.props, onChangeDisplayValue: this.handleChangeDisplayValue });
  }
  handleChangeLineSummary = (data, isRequest = true) => {
    const { pivotTable = {} } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        pivotTable: {
          ...pivotTable,
          lineSummary: {
            ...pivotTable.lineSummary,
            ...data,
          },
        },
      },
      isRequest
    );
  }
  handleChangeColumnSummary = (data, isRequest = true) => {
    const { pivotTable = {} } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        pivotTable: {
          ...pivotTable,
          columnSummary: {
            ...pivotTable.columnSummary,
            ...data,
          },
        },
      },
      isRequest
    );
  }
  renderNumberStyle() {
    return numberStylePanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle,
      onChangeDisplayValue: this.handleChangeDisplayValue
    });
  }
  renderPreinstallStyle() {
    const { style } = this.props.currentReport;
    return (
      <Collapse.Panel
        key="preinstallStyle"
        header={_l('表')}
      >
        <PreinstallStyle
          style={style}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderCell() {
    const { style } = this.props.currentReport;
    return (
      <Collapse.Panel
        key="cell"
        header={_l('单元格')}
      >
        <TitleStyle
          type="cell"
          style={style}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderLineTitleStyle() {
    const { style, pivotTable } = this.props.currentReport;
    return (
      <Collapse.Panel
        key="lineTitleStyle"
        header={_l('行标题')}
      >
        <TitleStyle
          type="line"
          style={style}
          pivotTable={pivotTable}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderColumnTitleStyle() {
    const { style } = this.props.currentReport;
    return (
      <Collapse.Panel
        key="columnTitleStyle"
        header={_l('列标题')}
      >
        <TitleStyle
          type="column"
          style={style}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderSubLineCount() {
    const { currentReport, changeCurrentReport } = this.props;
    const { lines } = currentReport.pivotTable;
    const switchChecked = !!lines.slice(1, lines.length).filter(n => n.subTotal).length;
    return (
      <Collapse.Panel
        key="subLineCount"
        header={_l('行小计')}
        className={cx({ collapsible: !switchChecked })}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.props.changeCurrentReport(
                {
                  pivotTable: {
                    ...currentReport.pivotTable,
                    lines: lines.map((n, index) => {
                      if (index) {
                        return {
                          ...n,
                          subTotal: checked
                        }
                      } else {
                        return n;
                      }
                    })
                  },
                },
                true,
              );
            }}
          />
        }
      >
        <SubLineCount
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
        />
      </Collapse.Panel>
    );
  }
  renderPivotTableLineCount() {
    const { reportType, displaySetup, yaxisList, pivotTable = {} } = this.props.currentReport;
    const { showLineTotal, lineSummary = {} } = pivotTable;
    const { controlList = [], rename } = lineSummary;
    return (
      <Collapse.Panel
        key="lineCount"
        header={_l('行总计')}
        className={cx({ collapsible: !showLineTotal })}
        extra={
          <Switch
            size="small"
            checked={showLineTotal}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.props.changeCurrentReport(
                {
                  pivotTable: {
                    ...pivotTable,
                    showLineTotal: checked
                  },
                },
                true,
              );
            }}
          />
        }
      >
        <Fragment>
          <div className="mBottom16">
            <div className="mBottom8">{_l('名称')}</div>
            <Input
              defaultValue={rename || _l('行汇总')}
              className="chartInput w100"
              onChange={event => {
                this.handleChangeLineSummary(
                  {
                    rename: event.target.value.slice(0, 20),
                  },
                  false,
                );
              }}
            />
          </div>
          <Location
            summary={lineSummary}
            locationType="line"
            onChangeSummary={this.handleChangeLineSummary}
          />
          {yaxisList.filter(item => isNumberControl(item.controlType) ? true : item.normType !== 7).map(item => (
            <Count
              key={item.controlId}
              yAxis={item}
              isPivotTable={true}
              extra={
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={!!_.find(controlList, { controlId: item.controlId })}
                  onChange={(event) => {
                    const id = item.controlId;
                    if (event.target.checked) {
                      const data = {
                        controlId: id,
                        name: '',
                        sum: 0,
                        type: 1
                      }
                      this.props.changeCurrentReport(
                        {
                          pivotTable: {
                            ...pivotTable,
                            lineSummary: {
                              ...lineSummary,
                              controlList: controlList.concat(data)
                            }
                          },
                        },
                        true,
                      );
                    } else {
                      this.props.changeCurrentReport(
                        {
                          pivotTable: {
                            ...pivotTable,
                            lineSummary: {
                              ...lineSummary,
                              controlList: controlList.filter(item => item.controlId !== id)
                            }
                          },
                        },
                        true,
                      );
                    }
                  }}
                >
                  {item.controlName}
                </Checkbox>
              }
              summary={_.find(controlList, { controlId: item.controlId }) || { type: 1 }}
              onChangeSummary={(data, isRequest = true) => {
                const id = item.controlId;
                const newControlList = controlList.map(item => {
                  if (id === item.controlId) {
                    return {
                      ...item,
                      ...data
                    }
                  } else {
                    return item;
                  }
                });
                this.props.changeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      lineSummary: {
                        ...lineSummary,
                        controlList: newControlList
                      }
                    },
                  },
                  isRequest,
                );
              }}
            />
          ))}
        </Fragment>
      </Collapse.Panel>
    );
  }
  renderPivotTableColumnCount() {
    const { reportType, displaySetup, yaxisList, pivotTable = {} } = this.props.currentReport;
    const { showColumnTotal, columnSummary = {} } = pivotTable;
    const { controlList = [], rename } = columnSummary;
    const onChangeCountVisible = (id, checked, data) => {
      if (checked) {
        const control = {
          controlId: id,
          name: '',
          sum: 0,
          type: 1,
          ...data
        }
        this.props.changeCurrentReport(
          {
            pivotTable: {
              ...pivotTable,
              columnSummary: {
                ...columnSummary,
                controlList: controlList.concat(control)
              }
            },
          },
          true,
        );
      } else {
        this.props.changeCurrentReport(
          {
            pivotTable: {
              ...pivotTable,
              columnSummary: {
                ...columnSummary,
                controlList: controlList.filter(item => item.controlId !== id)
              }
            },
          },
          true,
        );
      }
    }
    const onChangeSummary = (id, data, isRequest = true) => {
      const newControlList = controlList.map(item => {
        if (id === item.controlId) {
          return {
            ...item,
            ...data
          }
        } else {
          return item;
        }
      }).filter(item => item.number || item.percent);
      this.props.changeCurrentReport(
        {
          pivotTable: {
            ...pivotTable,
            columnSummary: {
              ...columnSummary,
              controlList: newControlList
            }
          },
        },
        isRequest,
      );
    }
    const renderExtra = (item) => {
      const control = _.find(controlList, { controlId: item.controlId });
      return (
        <Fragment>
          <div className="mBottom5 bold">{item.controlName}</div>
          <div className="flexRow valignWrapper mBottom15">
            <Checkbox
              className="flex"
              checked={control ? control.number : false}
              onChange={(event) => {
                const { checked } = event.target;
                const id = item.controlId;
                if (control) {
                  onChangeSummary(id, { number: checked });
                } else {
                  onChangeCountVisible(id, checked, checked ? { number: true, percent: false } : undefined);
                }
              }}
            >
              {_l('数值')}
            </Checkbox>
            <Checkbox
              className="flex"
              checked={control ? control.percent : false}
              onChange={(event) => {
                const { checked } = event.target;
                const id = item.controlId;
                if (control) {
                  onChangeSummary(id, { percent: checked });
                } else {
                  onChangeCountVisible(id, checked, checked ? { number: false, percent: true } : undefined);
                }
              }}
            >
              {_l('百分比')}
            </Checkbox>
          </div>
        </Fragment>
      );
    }
    return (
      <Collapse.Panel
        key="columnCount"
        header={_l('列总计')}
        className={cx({ collapsible: !showColumnTotal })}
        extra={
          <Switch
            size="small"
            checked={showColumnTotal}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.props.changeCurrentReport(
                {
                  pivotTable: {
                    ...pivotTable,
                    showColumnTotal: checked
                  },
                },
                true,
              );
            }}
          />
        }
      >
        <Fragment>
          <div className="mBottom16">
            <div className="mBottom8">{_l('名称')}</div>
            <Input
              defaultValue={rename || _l('列汇总')}
              className="chartInput w100"
              onChange={event => {
                this.handleChangeColumnSummary(
                  {
                    rename: event.target.value.slice(0, 20),
                  },
                  false,
                );
              }}
            />
          </div>
          <Location
            summary={columnSummary}
            locationType="column"
            onChangeSummary={this.handleChangeColumnSummary}
          />
          {yaxisList.filter(item => isNumberControl(item.controlType) ? true : item.normType !== 7).map(item => (
            <Count
              key={item.controlId}
              yAxis={item}
              isPivotTable={true}
              extra={renderExtra(item)}
              summary={_.find(controlList, { controlId: item.controlId }) || { type: 1 }}
              onChangeSummary={(data, isRequest) => {
                onChangeSummary(item.controlId, data, isRequest);
              }}
            />
          ))}
        </Fragment>
      </Collapse.Panel>
    );
  }
  renderLegend() {
    const { displaySetup, yaxisList, split, reportType } = this.props.currentReport;

    if ([reportTypes.LineChart, reportTypes.BarChart, reportTypes.RadarChart].includes(reportType) && !(yaxisList.length > 1 || split.controlId)) {
      return null;
    }

    return (
      <Collapse.Panel
        key="legend"
        header={_l('图例')}
        className={cx({ collapsible: !displaySetup.showLegend })}
        extra={
          <Switch
            size="small"
            checked={displaySetup.showLegend}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplayValue('showLegend', checked, true);
            }}
          />
        }
      >
        <div className="mBottom8">{_l('位置')}</div>
        <div className="chartTypeSelect flexRow valignWrapper mBottom16">
          {LegendTypeData.map(item => (
            <div
              key={item.value}
              className={cx('flex centerAlign pointer Gray_75', { active: displaySetup.legendType == item.value })}
              onClick={() => {
                this.handleChangeDisplayValue('legendType', item.value);
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      </Collapse.Panel>
    );
  }
  renderLabel() {
    const { currentReport } = this.props;
    const { showNumber, showPileTotal, hideOverlapText } = currentReport.displaySetup;
    const switchChecked = showNumber || showPileTotal || hideOverlapText;
    return (
      <Collapse.Panel
        key="label"
        header={_l('数据标签')}
        className={cx({ collapsible: !switchChecked })}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplaySetup({
                ...currentReport.displaySetup,
                showNumber: checked,
                showDimension: checked,
                showPercent: checked,
                showPileTotal: checked,
                hideOverlapText: checked,
              });
              this.handleChangeStyle({ showLabelPercent: checked });
            }}
          />
        }
      >
        <Label
          currentReport={currentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
          onUpdateDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderGaugeColor() {
    return gaugeColorPanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle,
      onChangeDisplayValue: this.handleChangeDisplayValue
    });
  }
  renderScale() {
    return scalePanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle
    });
  }
  renderIndicator() {
    return indicatorPanelGenerator({
      ...this.props,
      onChangeStyle: this.handleChangeStyle
    });
  }
  renderLayout() {
    const { currentReport } = this.props;
    const { style } = currentReport;
    const columnCount = style.columnCount || 1;

    const changeColumnCount = _.debounce(value => {
      if (value) {
        value = parseInt(value);
        value = isNaN(value) ? 0 : value;
        value = value > 4 ? 4 : value;
      } else {
        value = 1;
      }
      this.handleChangeStyle({ columnCount: value });
    }, 100);

    return (
      <Collapse.Panel
        key="layout"
        header={ _l('布局')}
      >
        <div>
          <div className="flexRow valignWrapper mBottom12">
            <div style={{ width: 90 }}>{_l('每行显示个数')}</div>
            <Input
              className="chartInput columnCountInput"
              style={{ width: 78 }}
              value={columnCount}
              onChange={event => {
                changeColumnCount(event.target.value);
              }}
              suffix={
                <div className="flexColumn">
                  <Icon
                    icon="expand_less"
                    className={cx('Font20 pointer mBottom2', columnCount === 4 ? 'disabled' : 'Gray_9e')}
                    onClick={() => {
                      let value = Number(columnCount);
                      changeColumnCount(value + 1);
                    }}
                  />
                  <Icon
                    icon="expand_more"
                    className={cx('Font20 pointer mBottom2', columnCount === 1 ? 'disabled' : 'Gray_9e')}
                    onClick={() => {
                      let value = Number(columnCount);
                      changeColumnCount(value - 1);
                    }}
                  />
                </div>
              }
            />
          </div>
          <div className="flexRow valignWrapper mTop16 mBottom16">
            <Checkbox
              checked={style.allowScroll}
              onChange={(e) => {
                this.handleChangeStyle({ allowScroll: e.target.checked });
              }}
            >
              {_l('允许容器内滚动')}
            </Checkbox>
            <Tooltip title={_l('当统计项较多时，勾选此配置可以在容器内滚动查看')} placement="bottom" arrowPointAtCenter>
              <Icon className="Gray_9e Font18 pointer" icon="knowledge-message" />
            </Tooltip>
          </div>
        </div>
      </Collapse.Panel>
    );
  }
  renderXAxis() {
    const { currentReport } = this.props;
    const { xdisplay, fontStyle, showChartType } = currentReport.displaySetup;
    const switchChecked = !!fontStyle || xdisplay.showDial || xdisplay.showTitle;
    const isBarChart = currentReport.reportType === reportTypes.BarChart;
    const isBidirectionalBarChart = currentReport.reportType === reportTypes.BidirectionalBarChart;
    const isVertical = isBarChart && showChartType === 2;
    return (
      <Collapse.Panel
        key="xAxis"
        header={isVertical ? _l('Y轴') : isBidirectionalBarChart ? _l('维度轴') : _l('X轴')}
        className={cx({ collapsible: !switchChecked })}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplaySetup({
                ...currentReport.displaySetup,
                fontStyle: checked ? 1 : 0,
                xdisplay: {
                  ...xdisplay,
                  showDial: checked,
                  showTitle: checked,
                },
              });
            }}
          />
        }
      >
        <XAxis currentReport={currentReport} onChangeDisplayValue={this.handleChangeDisplayValue} />
      </Collapse.Panel>
    );
  }
  renderYAxis() {
    const { currentReport } = this.props;
    const isBidirectionalBarChart = currentReport.reportType === reportTypes.BidirectionalBarChart;
    return isBidirectionalBarChart ? bidirectionalBarChartYAxisPanelGenerator(this.props) : yAxisPanelGenerator(this.props);
  }
  renderQuadrant() {
    const { style } = this.props.currentReport;
    const { quadrant = {} } = style;
    return (
      <Collapse.Panel
        key="quadrant"
        header={_l('四象限')}
        className={cx({ collapsible: !quadrant.visible })}
        extra={
          <Switch
            size="small"
            checked={quadrant.visible}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              const defaultQuadrant = {
                axisColor: '#9e9e9e',
                topRightBgColor: '#F44336',
                topRightText: _l('右上象限'),
                topLeftBgColor: '#FFA340',
                topLeftText: _l('左上象限'),
                bottomLeftBgColor: '#4CAF50',
                bottomLeftText: _l('左下象限'),
                bottomRightBgColor: '#2196F3',
                bottomRightText: _l('右下象限'),
                textColor: '#9e9e9e'
              }
              this.handleChangeStyle({
                quadrant: {
                  ...(_.isEmpty(quadrant) ? defaultQuadrant : quadrant),
                  visible: checked
                }
              });
            }}
          />
        }
      >
        <Quadrant
          quadrant={quadrant}
          onChangeQuadrant={(data) => {
            this.handleChangeStyle({
              quadrant: {
                ...quadrant,
                ...data
              }
            });
          }}
        />
      </Collapse.Panel>
    );
  }
  renderMeasureAxis() {
    const { currentReport } = this.props;
    return (
      <Collapse.Panel
        key="measureAxis"
        header={_l('测量轴')}
      >
        <MeasureAxis currentReport={currentReport} onChangeDisplayValue={this.handleChangeDisplayValue} />
      </Collapse.Panel>
    );
  }
  renderTopChart() {
    return topChartPanelGenerator({ ...this.props, onChangeStyle: this.handleChangeStyle });
  }
  renderWordCloudFontSize() {
    const { currentReport } = this.props;
    return (
      <Collapse.Panel
        key="wordCloudFontSize"
        header={_l('词大小范围')}
      >
        <MeasureAxis currentReport={currentReport} onChangeDisplayValue={this.handleChangeDisplayValue} />
      </Collapse.Panel>
    );
  }
  renderDataFilter() {
    const { currentReport } = this.props;
    const { displaySetup, reportType, pivotTable } = currentReport;
    return (
      <Collapse.Panel header={_l('数据过滤')} key="dataFilter">
        {reportType === reportTypes.PivotTable ? (
          <Fragment>
            <DataFilter
              className="mBottom10"
              name={_l('行数据')}
              showXAxisCount={pivotTable.showLineCount}
              reportType={reportType}
              onChange={count => {
                this.props.changeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      showLineCount: count,
                    },
                  },
                  true,
                );
              }}
            />
            <DataFilter
              name={_l('列数据')}
              showXAxisCount={pivotTable.showColumnCount}
              reportType={reportType}
              onChange={count => {
                this.props.changeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      showColumnCount: count,
                    },
                  },
                  true,
                );
              }}
            />
          </Fragment>
        ) : (
          <DataFilter
            showXAxisCount={displaySetup.showXAxisCount}
            reportType={reportType}
            onChange={count => {
              this.handleChangeDisplayValue('showXAxisCount', count, true);
            }}
          />
        )}
      </Collapse.Panel>
    );
  }
  renderUnit() {
    return unitPanelGenerator(this.props);
  }
  renderTitle() {
    const { currentReport, changeCurrentReport } = this.props;
    const { name, desc, displaySetup } = currentReport;
    const { showTitle = true } = displaySetup;
    return (
      <Collapse.Panel
        key="title"
        header={_l('标题')}
        className={cx({ collapsible: !showTitle })}
        extra={
          <Switch
            size="small"
            checked={showTitle}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplayValue('showTitle', checked);
            }}
          />
        }
      >
        <div className="mBottom12">
          <div className="mBottom8">{_l('显示标题')}</div>
          <Input
            value={name}
            className="chartInput w100 mBottom12"
            placeholder={_l('添加图表标题')}
            onChange={event => {
              changeCurrentReport({
                name: event.target.value
              }, false);
            }}
          />
          <div className="mBottom8">{_l('显示说明')}</div>
          <Input.TextArea
            rows={4}
            className="chartInput w100"
            autoSize={{ minRows: 4, maxRows: 6 }}
            placeholder={_l('添加图表描述')}
            value={desc}
            onChange={event => {
              changeCurrentReport({
                desc: event.target.value
              }, false);
            }}
          />
        </div>
      </Collapse.Panel>
    );
  }
  renderColor() {
    const { currentReport, changeCurrentReport, worksheetInfo } = this.props;
    return (
      <Collapse.Panel header={_l('图形颜色')} key="color">
        <Color
          columns={worksheetInfo.columns}
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
        />
      </Collapse.Panel>
    );
  }
  renderPivotTableFieldColor() {
    const { currentReport, changeCurrentReport } = this.props;
    return (
      <Collapse.Panel header={_l('颜色')} key="pivotTableFieldColor" className="pivotTableFieldColorPanel">
        <PivotTableFieldColor
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
        />
      </Collapse.Panel>
    );
  }
  renderExpandIcon(panelProps) {
    return (
      <Icon
        className={cx('Font18 mRight5 Gray_9e', { 'icon-arrow-active': panelProps.isActive })}
        icon="arrow-down-border"
      />
    );
  }
  render() {
    const { currentReport, sourceType } = this.props;
    const { reportType, xaxes } = currentReport;
    const xAxisisTime = isTimeControl(xaxes.controlType);
    return (
      <div className="chartStyle">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost>
          {reportTypes.PivotTable === reportType ? (
            <Fragment key="pivotTableCount">
              {this.renderPreinstallStyle()}
              {this.renderCell()}
              {this.renderLineTitleStyle()}
              {this.renderColumnTitleStyle()}
              {this.renderSubLineCount()}
              {this.renderPivotTableLineCount()}
              {this.renderPivotTableColumnCount()}
            </Fragment>
          ) : (
            reportTypes.NumberChart === reportType ? (
              this.renderNumberCount()
            ) : (
              ![reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType) && this.renderCount()
            )
          )}
          {reportTypes.NumberChart === reportType && this.renderNumberStyle()}
          {sourceType && this.renderTitle()}
          {[reportTypes.WordCloudChart].includes(reportType) && this.renderWordCloudFontSize()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable, reportTypes.WordCloudChart, reportTypes.TopChart, reportTypes.GaugeChart, reportTypes.ProgressChart].includes(reportType) &&
            this.renderLegend()}
          {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.DualAxes, reportTypes.BidirectionalBarChart, reportTypes.ScatterChart].includes(reportType) &&
            this.renderXAxis()}
          {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.DualAxes, reportTypes.BidirectionalBarChart, reportTypes.ScatterChart].includes(reportType) &&
            this.renderYAxis()}
          {reportTypes.ScatterChart === reportType && this.renderQuadrant()}
          {[reportTypes.RadarChart].includes(reportType) &&
            this.renderMeasureAxis()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable, reportTypes.WordCloudChart, reportTypes.TopChart].includes(reportType) &&
            this.renderLabel()}
          {reportTypes.GaugeChart === reportType && (
            <Fragment key="gaugeChart">
              {this.renderGaugeColor()}
              {this.renderScale()}
              {this.renderIndicator()}
            </Fragment>
          )}
          {[reportTypes.TopChart].includes(reportType) &&
            this.renderTopChart()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.DualAxes, reportTypes.BidirectionalBarChart, reportTypes.WordCloudChart, reportTypes.GaugeChart, reportTypes.ProgressChart, reportTypes.ScatterChart].includes(reportType) &&
            this.renderDataFilter()}
          {![reportTypes.WordCloudChart].includes(reportType) && this.renderUnit()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable, reportTypes.GaugeChart].includes(reportType) &&
            this.renderColor()}
          {reportTypes.PivotTable === reportType && this.renderPivotTableFieldColor()}
        </Collapse>
      </div>
    );
  }
}
