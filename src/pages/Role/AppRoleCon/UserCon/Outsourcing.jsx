import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import { Icon } from 'ming-ui';
import Table from 'src/pages/Role/component/Table';
import cx from 'classnames';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import { pageSize } from './config';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import _ from 'lodash';
import { getCurrentProject } from 'src/util';
import UserHead from 'src/pages/feed/components/userHead';
import { getIcon, getColor, getTxtColor } from 'src/pages/Role/AppRoleCon/UserCon/config';
import moment from 'moment';

const Wrap = styled.div`
  padding: 20px 10px 20px 10px;
  .bar {
    padding: 0 44px;
    .toOthers,
    .del {
      font-weight: 400;
      color: #2196f3;
      line-height: 37px;
      height: 37px;
      background: #f3faff;
      padding: 0 20px;
      border-radius: 3px;
    }
  }
  .wrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 15);
  }
  .wrapTr.nameWrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 30);
  }
  .wrapTr.roleTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 40);
  }
`;
const WrapBar = styled.div`
  .addUser {
    line-height: 37px;
    background: #2196f3;
    border-radius: 3px;
    color: #fff;
    padding: 0 12px;
    display: inline-block;
  }
  .search .roleSearch {
    width: 244px;
    height: 37px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
  }
`;

const userStatusList = [
  {
    value: 0,
    tag: _l('全组织'),
    text: _l('部门'),
  },
  {
    value: 1,
    tag: _l('部门树'),
    text: _l('部门'),
  },
  {
    value: 2,
    text: _l('部门'),
  },
  {
    value: 3,
    text: _l('组织角色'),
  },
  {
    value: 4,
    text: _l('职位'),
  },
  {
    value: 5,
    text: _l('成员'),
  },
];

