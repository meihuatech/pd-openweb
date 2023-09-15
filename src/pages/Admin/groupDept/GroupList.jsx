import React, { Component, Fragment } from 'react';
import { Input, Select, Table, Dropdown, Spin, ConfigProvider } from 'antd';
import { Tooltip, LoadDiv } from 'ming-ui';
import Config from '../config';
import './index.less';
import groupController from 'src/api/group';
import DialogLayer from 'src/components/mdDialog/dialog';
import ReactDom from 'react-dom';
import Empty from '../common/TableEmpty';
import cx from 'classnames';
import PaginationWrap from '../components/PaginationWrap';
import DialogSelectMapGroupDepart from 'src/components/dialogSelectMapGroupDepart/dialogSelectMapGroupDepart';
import CreateGroup from 'src/components/group/create/creatGroup';
import moment from 'moment';

const { Search } = Input;

const sortFieldTrans = {
  name: 0,
  isVerified: 8,
  status: 11,
  postCount: 2,
  groupMemberCount: 3,
  createTime: 0,
};

export default class GroupsList extends Component {
  constructor() {
    super();
    this.state = {
      count: 0,
      list: [],
      pageIndex: 1, //页码
      pageSize: 50, //条数
      selectKeys: [],
      keywords: '',
      status: undefined, //群组状态：open--1,close---0
      types: undefined, //群组类型：官方--1、普通--0
      sortField: 0, //排序的字段(名称：4，类型：8，状态：11，动态：2，成员：3，时间：0)
      sortType: 0, //升序1、降序0
      loading: false,
    };
    this.columns = [
      {
        title: _l('群组名称'),
        dataIndex: 'name',
        render: (text, record) => {
          return (
            <div className="nameBox">
              <img src={record.avatar} alt="avatar" />
              <a className="overflow_ellipsis" href={`/group/groupValidate?gID=${record.groupId}`} target="_blank">
                {text}
              </a>
            </div>
          );
        },
        width: 150,
        sorter: true,
      },
      {
        title: _l('类型'),
        dataIndex: 'isVerified',
        render: (text, record) => {
          return (
            <div className="typeBox">
              <Tooltip popupPlacement="bottom" text={<span>{_l('关联部门：%0', record.mapDepartmentName)}</span>}>
                <i
                  className={cx('TxtMiddle mRight5 icon-official-group Font10', text ? 'color_y' : 'transparentColor')}
                ></i>
              </Tooltip>
              {text ? _l('官方') : _l('普通')}
            </div>
          );
        },
        sorter: true,
      },
      {
        title: _l('状态'),
        dataIndex: 'status',
        render: text => {
          return text ? (
            <span className="color_gr">{_l('正常')}</span>
          ) : (
            <span className="color_g">{_l('已关闭')}</span>
          );
        },
        sorter: true,
      },
      {
        title: _l('动态数'),
        dataIndex: 'postCount',
        sorter: true,
      },
      {
        title: _l('成员数'),
        dataIndex: 'groupMemberCount',
        sorter: true,
      },
      {
        title: _l('创建人'),
        dataIndex: 'createAccount',
        render: (text = {}) => {
          return (
            <div className="overflow_ellipsis" style={{ maxWidth: 150 }}>
              {text.fullname}
            </div>
          );
        },
      },
      {
        title: _l('创建时间'),
        dataIndex: 'createTime',
        render: text => {
          return <span className="color_g">{moment(text).format('YYYY.MM.DD')}</span>;
        },
        sorter: true,
      },
      {
        title: _l('操作'),
        dataIndex: 'option',
        render: (text, record) => {
          const menu = (
            <div className="menuOption">
              {record.isVerified ? (
                <Fragment>
                  <div onClick={() => this.handleEditDept(record)}>{_l('修改关联部门')}</div>
                  <div onClick={() => this.hanldeDeleteDept(record)}>{_l('取消关联部门')}</div>
                </Fragment>
              ) : (
                <div onClick={() => this.handleSetDept(record)}>{_l('设置关联部门')}</div>
              )}
              <div onClick={() => this.props.setLevel('member', record.name, record.groupId)}>{_l('成员管理')}</div>
              <div
                onClick={() =>
                  record.status === 1 ? this.handleClose(record.groupId) : this.handleOpen(record.groupId)
                }
              >
                {record.status === 1 ? _l('关闭群组') : _l('开启群组')}
              </div>
              <div onClick={() => this.handleDissolve(record.groupId)}>{_l('解散群组')}</div>
            </div>
          );
          return (
            <Dropdown overlay={menu} trigger={['click']}>
              <span className="icon-moreop Font18 pointer Gray_9e"></span>
            </Dropdown>
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.getGroupsList();
  }

  changPage = page => {
    this.setState({ pageIndex: page, selectKeys: [] }, () => this.getGroupsList());
  };

  getGroupsList() {
    this.setState({ loading: true, selectKeys: [] });
    let reqData = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      keywords: this.state.keywords,
      sortType: parseInt(this.state.sortType),
      sortFiled: parseInt(this.state.sortField),
      firstLetters: [],
      containHidden: true,
      withMapDepartment: true,
      projectId: Config.projectId,
    };
    if (!isNaN(this.state.status)) {
      reqData.status = this.state.status;
    }
    if (!isNaN(this.state.types)) {
      reqData.groupType = this.state.types;
    }
    groupController.getGroups(reqData).then(data => {
      this.setState({
        // count: data.allCount,
        count: 49,
        list: data.list,
        loading: false,
      });
    });
  }

  //排序
  handleChangeSort(pagination, filters, sorter) {
    const { field, order } = sorter;
    const sortType = order === 'ascend' ? 1 : 0;
    this.setState(
      {
        sortField: order ? sortFieldTrans[field] : 0,
        sortType,
      },
      () => {
        this.getGroupsList();
      },
    );
  }

  handleEditDept(record) {
    const _this = this;
    DialogSelectMapGroupDepart({
      projectId: Config.projectId,
      defaultSelectId: record.mapDepartmentId,
      callback: function (data) {
        _this.updateDeptMappingGroup(record.groupId, true, data.departmentId);
      },
    });
  }

  hanldeDeleteDept(record) {
    const _this = this;
    const options = {
      container: {
        content: _l('确认取消关联部门?'),
        yesText: _l('确认'),
        noText: _l('取消'),
        header: _l('关联部门'),
        yesFn: () => {
          _this.updateDeptMappingGroup(record.groupId, false, record.mapDepartmentId);
        },
      },
      dialogBoxID: 'deleteDialogId',
      width: '480',
      height: '150',
    };
    ReactDom.render(<DialogLayer {...options} />, document.createElement('div'));
  }

  handleSetDept(record) {
    const _this = this;
    DialogSelectMapGroupDepart({
      projectId: Config.projectId,
      callback: function (data) {
        _this.updateDeptMappingGroup(record.groupId, true, data.departmentId);
      },
    });
  }

  //更新关联部门
  updateDeptMappingGroup = (groupId, isVerified, departmentId) => {
    let reqData = {
      groupId: groupId,
      isVerified: isVerified,
      mapDepartmentId: departmentId,
    };
    if (!reqData.mapDepartmentId) {
      alert(_l('请选择关联部门'), 3);
      return;
    }
    alert(_l('操作中，请稍候...'), 3);
    groupController.updateGroupVerified(reqData).then(data => {
      if (data) {
        alert(_l('操作成功'), 1);
        this.getGroupsList();
      } else {
        alert(_l('操作失败'), 3);
      }
    });
  };

  handleOpen(id) {
    const _this = this;
    const options = {
      container: {
        content: _l('确认开启所选择的群组?'),
        yesText: _l('确认'),
        noText: _l('取消'),
        header: _l('开启群组'),
        yesFn: () => {
          groupController
            .openGroup({
              groupIds: id ? [id] : _this.state.selectKeys,
            })
            .then(data => {
              if (data) {
                alert(_l('开启群组成功'));
                _this.getGroupsList();
              } else {
                alert(_l('开启群组失败'), 2);
              }
            });
        },
      },
      dialogBoxID: 'openDialogId',
      width: '480',
      height: '150',
    };
    ReactDom.render(<DialogLayer {...options} />, document.createElement('div'));
  }

  handleClose(id) {
    const _this = this;
    const options = {
      container: {
        content: _l('确认关闭所选择的群组?'),
        yesText: _l('确认'),
        noText: _l('取消'),
        header: _l('关闭群组'),
        yesFn: () => {
          groupController
            .closeGroup({
              groupIds: id ? [id] : _this.state.selectKeys,
            })
            .then(data => {
              if (data) {
                alert(_l('关闭群组成功'));
                _this.getGroupsList();
              } else {
                alert(_l('关闭群组失败'), 2);
              }
            });
        },
      },
      dialogBoxID: 'closeDialogId',
      width: '480',
      height: '150',
    };
    ReactDom.render(<DialogLayer {...options} />, document.createElement('div'));
  }

  handleDissolve(id) {
    const _this = this;
    const options = {
      container: {
        content: _l('确认解散所选择的群组？'),
        yesText: _l('确认'),
        noText: _l('取消'),
        header: _l('解散群组'),
        yesFn: () => {
          groupController
            .removeGroup({
              groupIds: id ? [id] : _this.state.selectKeys,
            })
            .then(data => {
              if (data) {
                alert(_l('解散群组成功'));
                _this.getGroupsList();
              } else {
                alert(_l('解散群组失败'), 2);
              }
            });
        },
      },
      dialogBoxID: 'dissolveDialogId',
      width: '480',
      height: '150',
    };
    ReactDom.render(<DialogLayer {...options} />, document.createElement('div'));
  }

  handleCreate() {
    const _this = this;
    CreateGroup.createInit({
      projectId: Config.projectId,
      callback: function () {
        _this.getGroupsList();
      },
    });
  }

  //下拉筛选
  handleSelectChange(value, key) {
    this.setState(
      {
        [key]: value,
        pageIndex: 1,
      },
      () => {
        this.getGroupsList();
      },
    );
  }

  //搜索框筛选
  handleInputChange(keywords) {
    this.setState(
      {
        keywords,
        pageIndex: 1,
      },
      () => {
        this.getGroupsList();
      },
    );
  }

  onSelectChange = selectKeys => {
    this.setState({ selectKeys });
  };

  render() {
    const { selectKeys, types, status, loading, list, count, pageSize, pageIndex } = this.state;
    const rowSelection = {
      selectedRowKeys: selectKeys,
      onChange: this.onSelectChange,
    };
    const detail = {
      icon: 'icon-myUpload',
      desc: _l('无群组'),
    };
    const GroupEmpty = () => <Empty detail={detail} />;
    return (
      <div className="groupsList">
        <div className="groupTool">
          <div className="groupItem">
            {selectKeys.length ? (
              <Fragment>
                <span className="Font16 color_b Bold LineHeight35">{_l(`已选择%0条`, selectKeys.length)}</span>
                <div className="mLeft32 Hand pTop3 itemIconBox" onClick={() => this.handleOpen()}>
                  <span className="icon Font14 icon-task-new-no-locked mRight5"></span>
                  <span className="LineHeight36">{_l('开启')}</span>
                </div>
                <div className="mLeft24 Hand pTop3 itemIconBox" onClick={() => this.handleClose()}>
                  <span className="icon Font14 icon-task-new-locked mRight5"></span>
                  <span className="LineHeight36">{_l('关闭')}</span>
                </div>
                <div className="mLeft24 Hand pTop3 itemIconBox" onClick={() => this.handleDissolve()}>
                  <span className="icon Font12 icon-workflow_cancel mRight5"></span>
                  <span className="LineHeight36">{_l('解散')}</span>
                </div>
              </Fragment>
            ) : (
              <button
                className="ming Button Button--primary Button--small itemCreate Bold"
                onClick={this.handleCreate.bind(this)}
              >
                {_l('新建群组')}
              </button>
            )}
          </div>
          <div className="groupItem">
            <Search allowClear placeholder={_l('搜索')} onSearch={value => this.handleInputChange(value)} />
            <Select
              allowClear
              className="mRight10 mLeft10"
              value={types}
              onChange={value => this.handleSelectChange(value, 'types')}
              placeholder={_l('全部类型')}
            >
              <Select.Option value={1}>{_l('官方群组')}</Select.Option>
              <Select.Option value={0}>{_l('普通群组')}</Select.Option>
            </Select>
            <Select
              allowClear
              value={status}
              onChange={value => this.handleSelectChange(value, 'status')}
              placeholder={_l('全部状态')}
            >
              <Select.Option value={1}>{_l('正常群组')}</Select.Option>
              <Select.Option value={0}>{_l('已关闭群组')}</Select.Option>
            </Select>
          </div>
        </div>
        <div className="tableList">
          <ConfigProvider renderEmpty={GroupEmpty}>
            <Spin indicator={<LoadDiv />} spinning={loading}>
              <Table
                rowSelection={rowSelection}
                rowKey={record => record.groupId}
                columns={this.columns}
                dataSource={list}
                pagination={false}
                showSorterTooltip={false}
                onChange={this.handleChangeSort.bind(this)}
                scroll={count == 0 ? {} : { y: count > pageSize ? 'calc(100vh - 300px)' : 'calc(100vh - 260px)' }}
              />
              {count > pageSize && (
                <PaginationWrap total={count} pageIndex={pageIndex} pageSize={pageSize} onChange={this.changPage} />
              )}
            </Spin>
          </ConfigProvider>
        </div>
      </div>
    );
  }
}
