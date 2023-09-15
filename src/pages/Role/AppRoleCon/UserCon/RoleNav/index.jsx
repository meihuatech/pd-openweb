import React from 'react';
import cx from 'classnames';
import { WrapNav, AddWrap } from 'src/pages/Role/style';
import _ from 'lodash';
import styled from 'styled-components';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { navigateTo } from 'src/router/navigateTo';
import { sysRoleType } from 'src/pages/Role/config.js';
import ItemCon from './ItemCon';
const WrapL = styled.div`
  .roleSearch {
    background: #fff;
    border-radius: 0;
    width: 100%;
    padding-left: 0;
  }
`;
const Wrap = styled.p`
  font-size: 12px;
  font-weight: bold;
  color: #9e9e9e;
  padding-left: 18px;
  margin: 10px 0 4px 0;
`;

const navList = [
  {
    name: _l('全部'),
    roleId: 'all',
  },
  {
    name: _l('申请加入'),
    roleId: 'apply',
  },
  {
    name: _l('外协用户'),
    roleId: 'outsourcing',
  },
];

export default class Con extends React.Component {
  renderNav = () => {
    const {
      setRoleId,
      appRole = {},
      canEditUser,
      SetAppRolePagingModel,
      setSelectedIds,
      appId,
      canEditApp,
    } = this.props;
    const { roleInfos = [], apply = [], outsourcing = {}, total } = appRole;
    const { roleId, roleList = [], keywords } = this.props;
    const sysList = roleList.filter(o => sysRoleType.includes(o.roleType));
    const otherList = roleList.filter(o => !sysRoleType.includes(o.roleType));
    return (
      <React.Fragment>
        <WrapL className="">
          {/* 非管理员无法操作，不能查看“申请加入”“设置”“全部”“外协用户” */}
          {canEditUser && (
            <div className="navCon bTBorder">
              <ul>
                {navList.map(o => {
                  return (
                    <li
                      className={cx('flexRow alignItemsCenter', { cur: roleId === o.roleId })}
                      onClick={() => {
                        this.props.onChange({
                          roleId: o.roleId,
                        });
                        navigateTo(`/app/${appId}/role`);
                        setRoleId(o.roleId);
                        SetAppRolePagingModel(null);
                        setSelectedIds([]);
                      }}
                    >
                      <span className="flex Font14">
                        {o.name}
                        {o.roleId === 'apply' && apply.length > 0 && <span className="hs mLeft2 InlineBlock" />}
                      </span>
                      <span className="num">
                        {o.roleId === 'all'
                          ? total || 0
                          : o.roleId === 'apply'
                          ? apply.length
                          : outsourcing.totalCount || 0}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="search mTop16">
            <SearchInput
              className="roleSearch"
              placeholder={_l('搜索角色')}
              value={keywords}
              onChange={keywords => {
                this.props.onChange({
                  keywords,
                  roleList: roleInfos.filter(o => o.name.indexOf(keywords) >= 0),
                });
              }}
            />
          </div>
        </WrapL>
        <div className="navCon flex navConList">
          {roleList.length <= 0 ? (
            <div className="TxtCenter Gray_bd mTop20">{_l('无相关角色')}</div>
          ) : (
            <ul>
              {sysList.length > 0 && <Wrap>{_l('系统')}</Wrap>}
              {sysList.map(o => {
                return <ItemCon {...this.props} data={o} />;
              })}
              {sysList.length > 0 && <div style={{ paddingTop: 6 }}></div>}
              {otherList.length > 0 && (
                <React.Fragment>
                  <Wrap>{_l('普通')}</Wrap>
                  {otherList.map(o => {
                    return <ItemCon {...this.props} data={o} />;
                  })}
                </React.Fragment>
              )}
              {canEditApp && (
                <AddWrap
                  className="Hand"
                  onClick={() => {
                    this.props.setQuickTag({ roleId: 'new', tab: 'roleSet' });
                    setTimeout(() => {
                      this.props.setQuickTag({ roleId: '', tab: 'roleSet' });
                    }, 0);
                  }}
                >
                  <i class="ming Icon icon-add icon icon-undefined"></i>
                  {_l('创建角色')}
                </AddWrap>
              )}
            </ul>
          )}
        </div>
      </React.Fragment>
    );
  };

  render() {
    return <WrapNav className="flexColumn">{this.renderNav()}</WrapNav>;
  }
}
