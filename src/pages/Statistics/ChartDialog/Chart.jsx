import React, { Component, Fragment, createRef } from 'react';
import cx from 'classnames';
import { reportTypes } from '../Charts/common';
import { WithoutData } from '../components/ChartStatus';
import { Loading, Abnormal } from '../components/ChartStatus';
import DragMask from 'worksheet/common/DragMask';
import styled from 'styled-components';
import Sheet from './Sheet';
import charts from '../Charts';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions.js';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

const isMobile = browserIsMobile();

const VerticalDrag = styled.div(
  ({ value }) => `
  position: absolute;
  z-index: 2;
  top: ${value}px;
  width: 100%;
  height: 2px;
  cursor: ns-resize;
  background-color: #ccc;
  &:hover {
    background-color: #ddd;
  }
`,
);

const HorizontalDrag = styled.div(
  ({ value }) => `
  position: absolute;
  z-index: 2;
  left: ${value}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  background-color: #ccc;
  &:hover {
    background-color: #ddd;
  }
`,
);

@connect(
  state => ({
    ..._.pick(state.statistics, ['loading', 'currentReport', 'worksheetInfo', 'reportData', 'base', 'direction']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min: 0,
      max: 0,
      dragValue: 0,
      sheetSize: 0,
      dragMaskVisible: false,
    };
    this.$chartRef = createRef(null);
  }
  componentDidMount() {
    this.changeDragValue(this.props.direction);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.scopeVisible !== this.props.scopeVisible || nextProps.direction !== this.props.direction) {
      setTimeout(() => {
        this.changeDragValue(nextProps.direction);
      }, 0);
    }
  }
  changeDragValue(direction) {
    const { offsetHeight, offsetWidth } = this.$chartRef.current || {};
    const value = direction === 'vertical' ? offsetHeight : offsetWidth;
    const storeDragValue = Number(localStorage.getItem(`${direction}ChartSheetDragValue`) || 0);
    const storeSheetSize = Number(localStorage.getItem(`${direction}ChartSheetSheetSize`) || 0);
    this.setState({
      dragValue: storeDragValue ? storeDragValue : value / 2,
      sheetSize: storeSheetSize ? storeSheetSize : value / 2,
      min: (20 / 100) * value,
      max: (80 / 100) * value,
    });
  }
  renderChart() {
    const { reportData, currentReport, base, getReportSingleCacheId, requestOriginalData, changeCurrentReport } = this.props;
    const { settingVisible, report = {} } = base;
    const reportId = report.id;
    const { reportType } = reportData;
    const Chart = charts[reportType];
    const isPublicShareChart = location.href.includes('public/chart');
    const isPublicSharePage = location.href.includes('public/page') || window.shareAuthor;

    const props = {
      isViewOriginalData: !settingVisible && !isMobile && !isPublicShareChart && !isPublicSharePage,
      requestOriginalData,
    };

    if ([reportTypes.PivotTable].includes(reportType)) {
      const { data, columns, ylist, lines, valueMap } = reportData;
      return _.isEmpty(data.data) ? (
        <WithoutData />
      ) : (
        <Chart
          {...props}
          settingVisible={settingVisible}
          onChangeCurrentReport={changeCurrentReport}
          reportData={{
            ...currentReport,
            reportId,
            data,
            columns,
            ylist,
            lines: currentReport.pivotTable ? _.merge(lines, currentReport.pivotTable.lines) : lines,
            valueMap,
          }}
        />
      );
    }
    if (reportTypes.CountryLayer === reportType) {
      const { map, country, summary } = reportData;
      return map.length ? (
        <Chart
          {...props}
          reportData={{
            ...currentReport,
            map,
            country,
            summary: settingVisible ? currentReport.summary : summary,
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if (
      [
        reportTypes.BarChart,
        reportTypes.LineChart,
        reportTypes.RadarChart,
        reportTypes.FunnelChart,
        reportTypes.DualAxes,
      ].includes(reportType)
    ) {
      const { map, contrastMap, summary, rightY = {} } = reportData;
      return map.length || contrastMap.length ? (
        <Chart
          {...props}
          reportData={{
            ...currentReport,
            map,
            contrastMap,
            summary: settingVisible ? currentReport.summary : summary,
            rightY: settingVisible ? currentReport.rightY : rightY,
            reportId,
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if ([reportTypes.PieChart].includes(reportType)) {
      const { map, summary } = reportData;
      return map.length ? (
        <Chart
          {...props}
          reportData={{
            ...currentReport,
            map,
            summary: settingVisible ? currentReport.summary : summary,
            reportId,
          }}
        />
      ) : (
        <WithoutData />
      );
    }
    if ([reportTypes.NumberChart].includes(reportType)) {
      const { map, contrast, contrastMap } = reportData;
      const params = {
        ...currentReport,
        map,
        contrast,
        contrastMap
      };
      if (map.length || contrast.length || contrastMap.length) {
        return <Chart {...props} reportData={params} />;
      } else {
        return <WithoutData />;
      }
    }
  }
  render() {
    const {
      loading,
      sheetVisible,
      settingVisible,
      worksheetInfo,
      reportData,
      currentReport,
      onChangeSheetVisible,
      renderHeaderDisplaySetup,
    } = this.props;
    const viewId = _.get(currentReport, ['filter', 'viewId']);
    const view = _.find(worksheetInfo.views, { viewId });
    const { direction, scopeVisible } = this.props;
    const { dragMaskVisible, min, max, sheetSize } = this.state;
    const dragValue = this.state.dragValue - (scopeVisible && direction === 'horizontal' ? 320 : 0);
    return (
      <div
        className={cx('chartBody Relative flex', {
          flexColumn: direction === 'vertical',
          flexRow: direction === 'horizontal',
        })}
        ref={this.$chartRef}
      >
        <div className={cx('chart flexColumn', direction)}>
          {reportData.status ? renderHeaderDisplaySetup() : null}
          {loading ? (
            <Loading />
          ) : reportData.status ? (
            <Fragment>{this.renderChart()}</Fragment>
          ) : (
            <Abnormal isEdit={settingVisible ? !(viewId && _.isEmpty(view)) : false} />
          )}
        </div>
        {sheetVisible && (
          <Fragment>
            {dragMaskVisible && (
              <DragMask
                direction={direction}
                value={dragValue}
                min={min}
                max={max}
                onChange={value => {
                  const { offsetHeight, offsetWidth } = this.$chartRef.current;
                  const sheetSize = (direction === 'vertical' ? offsetHeight : offsetWidth) - value;
                  const dragValue = value + (scopeVisible ? 320 : 0);
                  this.setState({
                    dragMaskVisible: false,
                    dragValue,
                    sheetSize,
                  });
                  safeLocalStorageSetItem(`${direction}ChartSheetDragValue`, dragValue);
                  safeLocalStorageSetItem(`${direction}ChartSheetSheetSize`, sheetSize);
                }}
              />
            )}
            <Sheet
              direction={direction}
              settingVisible={settingVisible}
              isSmall={direction === 'horizontal' ? sheetSize < 540 : false}
              style={{
                height: direction === 'vertical' ? sheetSize : '100%',
                width: direction === 'horizontal' ? sheetSize : '100%',
              }}
              onClose={() => {
                onChangeSheetVisible(false);
              }}
            />
            {direction === 'vertical' && (
              <VerticalDrag value={dragValue} onMouseDown={() => this.setState({ dragMaskVisible: true })} />
            )}
            {direction === 'horizontal' && (
              <HorizontalDrag value={dragValue} onMouseDown={() => this.setState({ dragMaskVisible: true })} />
            )}
          </Fragment>
        )}
      </div>
    );
  }
}