function Others(props) {
  const {
    appRole = {},
    SetAppRolePagingModel,
    getOutList,
    appId,
    setSelectedIds,
    projectId,
    delUserRole,
    changeUserRole,
  } = props;
  const { selectedIds = [] } = appRole;
  const [
    { keyWords, memberType, number, total, roleId, userList, appRolePagingModel, loading, selectedAll },
    setState,
  ] = useSetState({
    appRolePagingModel: _.get(props, ['appRole', 'appRolePagingModel']) || {},
    keyWords: _.get(props, ['appRole', 'appRolePagingModel', 'filterBy', 'filterByName']) || '',
    memberType: _.get(props, ['appRole', 'appRolePagingModel', 'filterBy', 'filterByMemberType']) || -1,
    number: _.get(props, ['appRole', 'appRolePagingModel', 'number']) || 1,
    total: _.get(props, ['appRole', 'outsourcing', 'totalCount']) || 0,
    roleId: _.get(props, ['roleId']),
    ascendingByTime: _.get(props, ['appRole', 'appRolePagingModel', 'sortBy', 'ascendingByTime', 'state']),
    ascendingByType: _.get(props, ['appRole', 'appRolePagingModel', 'sortBy', 'ascendingByType', 'state']),
    userList: _.get(props, ['appRole', 'outsourcing', 'memberModels']) || [],
    loading: props.appRole.loading,
    selectedAll: false,
  });
  useEffect(() => {
    getOutList({ appId }, true);
  }, []);
  useEffect(() => {
    setState({
      appRolePagingModel: _.get(props, ['appRole', 'appRolePagingModel']) || {},
      keyWords: _.get(props, ['appRole', 'appRolePagingModel', 'filterBy', 'filterByName']) || '',
      memberType: _.get(props, ['appRole', 'appRolePagingModel', 'filterBy', 'filterByMemberType']) || -1,
      number: _.get(props, ['appRole', 'appRolePagingModel', 'number']) || 1,
      total: _.get(props, ['appRole', 'outsourcing', 'totalCount']) || 0,
      user: _.get(props, ['appRole', 'user']) || {},
      ascendingByTime: _.get(props, ['appRole', 'appRolePagingModel', 'sortBy', 'ascendingByTime', 'state']),
      ascendingByType: _.get(props, ['appRole', 'appRolePagingModel', 'sortBy', 'ascendingByType', 'state']),
      userList: _.get(props, ['appRole', 'outsourcing', 'memberModels']) || [],
      loading: props.appRole.loading,
    });
  }, [props.appRole]);

  const columns = [
    {
      id: 'name',
      className: 'nameWrapTr',
      name: _l('用户'),
      minW: 240,
      render: (text, data, index) => {
        return (
          <div className={cx('name flexRow alignItemsCenter', { pLeft40: roleId === 'all' })}>
            {data.memberType === 5 ? (
              <UserHead
                key={data.accountId}
                projectId={_.isEmpty(getCurrentProject(projectId)) ? '' : projectId}
                size={32}
                lazy="false"
                user={{
                  ...data,
                  accountId: data.id,
                  userHead: data.avatar,
                }}
                className={'roleAvatar'}
              />
            ) : (
              <div className={'iconBG flexRow alignItemsCenter TxtCenter'} style={{ background: getColor(data) }}>
                <Icon icon={getIcon(data)} className={cx('Font24 flex', getTxtColor(data))} />
              </div>
            )}
            <div className={'memberInfo flex pLeft8 flexRow alignItemsCenter'}>
              <span className={'memberName overflow_ellipsis Block TxtLeft breakAll'} title={data.name}>
                {data.name}
              </span>
              {[2].includes(data.memberType) && (
                <span className={'memberTag mLeft8'}>
                  <span className={'tag'}>{_l('仅当前部门')}</span>
                </span>
              )}
              {data.isOwner && (
                <span className={'ownerTag mLeft8'}>
                  <span className={'tag'}>{_l('拥有者')}</span>
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'roleName',
      name: _l('角色'),
      minW: 240,
      className: 'nameWrapTr roleTr',
      render: (text, data, index) => {
        return (
          <div className="flex flexRow">
            <span className="roleName overflow_ellipsis breakAll" title={data.roleName.join('；')}>
              {data.roleName.join('；')}
            </span>
          </div>
        );
      },
    },
    {
      id: 'operater',
      name: _l('操作人'),
    },
    {
      id: 'operateTime',
      name: _l('添加时间'),
      sorter: true,
      className: 'timeTr',
      minW: 130,
      render: (text, data, index) => {
        return moment(data.operateTime).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      id: 'option',
      name: '',
      className: 'optionWrapTr',
      render: (text, data, index) => {
        const dataList = [
          {
            value: 0,
            text: _l('修改角色'),
          },
          {
            value: 1,
            text: <span className="">{_l('移出')}</span>,
          },
        ];

        return (
          <DropOption
            dataList={dataList}
            onAction={o => {
              if (o.value === 1) {
                delUserRole([data.id]);
              } else {
                changeUserRole([data.id]);
              }
            }}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [-180, 0],
            }}
          />
        );
      },
    },
  ];
  return (
    <Wrap className={cx('flex flexColumn overflowHidden', { isAllType: roleId !== 'all' })}>
      <div className="bar flexRow">
        <div className="title flex">
          <span className="Font17 Bold">{props.title}</span>{' '}
          <span className="Gray_9e mLeft10">{_l('%0个外协用户', total || 0)}</span>
        </div>
        {selectedIds.length > 0 && (
          <div>
            <span
              className={cx('toOthers InlineBlock Hand mLeft10')}
              onClick={() => {
                changeUserRole(selectedIds, selectedAll);
              }}
            >
              {_l('修改角色')}
            </span>
            <span
              className={cx('del InlineBlock Hand mLeft10')}
              onClick={() => {
                delUserRole(selectedIds, selectedAll);
              }}
            >
              {_l('移出')}
            </span>
          </div>
        )}
        {selectedIds.length <= 0 && (
          <WrapBar>
            <div className="search InlineBlock">
              <SearchInput
                className="roleSearch"
                placeholder={props.placeholder || _l('搜索')}
                value={keyWords}
                onChange={keyWords => {
                  setState({ keyWords });
                  SetAppRolePagingModel({
                    ...appRolePagingModel,
                    number: 1,
                    filterBy: { ...appRolePagingModel.filterBy, filterByName: keyWords },
                  });
                  getOutList({ appId }, true);
                }}
              />
            </div>
          </WrapBar>
        )}
      </div>
      <Table
        selectedAll={selectedAll}
        setSelectedAll={isCheck => {
          setState({
            selectedAll: isCheck,
          });
        }}
        pageSize={pageSize}
        columns={columns}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        showCheck={true}
        list={number <= 1 && loading ? [] : userList}
        pageIndex={number}
        total={total}
        onScrollEnd={() => {
          if (userList.length >= total || userList.length < pageSize * number || loading) {
            return;
          }
          setState({ number: number + 1 });
          SetAppRolePagingModel({
            ...appRolePagingModel,
            number: number + 1,
          });
          getOutList({ appId }, true);
        }}
        handleChangeSortHeader={sorter => {
          const { field, order } = sorter;
          let data = {};
          if (field === 'operateTime') {
            data = {
              ascendingByTime: {
                enable: ['ascend', 'descend'].includes(order),
                state: order === 'ascend',
              },
            };
          } else {
            data = {
              ascendingByType: {
                enable: ['ascend', 'descend'].includes(order),
                state: order === 'ascend',
              },
            };
          }
          SetAppRolePagingModel({
            ...appRolePagingModel,
            number: 1,
            sortBy: { ...appRolePagingModel.sortBy, ...data },
          });
          getOutList({ appId }, true);
        }}
        loading={loading}
      />
    </Wrap>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Others);
