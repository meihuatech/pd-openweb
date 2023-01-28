import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Collapse, Checkbox, Switch, Input } from 'antd';
import { Count, Location } from './components/Count';
import DataFilter from './components/DataFilter';
import Label from './components/Label';
import XAxis from './components/XAxis';
import yAxisPanelGenerator from './components/YAxis';
import unitPanelGenerator from './components/Unit';
import numberStylePanelGenerator, { numberSummaryPanelGenerator } from './components/NumberStyle';
import Color from './components/Color/index';
import PreinstallStyle from './components/PreinstallStyle';
import TitleStyle from './components/TitleStyle';
import { reportTypes, LegendTypeData } from 'statistics/Charts/common';
import { isTimeControl } from 'statistics/common';
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
    const dualAxesSwitchChecked = summary.showTotal || (rightY ? rightY.summary.showTotal : null);
    const switchChecked = isDualAxes ? dualAxesSwitchChecked : displaySetup.showTotal;
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
              if (isDualAxes) {
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
              isDualAxes ? (
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
                  {_l('Y轴')}
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
          {isDualAxes && (
            <Count
              smallTitle={
                isDualAxes ? (
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
                    {_l('辅助Y轴')}
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
    return numberStylePanelGenerator({ ...this.props, onChangeStyle: this.handleChangeStyle });
  }
  renderPreinstallStyle() {
    const { style } = this.props.currentReport;
    return (
      <Collapse.Panel
        key="preinstallStyle"
        header={_l('预设样式')}
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
    const { style } = this.props.currentReport;
    return (
      <Collapse.Panel
        key="lineTitleStyle"
        header={_l('行标题')}
      >
        <TitleStyle
          name={_l('行')}
          type="line"
          style={style}
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
          name={_l('列')}
          type="column"
          style={style}
          onChangeStyle={this.handleChangeStyle}
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
          {yaxisList.map(item => (
            <Count
              key={item.controlId}
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
          <Location
            summary={lineSummary}
            locationType="line"
            onChangeSummary={this.handleChangeLineSummary}
          />
        </Fragment>
      </Collapse.Panel>
    );
  }
  renderPivotTableColumnCount() {
    const { reportType, displaySetup, yaxisList, pivotTable = {} } = this.props.currentReport;
    const { showColumnTotal, columnSummary = {} } = pivotTable;
    const { controlList = [], rename } = columnSummary;
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
          {yaxisList.map(item => (
            <Count
              key={item.controlId}
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
                            columnSummary: {
                              ...columnSummary,
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
                            columnSummary: {
                              ...columnSummary,
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
                      columnSummary: {
                        ...columnSummary,
                        controlList: newControlList
                      }
                    },
                  },
                  isRequest,
                );
              }}
            />
          ))}
          <Location
            summary={columnSummary}
            locationType="column"
            onChangeSummary={this.handleChangeColumnSummary}
          />
        </Fragment>
      </Collapse.Panel>
    );
  }
  renderLineHeight() {
    const { currentReport } = this.props;
    const { style } = currentReport;
    const unilineShow = style.pivotTableUnilineShow;
    return (
      <Collapse.Panel
        key="lienHeight"
        header={_l('单行显示')}
        className={cx('hideArrowIcon', { collapsible: !unilineShow })}
        extra={
          <Switch
            size="small"
            checked={unilineShow}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeStyle({ pivotTableUnilineShow: checked });
            }}
          />
        }
      >
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
            }}
          />
        }
      >
        <Label
          currentReport={currentReport}
          onChangeDisplayValue={this.handleChangeDisplayValue}
          onUpdateDisplaySetup={this.handleChangeDisplaySetup}
        />
      </Collapse.Panel>
    );
  }
  renderXAxis() {
    const { currentReport } = this.props;
    const { xdisplay, fontStyle, showChartType } = currentReport.displaySetup;
    const switchChecked = !!fontStyle || xdisplay.showDial || xdisplay.showTitle;
    const isBarChart = currentReport.reportType === reportTypes.BarChart;
    const isVertical = isBarChart && showChartType === 2;
    return (
      <Collapse.Panel
        key="xAxis"
        header={isVertical ? _l('Y轴') : _l('X轴')}
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
    return yAxisPanelGenerator(this.props);
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
  renderColor() {
    const { currentReport, changeCurrentReport, worksheetInfo } = this.props;
    return (
      <Collapse.Panel header={_l('图形颜色')} key="color">
        <Color
          columns={worksheetInfo.columns}
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
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
    const { currentReport } = this.props;
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
              {this.renderPivotTableLineCount()}
              {this.renderPivotTableColumnCount()}
            </Fragment>
          ) : (
            reportTypes.NumberChart === reportType ? this.renderNumberCount() : this.renderCount()
          )}
          {reportTypes.NumberChart === reportType && this.renderNumberStyle()}
          {[reportTypes.PivotTable].includes(reportType) && this.renderLineHeight()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderLegend()}
          {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.DualAxes].includes(reportType) &&
            this.renderXAxis()}
          {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.DualAxes].includes(reportType) &&
            this.renderYAxis()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderLabel()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.DualAxes].includes(reportType) &&
            this.renderDataFilter()}
          {this.renderUnit()}
          {![reportTypes.NumberChart, reportTypes.CountryLayer, reportTypes.PivotTable].includes(reportType) &&
            this.renderColor()}
        </Collapse>
      </div>
    );
  }
}
