import React, { Fragment, Component } from 'react';
import { Drawer, Select } from 'antd';
import { Icon, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import AppFilter from '../AppFilter';
import { TABS } from '../index';
import SvgIcon from 'src/components/SvgIcon';
import { getDateScope } from '../config';
import './index.less';
import _ from 'lodash';

const selectArrowIcon = <Icon icon="expand_more" className="Gray_9e Font20" />;

const operationTypeData = [
  {
    text: _l('完成填写'),
    value: '1-3',
  },
  {
    text: _l('通过申请'),
    value: '1-4',
  },
  {
    text: _l('否决申请'),
    value: '4-4',
    type: 'hr',
  },
  {
    text: _l('已转交'),
    value: '3-3',
  },
  {
    text: _l('已转审'),
    value: '3-4',
  },
  {
    text: _l('已加签'),
    value: '2-4',
  },
];

const statusData = [
  {
    text: _l('已通过'),
    value: 2,
  },
  {
    text: _l('已否决'),
    value: 3,
  },
  {
    text: _l('流程中止'),
    value: 4,
  },
];

const dateScope = getDateScope();

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: false,
      searchValue: '',
      createAccount: {},
      operationType: {},
      status: {},
      apkId: '',
      processId: '',
      dateScopeIndex: 1,
      type: null,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.isResetFilter) {
      this.handleReset();
      if (nextProps.stateTab === TABS.WAITING_EXAMINE) {
        this.getTodoListFilter(nextProps);
      }
    }
    if (
      nextProps.stateTab == TABS.COMPLETE &&
      (this.state.type == null || nextProps.param.type !== this.props.param.type)
    ) {
      this.setState({
        type: nextProps.param.type,
        operationType: {},
        createAccount: {},
        status: {},
      });
    }
    if (nextProps.stateTab !== TABS.COMPLETE) {
      if (
        (nextProps.visible !== this.props.visible && nextProps.visible) ||
        (nextProps.visible && nextProps.param.type !== this.props.param.type)
      ) {
        this.getTodoListFilter(nextProps);
      }
    }
  }
  getTodoListFilter = props => {
    const { loading } = this.state;
    const { param } = props;

    if (loading) {
      return;
    }
    this.setState({
      loading: true,
    });

    if (this.request && this.request.state() === 'pending') {
      this.request.abort();
    }

    this.request = instanceVersion.getTodoListFilter(param);
    this.request.then(result => {
      this.setState({
        list: result.map(item => {
          item.visible = false;
          return item;
        }),
        loading: false,
      });
    });
  };
  getResetVisible = () => {
    const { stateTab } = this.props;
    const { type, searchValue, createAccount, apkId, processId, operationType, status, dateScopeIndex } = this.state;

    if ([TABS.WAITING_APPROVE, TABS.WAITING_FILL, TABS.WAITING_EXAMINE].includes(stateTab)) {
      return searchValue || !_.isEmpty(createAccount) || apkId || processId;
    }
    if (stateTab === TABS.MY_SPONSOR) {
      return searchValue || apkId || processId;
    }
    if (stateTab === TABS.COMPLETE) {
      if (type === -1) {
        return searchValue || !_.isEmpty(operationType) || !_.isEmpty(createAccount) || apkId || dateScopeIndex !== 1;
      }
      if (type === 5) {
        return searchValue || !_.isEmpty(createAccount) || apkId || dateScopeIndex !== 1;
      }
      if (type === 0) {
        return searchValue || !_.isEmpty(status) || apkId || dateScopeIndex !== 1;
      }
    }
    return false;
  };
  handleClose = () => {
    this.props.handleChangeVisible();
  };
  handleChange = _.debounce(() => {
    const { stateTab } = this.props;
    const { type, searchValue, createAccount, apkId, processId, status, dateScopeIndex } = this.state;
    const operationType = this.state.operationType.value;

    let newType = null;
    let newOperationType = null;

    if (operationType && typeof operationType === 'string') {
      let [oType, type] = operationType.split('-');
      newOperationType = Number(oType);
      newType = Number(type);
    } else {
      newOperationType = operationType;
    }

    let param = {
      resultType: newType,
      operationType: newOperationType,
      keyword: searchValue,
      createAccountId: createAccount.accountId,
      status: status.value,
      apkId,
      processId,
    };

    if (stateTab === TABS.COMPLETE) {
      param.dateScopeIndex = dateScopeIndex;
    }

    this.props.onChange(param);
  }, 500);
  handleReset = () => {
    this.setState(
      {
        searchValue: '',
        createAccount: {},
        apkId: '',
        processId: '',
        operationType: {},
        status: {},
        dateScopeIndex: 1,
      },
      this.handleChange,
    );
  };
  handleOpenProcesses = id => {
    const { list } = this.state;
    this.setState({
      list: list.map(item => {
        if (item.app.id === id) {
          item.visible = !item.visible;
        }
        return item;
      }),
    });
  };
  changeUser = () => {
    const change = user => {
      this.setState(
        {
          createAccount: user,
        },
        this.handleChange,
      );
    };
    $(this.owner).quickSelectUser({
      showQuickInvite: false,
      showMoreInvite: false,
      isTask: false,
      offset: {
        top: 5,
        left: 18,
      },
      zIndex: 10001,
      SelectUserSettings: {
        unique: true,
        callback(users) {
          change(users[0]);
        },
      },
      selectCb(users) {
        change(users[0]);
      },
    });
  };
  renderSearchName() {
    const { searchValue } = this.state;
    return (
      <div className="mBottom16">
        <div className="inputWrapper valignWrapper Relative">
          <input
            value={searchValue}
            type="text"
            placeholder={_l('搜索名称和摘要')}
            onChange={event => {
              this.setState(
                {
                  searchValue: event.target.value.trim(),
                },
                this.handleChange,
              );
            }}
          />
          {/*searchValue && <Icon icon="close" className="Gray_9e Font17 pointer" onClick={() => { this.setState({ searchValue: '' }) }} />*/}
          <Icon icon="search" className="Gray_9e Font17" />
        </div>
      </div>
    );
  }
  renderAccount() {
    const { createAccount } = this.state;
    return (
      <div className="mBottom16">
        <div className="Font12 mBottom10">{_l('发起人')}</div>
        {_.isEmpty(createAccount) ? (
          <div className="personPostBox" ref={owner => (this.owner = owner)}>
            <Icon icon="task_add-02" className="Gray_9e Font24 Hover_49 Hand" onClick={this.changeUser} />
          </div>
        ) : (
          <div className="personPostBox spaceBtween">
            <div className="personPostBox">
              <img src={createAccount.avatar} />
              <span className="mLeft8">{createAccount.fullname}</span>
            </div>
            <div
              className="ThemeColor3 Hover_49 Hand right"
              onClick={() => {
                this.setState(
                  {
                    createAccount: {},
                  },
                  this.handleChange,
                );
              }}
            >
              {_l('清除')}
            </div>
          </div>
        )}
      </div>
    );
  }
  renderResult() {
    const { operationType } = this.state;
    const index = _.indexOf(operationTypeData, operationType);
    const value = index !== -1 ? index : null;
    return (
      <div className="mBottom16">
        <div className="Font12 mBottom10">{_l('处理结果')}</div>
        <Select
          value={value}
          placeholder={_l('请选择')}
          className="w100 selectWrapper"
          suffixIcon={selectArrowIcon}
          onChange={index => {
            this.setState({ operationType: operationTypeData[index] }, this.handleChange);
          }}
        >
          {operationTypeData.map((item, index) => (
            <Select.Option className="processOptionWrapper" value={index}>
              {item.text}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }
  renderStatus() {
    const { status } = this.state;
    const index = _.indexOf(statusData, status);
    const value = index !== -1 ? index : null;
    return (
      <div className="mBottom16">
        <div className="Font12 mBottom10">{_l('状态')}</div>
        <Select
          value={value}
          placeholder={_l('请选择')}
          className="w100 selectWrapper"
          suffixIcon={selectArrowIcon}
          onChange={index => {
            this.setState({ status: statusData[index] }, this.handleChange);
          }}
        >
          {statusData.map((item, index) => (
            <Select.Option className="processOptionWrapper" value={index}>
              {item.text}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }
  renderDateScope() {
    const { dateScopeIndex } = this.state;
    return (
      <div className="mBottom16">
        <div className="Font12 mBottom10">{_l('时间范围')}</div>
        <Select
          value={dateScopeIndex}
          className="w100 selectWrapper"
          suffixIcon={selectArrowIcon}
          onChange={dateScopeIndex => {
            this.setState({ dateScopeIndex }, this.handleChange);
          }}
        >
          {dateScope.map((item, index) => (
            <Select.Option className="processOptionWrapper" value={index}>
              {item.text}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }
  renderTodoListFilter() {
    const { list, apkId, processId, loading } = this.state;

    return (
      <div className="todoListFilter">
        <div className="Font13 mBottom10 bold">{_l('应用/流程')}</div>
        <div className="w100">
          {loading ? (
            <LoadDiv size="middle" />
          ) : list.length ? (
            list.map(item => (
              <Fragment key={item.app.id}>
                <div className="flexRow valignWrapper appItem">
                  <Icon
                    icon={item.visible ? 'arrow-down' : 'arrow-right-tip'}
                    className="flexRow valignWrapper pointer Gray_75 iconArrow"
                    onClick={() => {
                      this.handleOpenProcesses(item.app.id);
                    }}
                  />
                  <div
                    className={cx('flexRow valignWrapper flex pointer content', { active: apkId === item.app.id })}
                    onClick={() => {
                      this.setState({ apkId: item.app.id, processId: '' }, this.handleChange);
                    }}
                  >
                    <div className="appIcon flexRow valignWrapper" style={{ backgroundColor: item.app.iconColor }}>
                      <SvgIcon url={item.app.iconUrl} fill="#fff" size={18} />
                    </div>
                    <div className="flex processAppName ellipsis">{item.app.name}</div>
                    <div className="Gray_9e">{item.count}</div>
                  </div>
                </div>
                {item.visible && (
                  <Fragment>
                    {item.processes.map(item => (
                      <div
                        key={item.id}
                        className={cx('flexRow valignWrapper processesItem pointer', { active: processId === item.id })}
                        onClick={() => {
                          this.setState({ processId: item.id, apkId: '' }, this.handleChange);
                        }}
                      >
                        <div className="flex ellipsis">{item.name}</div>
                        <div className="Gray_75">{item.count}</div>
                      </div>
                    ))}
                  </Fragment>
                )}
              </Fragment>
            ))
          ) : (
            <div className="Gray_9d withoutData" style={{ height: 100 }}>
              {_l('暂无搜索结果')}
            </div>
          )}
        </div>
      </div>
    );
  }
  renderDrawerContent() {
    const { type } = this.state;
    const { param, stateTab, visible } = this.props;
    const resetVisible = this.getResetVisible();
    return (
      <div className={cx('wrapper flexColumn', { Hidden: !visible })}>
        <div className="header flexRow valignWrapper">
          <div className="flex bold">{_l('筛选')}</div>
          {resetVisible && (
            <div className="reset pointer" onClick={this.handleReset}>
              {_l('重置')}
            </div>
          )}
          <Icon className="Gray_9d Font20 pointer" icon="close" onClick={this.handleClose} />
        </div>
        <div className="flex filterContent">
          {stateTab == TABS.COMPLETE && this.renderDateScope()}
          {this.renderSearchName()}
          {[TABS.WAITING_APPROVE, TABS.WAITING_FILL, TABS.WAITING_EXAMINE].includes(stateTab) && this.renderAccount()}
          {stateTab == TABS.COMPLETE && (
            <Fragment>
              {[5, -1].includes(type) && this.renderAccount()}
              {type === -1 && this.renderResult()}
              {type === 0 && this.renderStatus()}
              <AppFilter
                apkId={this.state.apkId}
                onChange={apkId => {
                  this.setState(
                    {
                      apkId,
                    },
                    this.handleChange,
                  );
                }}
              />
            </Fragment>
          )}
          {[TABS.WAITING_APPROVE, TABS.WAITING_FILL, TABS.WAITING_EXAMINE, TABS.MY_SPONSOR].includes(stateTab) &&
            this.renderTodoListFilter()}
        </div>
      </div>
    );
  }
  render() {
    return <div className="processFilterDrawerWrapper">{this.renderDrawerContent()}</div>;
  }
}
