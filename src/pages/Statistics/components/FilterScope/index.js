import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { Select, DatePicker, Input, Dropdown, Menu } from 'antd';
import { Icon, ScrollView } from 'ming-ui';
import { dropdownScopeData, dropdownDayData, isPastAndFuture, isTimeControl, timeDataParticle, timeGatherParticle, timeTypes, unitTypes } from 'statistics/common';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import { reportTypes } from 'statistics/Charts/common';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';
import _ from 'lodash';
import moment from 'moment';

const { RangePicker } = DatePicker;

const naturalTime = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21];

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'worksheetInfo', 'base'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class extends Component {
  constructor(props) {
    super();
    const { filter = {}, xaxes = {} } = props.currentReport;
    this.state = {
      currentRangeType: filter.rangeType,
      currentRangeValue: filter.rangeValue,
      dropdownScopeValue: filter.rangeType,
      dropdownDayValue: filter.rangeValue || 7,
      particleSizeType: xaxes ? xaxes.particleSizeType : 0,
      dynamicFilter: { startType: 1, startCount: 1, startUnit: 1, endType: 1, endCount: 1, endUnit: 1 },
      customRangeDay: false
    }
  }
  getTableData = () => {
    const { reportType } = this.props.currentReport;
    if (reportType === reportTypes.PivotTable) return;
    this.props.changeBase({
      reportSingleCacheId: null,
      apkId: null,
      match: {}
    });
    this.props.getTableData();
  }
  handleUpdateScope = value => {
    this.setState({
      dropdownScopeValue: value,
      dropdownDayValue: value === 20 ? `${moment().add(-7, 'days').format('YYYY/MM/DD')}-${moment().format('YYYY/MM/DD')}` : isPastAndFuture(value) ? 7 : null,
    }, () => {
      this.handleSave();
    });
  }
  handleUpdateDay = value => {
    this.setState({
      dropdownDayValue: value,
    }, () => {
      this.handleSave();
    });
  }
  handleSave = () => {
    const { filter } = this.props.currentReport;
    const { sheetVisible } = this.props.base;
    const { dropdownScopeValue, dropdownDayValue, dynamicFilter } = this.state;
    this.props.changeCurrentReport({
      filter: {
        ...filter,
        rangeType: dropdownScopeValue,
        rangeValue: dropdownDayValue,
        dynamicFilter
      }
    }, true);
    if (sheetVisible) {
      this.getTableData();
    }
  }
  renderScope() {
    const { currentReport } = this.props;
    const { dropdownScopeValue, dropdownDayValue, currentRangeValue, currentRangeType } = this.state;
    const { filter } = currentReport;

    if (currentRangeType === 0) {
      return (
        <Fragment>
          <Select
            className="chartSelect w100"
            value={dropdownScopeValue}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={this.handleUpdateScope}
          >
            {dropdownScopeData.map(item => (
              <Select.Option
                className="selectOptionWrapper"
                key={item.value}
                value={item.value}
              >
                {item.text}
              </Select.Option>
            ))}
          </Select>
          {isPastAndFuture(dropdownScopeValue) && (
            <Select
              className="chartSelect w100 mTop10"
              value={Number(dropdownDayValue)}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={this.handleUpdateDay}
            >
              {dropdownDayData.map(item => (
                <Select.Option
                  className="selectOptionWrapper"
                  key={item.value}
                  value={item.value}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          )}
          {dropdownScopeValue === 20 && (
            <RangePicker
              className="chartInput w100 mTop10"
              allowClear={false}
              suffixIcon={null}
              locale={locale}
              format="YYYY/MM/DD"
              value={dropdownDayValue ? dropdownDayValue.split('-').map(item => moment(item)) : [moment().add(-7, 'days'), moment()]}
              onChange={date => {
                const [start, end] = date;
                this.setState({
                  dropdownDayValue: `${start.format('YYYY/MM/DD')}-${end.format('YYYY/MM/DD')}`,
                }, this.handleSave);
              }}
            />
          )}
          {dropdownScopeValue === 21 && this.renderDynamicFilter()}
        </Fragment>
      );
    }

    if ([1, 2, 3].includes(currentRangeType)) {
      return (
        <Input readOnly className="chartInput" value={_.find(dropdownScopeData, { value: filter.rangeType }).text} />
      );
    }

    if (naturalTime.includes(currentRangeType)) {
      const scopeTime = filter.rangeType === 20 ? filter.rangeValue.split('-').map(item => moment(item)) : [moment(filter.startDate), moment(filter.endDate)];
      const disabledDate = currentRangeType === 20 ? currentRangeValue.split('-').map(item => moment(item)) : [moment(filter.startDate), moment(filter.endDate)];

      return (
        <RangePicker
          className="chartInput w100"
          allowClear={false}
          suffixIcon={null}
          locale={locale}
          format="YYYY/MM/DD"
          defaultValue={scopeTime}
          disabledDate={(current) => {
            if (current) {
              const [ start, end ] = disabledDate;
              return current < start || current > end;
            } else {
              return false;
            }
          }}
          onChange={date => {
            const [start, end] = date;
            this.props.changeCurrentReport({
              filter: {
                ...filter,
                rangeType: 20,
                rangeValue: `${start.format('YYYY/MM/DD')}-${end.format('YYYY/MM/DD')}`
              }
            }, true);
          }}
        />
      );
    }

    if (isPastAndFuture(currentRangeType)) {
      const { customRangeDay, currentRangeValue } = this.state;
      return (
        <Dropdown
          overlay={(
            <Menu className="rangeDayOverlayMenu">
              {
                dropdownDayData.filter(item => item.value <= currentRangeValue).map(item => (
                  <Menu.Item
                    key={item.value}
                    className={cx({ active: Number(dropdownDayValue) === item.value })}
                    onClick={() => {
                      this.setState({ customRangeDay: false });
                      this.handleUpdateDay(item.value);
                    }}
                  >
                    {item.text}
                  </Menu.Item>
                ))
              }
            </Menu>
          )}
          trigger={['click']}
        >
          <Input
            value={customRangeDay === false ? _l('%0天', dropdownDayValue) : customRangeDay}
            className="chartInput w100"
            onChange={event => {
              let value = event.target.value;
              let count = Number(value.replace(/[^\d]/g, ''));
              let maxRangeValue = Number(currentRangeValue);
              this.setState({
                customRangeDay: count > maxRangeValue ? maxRangeValue : count
              });
            }}
            onBlur={() => {
              this.state.customRangeDay && this.handleUpdateDay(this.state.customRangeDay);
            }}
            onKeyDown={event => {
              if (event.which === 13 && this.state.customRangeDay) {
                this.handleUpdateDay(this.state.customRangeDay);
              }
            }}
          />
        </Dropdown>
      );
    }
  }
  renderDynamicFilter() {
    const { dynamicFilter } = this.state;
    const unitValues = [1, 3, 4];
    const changeDynamicFilter = (data) => {
      this.setState({
        dynamicFilter: {
          ...dynamicFilter,
          ...data
        }
      }, this.handleSave);
    }
    return (
      <Fragment>
        <div className="flexRow valignWrapper mTop20">
          <div className="mRight15">{_l('从')}</div>
          <Select
            className="chartSelect flex"
            value={dynamicFilter.startType}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              changeDynamicFilter({ startType: value });
            }}
          >
            {timeTypes.map(item => (
              <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          {[5, 6].includes(dynamicFilter.startType) && (
            <Fragment>
              <Input
                className="chartInput flex mLeft10 mRight10"
                value={dynamicFilter.startCount}
                onChange={(e) => {
                  const value = event.target.value;
                  changeDynamicFilter({ startCount: formatNumberFromInput(value).replace('-', '') });
                }}
              />
              <Select
                className="chartSelect flex"
                value={dynamicFilter.startUnit}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={value => {
                  changeDynamicFilter({ startUnit: value });
                }}
              >
                {unitTypes.map(item => (
                  <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Fragment>
          )}
        </div>
        <div className="flexRow valignWrapper mTop10">
          <div className="mRight15">{_l('至')}</div>
          <Select
            className="chartSelect flex"
            value={dynamicFilter.endType}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              changeDynamicFilter({ endType: value, startUnit: unitValues.includes(value) ? value : dynamicFilter.startUnit });
            }}
          >
            {timeTypes.map(item => (
              <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          {[5, 6].includes(dynamicFilter.endType) && (
            <Fragment>
              <Input
                className="chartInput flex mLeft10 mRight10"
                value={dynamicFilter.endCount}
                onChange={(e) => {
                  const value = event.target.value;
                  changeDynamicFilter({ endCount: formatNumberFromInput(value).replace('-', '') });
                }}
              />
              <Select
                className="chartSelect flex"
                value={dynamicFilter.endUnit}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={value => {
                  changeDynamicFilter({ endUnit: value, endUnit: unitValues.includes(value) ? value : dynamicFilter.endUnit });
                }}
              >
                {unitTypes.map(item => (
                  <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }
  renderGroup() {
    const { currentReport } = this.props;
    const { xaxes } = currentReport;
    const { particleSizeType } = this.state;
    const timeData = (xaxes.controlType === 16 ? timeDataParticle : timeDataParticle.filter(item => ![6, 7].includes(item.value)));
    const timeDataIndex = _.findIndex(timeData, { value: particleSizeType });
    const timeGatherParticleIndex = _.findIndex(timeGatherParticle, { value: particleSizeType });
    return (
      <Fragment>
        <div className="Font12 Bold mBottom10 mTop10">{_l('归组')}</div>
        <Select
          className="chartSelect w100"
          value={xaxes.particleSizeType}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          onChange={value => {
            this.props.changeCurrentReport({ particleSizeType: value }, true);
          }}
        >
          {_.find(timeData, { value: xaxes.particleSizeType }) && (
            <Select.OptGroup label={_l('时间')}>
              {timeData.filter((_, index) => index >= timeDataIndex).map(item => (
                <Select.Option
                  title
                  className="selectOptionWrapper"
                  key={item.value}
                  value={item.value}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select.OptGroup>
          )}
          {_.find(timeGatherParticle, { value: xaxes.particleSizeType }) && (
            <Select.OptGroup label={_l('集合')}>
              {timeGatherParticle.filter((_, index) => index >= timeGatherParticleIndex).map(item => (
                <Select.Option
                  title
                  className="selectOptionWrapper"
                  key={item.value}
                  value={item.value}
                >
                  {item.text}
                </Select.Option>
              ))}
            </Select.OptGroup>
          )}
        </Select>
      </Fragment>
    );
  }
  render() {
    const { dropdownScopeValue, dropdownDayValue, currentRangeType } = this.state;
    const { projectId, worksheetInfo, currentReport } = this.props;
    const { filter = {}, xaxes = {} } = currentReport || {};
    const xAxisisTime = isTimeControl(xaxes.controlType);
    const sysControlSwitch = isOpenPermit(permitList.sysControlSwitch, worksheetInfo.switches, filter.viewId);
    return (
      <div className="ChartDialogSetting setting flexColumn ChartFilterPanel">
        <ScrollView className="flex">
          <div className="pLeft20 pRight20 pBottom10">
            <div className="item borderNone pTop20">
              <div className="title Font18 Bold">{_l('统计范围')}</div>
              <div className="Font12 Bold mBottom10 mTop10">
                {_l('时间')}
                {(naturalTime.includes(currentRangeType) || isPastAndFuture(currentRangeType)) && (
                  `（${_.find(dropdownScopeData, { value: currentRangeType }).text}）`
                )}
              </div>
              {this.renderScope()}
              {xAxisisTime && this.renderGroup()}
              <div
                className="Font12 Bold mBottom10 mTop20 pTop10 flexRow"
                style={{borderTop: '1px solid #E0E0E0'}}
              >
                <span className="flex">{_l('筛选')}</span>
              </div>
              <SingleFilter
                canEdit
                projectId={projectId}
                appId={worksheetInfo.appId}
                columns={worksheetInfo.columns.filter(item => {
                  if (!sysControlSwitch && _.find(WORKFLOW_SYSTEM_CONTROL, { controlId: item.controlId })) {
                    return false;
                  } else {
                    return true;
                  }
                })}
                conditions={[]}
                filterResigned={false}
                onConditionsChange={_.debounce((conditions = [], localConditions) => {
                  conditions = conditions.map(item => {
                    const isTime = isTimeControl(item.dataType);
                    const isMoment = moment.isMoment(item.value);
                    if (isTime && isMoment) {
                      return {
                        ...item,
                        value: item.value.format('YYYY-MM-DD')
                      }
                    } else {
                      return item;
                    }
                  });
                  this.props.changeCurrentReport({
                    filter: {
                      ...filter,
                      filterControls: conditions,
                    }
                  }, true);
                  this.getTableData();
                }, 200)}
              />
            </div>
          </div>
        </ScrollView>
      </div>
    );
  }
}
