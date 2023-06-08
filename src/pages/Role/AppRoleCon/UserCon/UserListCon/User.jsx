import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import { Icon, Dropdown, Menu, MenuItem, Tooltip, Dialog } from 'ming-ui';
import Trigger from 'rc-trigger';
import Table from 'src/pages/Role/component/Table';
import cx from 'classnames';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import _ from 'lodash';
import { getCurrentProject } from 'src/util';
import UserHead from 'src/pages/feed/components/userHead';
import { getIcon, getColor, getTxtColor, pageSize } from 'src/pages/Role/AppRoleCon/UserCon/config';
import moment from 'moment';
import { sysRoleType } from 'src/pages/Role/config.js';
import { userStatusList, initData } from 'src/pages/Role/AppRoleCon/UserCon/config.js';
import AppManagement from 'src/api/appManagement.js';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';

const Wrap = styled.div`
  padding: 20px 10px 20px 10px;
  .toRole {
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
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
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 20);
  }
  .wrapTr.roleTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 35);
  }

  .ming.Dropdown .Dropdown--input,
  .dropdownTrigger .Dropdown--input {
    padding: 0 !important;
  }
  .isCurmemberType {
    color: #2196f3;
  }
  .isMyRoleW {
    padding: 0px 7px;
    line-height: 18px;
    height: 18px;
    background: #2196f3;
    border-radius: 9px 9px 9px 9px;
    color: #fff;
    .tag {
      font-size: 12px;
      font-weight: 400;
    }
  }
  .topActDrop .Dropdown--input {
    display: flex;
    align-items: center;
    & > span.value {
      display: inline-block;
      flex: 1;
    }
    .icon {
      display: block;
    }
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
    &:hover {
      background: #0065bc;
    }
  }
  .search .roleSearch {
    width: 244px;
    height: 37px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
  }
`;

