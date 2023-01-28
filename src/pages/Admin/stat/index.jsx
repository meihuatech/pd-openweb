﻿import React from 'react';
import Input from 'ming-ui/components/Input';
import StatTable from './StatTable';
import Config from '../config';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import DatePickerFilter from './datePickerFilter';

import './style.less';
import moment from 'moment';

const routeList = [
  {
    routeType: 'userstat',
    tabName: _l('用户排行'),
    pageTitle: _l('用户排行'),
  },
  {
    routeType: 'feedstat',
    tabName: _l('动态更新统计'),
    pageTitle: _l('动态更新统计'),
  },
  {
    routeType: 'docstat',
    tabName: _l('文档统计'),
    pageTitle: _l('文档统计'),
  },
  // {
  //   routeType: 'qastat',
  //   tabName: _l('问答统计'),
  //   pageTitle: _l('问答统计'),
  // },
  {
    routeType: 'picstat',
    tabName: _l('图片统计'),
    pageTitle: _l('图片统计'),
  },
  {
    routeType: 'groupstat',
    tabName: _l('群组统计'),
    pageTitle: _l('群组统计'),
  },
];

export default class Stat extends React.Component {
  constructor() {
    super();

    this.state = {
      ...this.formatDate(),
      datePickerVisible: false,
      activeTab: 'userstat',
    };
  }

  formatDate(startDate = moment().startOf('month'), endDate = moment()) {
    return {
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate.endOf('d')).format('YYYY-MM-DD'),
    };
  }

  renderTimePicker() {
    const { datePickerVisible, startDate, endDate } = this.state
    return (
      <Trigger
        popupVisible={datePickerVisible}
        onPopupVisibleChange={visible => this.setState({ datePickerVisible: visible })}
        action={['click']}
        popupAlign={{ points: ['tl', 'bl'] }}
        popup={
          <DatePickerFilter
            updateData={data => {
              this.setState({
                datePickerVisible: false,
                startDate: data.startDate,
                endDate: data.endDate,
              });
            }}
          />
        }
      >
        <div className="selectDateInput">{startDate&&endDate ? _l('%0 至 %1', startDate, endDate) : ''}</div>
      </Trigger>
    );
  }

  renderContent() {
    const { startDate, endDate, activeTab } = this.state;
    const _props = {
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
    };
    let reportType = (() => {
      switch (activeTab) {
        case 'userstat':
          return StatTable.REPOREPORT_TYPES.USER;
        case 'feedstat':
          return StatTable.REPOREPORT_TYPES.POST;
        // case 'qastat':
        //   return StatTable.REPOREPORT_TYPES.QA;
        case 'picstat':
          return StatTable.REPOREPORT_TYPES.IMAGE;
        case 'groupstat':
          return StatTable.REPOREPORT_TYPES.GROUP;
        case 'docstat':
          return StatTable.REPOREPORT_TYPES.DOC;
      }
    })();
    const projectId = Config.projectId;
    return (
      <div className="statTableContent">
        <StatTable {...{ ..._props, reportType, projectId }} />
      </div>
    );
  }

  handleChangeTab(item) {
    this.setState({
      activeTab: item.routeType,
    });
  }

  render() {
    const { activeTab } = this.state;
    return (
      <div className="statContent">
        <div className="statHeader">
          <ul className="flexRow">
            {routeList.map(item => {
              return (
                <li
                  key={item.routeType}
                  className={cx('statHeaderItem', activeTab === item.routeType ? 'active' : '')}
                  onClick={this.handleChangeTab.bind(this, item)}
                >
                  {item.tabName}
                </li>
              );
            })}
          </ul>
          {this.renderTimePicker()}
        </div>
        {this.renderContent()}
      </div>
    );
  }
}