const userChooseList = [
  {
    value: 0,
    text: _l('所有类型'),
  },
  {
    value: 10,
    text: _l('人员'),
  },
  {
    value: 20,
    text: _l('部门'),
  },
  {
    value: 30,
    text: _l('组织角色'),
  },
  {
    value: 40,
    text: _l('职位'),
  },
];
const getNumTxt = user => {
  let l = [];
  if (user.departementCount > 0) {
    l.push(_l('%0个部门', user.departementCount));
  }
  if (user.organizeRoleCount > 0) {
    l.push(_l('%0组织角色', user.organizeRoleCount));
  }
  if (user.jobCount > 0) {
    l.push(_l('%0个职位', user.jobCount));
  }
  if (user.userCount > 0) {
    l.push(_l('%0名人员', user.userCount));
  }
  return l.join('、');
};
let Ajax = null;
function User(props) {
  const {
    appRole = {},
    SetAppRolePagingModel,
    getUserList,
    appId,
    setSelectedIds,
    projectId,
    delUserRole,
    changeUserRole,
    isAdmin,
    canEditUser,
    appDetail = {},
  } = props;
  const { selectedIds = [] } = appRole;
  const [
    {
      keyWords,
      memberType,
      pageIndex,
      total,
      roleId,
      userList,
      appRolePagingModel,
      loading,
      selectedAll,
      popupVisible,
      countTxt,
    },
    setState,
  ] = useSetState({
    appRolePagingModel: _.get(props, ['appRole', 'appRolePagingModel']) || {},
    keyWords: _.get(props, ['appRole', 'appRolePagingModel', 'keywords']) || '',
    memberType: _.get(props, ['appRole', 'appRolePagingModel', 'searchMemberType']) || 0,
    pageIndex: _.get(props, ['appRole', 'appRolePagingModel', 'pageIndex']) || 1,
    total: _.get(props, ['appRole', 'user', 'totalCount']) || 0,
    user: _.get(props, ['appRole', 'user']) || {},
    roleId: _.get(props, ['roleId']),
    userList: _.get(props, ['appRole', 'userList']) || [],
    loading: props.appRole.loading,
    selectedAll: false,
    popupVisible: false,
    countTxt: getNumTxt(_.get(props, ['appRole', 'user']) || {}),
  });
  useEffect(() => {
    setState({
      appRolePagingModel: _.get(props, ['appRole', 'appRolePagingModel']) || {},
      keyWords: _.get(props, ['appRole', 'appRolePagingModel', 'keywords']) || '',
      memberType: _.get(props, ['appRole', 'appRolePagingModel', 'searchMemberType']),
      pageIndex: _.get(props, ['appRole', 'appRolePagingModel', 'pageIndex']) || 1,
      total: _.get(props, ['appRole', 'user', 'totalCount']) || 0,
      user: _.get(props, ['appRole', 'user']) || {},
      userList: _.get(props, ['appRole', 'userList']) || [],
      loading: props.appRole.loading,
      countTxt: getNumTxt(_.get(props, ['appRole', 'user']) || {}),
    });
  }, [props.appRole]);
  const isRoleCharger = (
    (_.get(props, ['appRole', 'roleInfos']) || []).find(o => o.roleId === _.get(props, ['appRole', 'roleId'])) || {}
  ).canSetMembers; //是否当前角色的负责人或者有权管理改角色
  const isRunner = appDetail.permissionType === APP_ROLE_TYPE.RUNNER_ROLE; //运营者
  const canEdit = (isRoleCharger || isAdmin) && !(isRunner && ['all', 'apply', 'outsourcing'].includes(roleId)); //运营者不可编辑全部|审批|外协
  useEffect(() => {
    setState({
      roleId: _.get(props, ['roleId']),
      selectedAll: false,
    });
    //兼容非管理员，渲染问题
    if (!canEditUser && _.get(props, ['appRole', 'roleId']) === 'all') {
      return;
    }
    getUserList({ appId }, true);
  }, [props.roleId]);
  const columns = [
    {
      id: 'name',
      className: 'nameWrapTr',
      name: _l('用户'),
      minW: 240,
      renderHeader: () => {
        return (
          <div className="flex">
            <span className={cx('name', { pLeft40: !canEdit })}>{_l('用户')}</span>
          </div>
        );
      },
      render: (text, data, index) => {
        const isHead = data.isRoleCharger; // 角色负责人
        return (
          <div className={cx('name flexRow alignItemsCenter', { pLeft40: !canEdit })}>
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
              <div
                className={'iconBG flexRow alignItemsCenter TxtCenter'}
                style={{
                  background: getColor(data),
                }}
              >
                <Icon icon={getIcon(data)} className={cx('Font20 flex', getTxtColor(data))} />
              </div>
            )}
            <div className={'memberInfo flex pLeft8 flexRow alignItemsCenter'}>
              <span className={'memberName overflow_ellipsis Block TxtLeft breakAll'} title={data.name}>
                {data.name}
              </span>
              {isHead && (
                <Tooltip text={<span>{_l('角色负责人')} </span>} popupPlacement="top">
                  <i className="icon-people_5 Font14 mLeft7" style={{ color: '#FBBB44' }} />
                </Tooltip>
              )}
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
      id: 'memberType',
      name: _l('类型'),
      sorter: true, // roleId !== 'all',
      renderHeader: () => {
        return (
          <React.Fragment>
            <Dropdown
              isAppendToBody
              data={userChooseList}
              value={memberType}
              renderValue={_l('类型')}
              menuClass="Width120"
              className={cx('flex InlineBlock topActDrop', { isCurmemberType: memberType > 0 })}
              onChange={newValue => {
                setState({ memberType: newValue });
                SetAppRolePagingModel({
                  ...appRolePagingModel,
                  pageIndex: 1,
                  searchMemberType: newValue,
                });
                getUserList({ appId }, true);
              }}
            />
          </React.Fragment>
        );
      },

      render: (text, data, index) => {
        return (
          <div className="flex">
            <span className="memberType">{userStatusList.find(o => o.value === data.memberType).text}</span>
          </div>
        );
      },
    },
    {
      id: 'roleName',
      name: _l('角色'),
      className: 'nameWrapTr roleTr',
      minW: 240,
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
      // sorterType: 'ascend',
      className: 'operateTime timeTr',
      minW: 130,
      render: (text, data, index) => {
        return moment(data.operateTime).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      id: 'option',
      className: 'optionWrapTr',
      name: '',
      render: (text, data, index) => {
        if (data.isOwner) {
          return;
        }
        const roleData = props.roleList.find(o => o.roleId === roleId) || {};
        const isHead = data.isRoleCharger; // 角色负责人
        let dataList = [
          {
            value: -1,
            text: !isHead ? _l('设为角色负责人') : _l('取消角色负责人'),
          },
          {
            value: 0,
            text: roleId !== 'all' ? _l('移到其他角色') : _l('修改角色'),
          },
          {
            value: 1,
            text: <span className="">{_l('移出')}</span>,
          },
        ];
        if (
          sysRoleType.includes(roleData.roleType) || //系统角色下
          roleId === 'all' || //tab ‘全部’
          data.memberType !== 5 //只有人员可被添加成角色负责人
        ) {
          //排除角色负责人操作
          dataList = dataList.filter(o => o.value !== -1);
        }
        return (
          <DropOption
            dataList={dataList}
            onAction={o => {
              const itemId = [1, 2].includes(data.memberType) ? `${data.id}_${data.memberType}` : data.id;
              setState({
                selectedAll: false,
              });
              if (o.value === 1) {
                delUserRole([itemId]);
              } else if (o.value === -1) {
                let memberCategory = (userStatusList.find(o => data.memberType === o.value) || {}).key;
                if (isHead) {
                  //取消负责人
                  changeIsRoleManager({ memberCategory, appId, roleId, memberId: data.id }, false, () => {
                    alert(_l('取消成功'));
                  });
                } else {
                  // 设为负责人
                  return Dialog.confirm({
                    className: '',
                    title: <span className="Bold Font17">{_l('确认设置为角色负责人？')}</span>,
                    description: (
                      <div className="Gray_75 Font15 mBottom6 WordBreak">
                        {_l('角色负责人可添加、移出当前角色下的成员')}
                      </div>
                    ),
                    onOk: () => {
                      changeIsRoleManager({ memberCategory, appId, roleId, memberId: data.id }, true);
                    },
                  });
                }
              } else {
                changeUserRole([itemId]);
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
  //取消或设置成为角色负责人
  const changeIsRoleManager = (param, isRoleCharger, cb) => {
    if (Ajax) {
      Ajax.abort();
    }
    if (!isRoleCharger) {
      Ajax = AppManagement.cancelRoleCharger(param);
    } else {
      Ajax = AppManagement.setRoleCharger(param);
    }
    Ajax.then(res => {
      //取消当前用户的负责人，刷新页面
      if (param.memberId === md.global.Account.accountId && !isRoleCharger) {
        location.reload();
        return;
      }
      getUserList({ appId }, true);
      cb && cb();
    });
  };
  const renderPopup = () => {
    return (
      <Menu style={{ position: 'static' }}>
        {_.map([_l('人员'), _l('部门'), _l('组织角色'), _l('职位')], (o, i) => {
          return (
            <MenuItem
              key={i}
              onClick={() => {
                switch (i) {
                  case 0:
                    props.addUserToRole(userList.filter(o => o.memberType === 5).map(user => user.id));
                    break;
                  case 1:
                    props.addDepartmentToRole();
                    break;
                  case 2:
                    props.addOrgRole();
                    break;
                  case 3:
                    props.addJobToRole();
                    break;
                }
                setState({
                  popupVisible: false,
                  selectedAll: false,
                });
              }}
            >
              {o}
            </MenuItem>
          );
        })}
      </Menu>
    );
  };
  const builtinPlacements = {
    topLeft: {
      points: ['bl', 'tl'],
    },
    bottomLeft: {
      points: ['tl', 'bl'],
    },
  };
  const triggerProps = {
    popupClassName: 'ming Tooltip-white',
    prefixCls: 'Tooltip',
    action: ['click'],
    popup: renderPopup(),
    builtinPlacements,
    popupPlacement: 'bottomLeft',
    popupVisible: popupVisible,
    onPopupVisibleChange: visible => {
      setState({
        popupVisible: visible,
      });
    },
    popupAlign: {
      offset: [0, 5],
      overflow: {
        adjustX: 1,
        adjustY: 1,
      },
    },
    getPopupContainer: () => {
      return document.body;
    },
  };

  return (
    <Wrap className={cx('flex flexColumn overflowHidden', { isAllType: roleId !== 'all' })}>
      <div className="bar flexRow alignItemsCenter">
        <div className="title flex flexRow alignItemsCenter LineHeight26">
          <span className="Font17 Bold LineHeight26">{props.title}</span>
          <span className="Gray_9e mLeft15 LineHeight26 TxtMiddle mRight8 overflow_ellipsis breakAll" title={countTxt}>
            {countTxt}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <div>
            {canEdit && (
              <span
                className={cx('toOthers InlineBlock Hand mLeft10')}
                onClick={() => {
                  changeUserRole(selectedIds, selectedAll);
                }}
              >
                {roleId === 'all' ? _l('修改角色') : _l('移到其他角色')}
              </span>
            )}
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
                    pageIndex: 1,
                    keywords: keyWords,
                  });
                  getUserList({ appId }, true);
                }}
              />
            </div>
            {roleId !== 'all' && canEdit && (
              <Trigger {...triggerProps}>
                <div className="addUser Hand mLeft20 TxtTop Bold">
                  <Icon type="add" />
                  {_l('添加用户')}
                </div>
              </Trigger>
            )}
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
        ownerNoOption={true}
        pageSize={pageSize}
        columns={columns.filter(o => (canEdit ? true : o.id !== 'option'))}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        showCheck={canEdit}
        list={pageIndex <= 1 && loading ? [] : userList}
        pageIndex={pageIndex}
        total={total}
        onScrollEnd={() => {
          if (userList.length >= total || userList.length < pageSize * pageIndex || loading) {
            return;
          }
          setState({ pageIndex: pageIndex + 1 });
          SetAppRolePagingModel({
            ...appRolePagingModel,
            pageIndex: pageIndex + 1,
          });
          getUserList({ appId }, true);
        }}
        handleChangeSortHeader={sorter => {
          const { field, order } = sorter;
          let data = appRolePagingModel.sort.filter(o => o.fieldType !== (field === 'operateTime' ? 10 : 20));
          if (field === 'operateTime') {
            data = [...data, { fieldType: 10, isASC: order === 'ascend' }];
          } else {
            data = [...data, { fieldType: 20, isASC: order === 'ascend' }];
          }
          SetAppRolePagingModel({
            ...appRolePagingModel,
            pageIndex: 1,
            sort: data,
          });
          getUserList({ appId }, true);
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

export default connect(mapStateToProps, mapDispatchToProps)(User);