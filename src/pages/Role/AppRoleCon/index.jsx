import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import { WrapCon, WrapHeader, WrapContext } from 'src/pages/Role/style';
import AppAjax from 'src/api/appManagement';
import { ROLE_TYPES, ROLE_CONFIG } from 'src/pages/Role/config';
import UserCon from './UserCon';
import RoleCon from './RoleCon';
import { Checkbox, Tooltip } from 'ming-ui';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import LoadDiv from 'ming-ui/components/LoadDiv';
import _ from 'lodash';

const conList = [
  {
    url: '/',
    key: 'user',
    txt: _l('用户'),
  },
  { url: '/roleSet', key: 'roleSet', txt: _l('角色权限') },
  // {
  //   url: '/others',
  //   key: 'others',
  //   txt: _l('用户扩展信息'),
  // },
];
class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'user',
      rolesVisibleConfig: null,
      notify: false,
    };
    const { setQuickTag } = props;
    setQuickTag();
  }
  componentDidMount() {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const { isAdmin, getRoleSummary, fetchAllNavCount, setSelectedIds } = this.props;
    setSelectedIds([]);
    isAdmin && this.getSet();
    fetchAllNavCount({
      isAdmin,
      appId,
    });
    if (!isAdmin) {
      this.setState({
        tab: 'user',
      });
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(this.props.appRole.quickTag, nextProps.appRole.quickTag) && !!nextProps.appRole.quickTag.tab) {
      this.setState({
        tab: nextProps.appRole.quickTag.tab || 'user',
      });
    }
  }

  getSet = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;

    AppAjax.getAppRoleSetting({ appId }).then(data => {
      this.setState({ rolesVisibleConfig: String(data.appSettingsEnum), notify: data.notify });
    });
  };
  handleSwitchRolesDisplay = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const { rolesVisibleConfig } = this.state;
    const status = rolesVisibleConfig === ROLE_CONFIG.REFUSE ? ROLE_CONFIG.PERMISSION : ROLE_CONFIG.REFUSE;
    AppAjax.updateMemberStatus({ appId, status }).then(data => {
      if (data) {
        this.setState({ rolesVisibleConfig: status });
      }
    });
  };
  updateAppRoleNotify = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const { notify } = this.state;
    AppAjax.updateAppRoleNotify({ appId, notify: !notify }).then(data => {
      if (data) {
        this.setState({ notify: !notify });
      }
    });
  };
  renderCon = () => {
    const { tab } = this.state;
    switch (tab) {
      case 'roleSet':
        return <RoleCon {...this.props} tab={tab} />;
      default:
        return <UserCon {...this.props} tab={tab} />;
    }
  };
  /**
   * 转交他人
   */
  transferApp = () => {
    const {
      projectId,
      match: {
        params: { appId },
      },
    } = this.props;
    import('src/components/dialogSelectUser/dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
        showMoreInvite: false,
        SelectUserSettings: {
          projectId,
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          unique: true,
          callback: users => {
            AppAjax.updateAppOwner({
              appId,
              memberId: users[0].accountId,
            }).then(res => {
              if (res) {
                location.reload();
              } else {
                alert(_l('托付失败'), 2);
              }
            });
          },
        },
      });
    });
  };
  render() {
    const { isAdmin, appRole = {}, setQuickTag, isOwner } = this.props;
    const { notify, rolesVisibleConfig } = this.state;
    const { pageLoading } = appRole;
    if (pageLoading) {
      return <LoadDiv />;
    }
    return (
      <WrapCon className="flexColumn overflowHidden">
        <WrapHeader>
          <div className="tabCon InlineBlock pLeft26">
            {conList
              .filter(o => (isAdmin ? true : o.key === 'user'))
              .map(o => {
                return (
                  <span
                    className={cx('tab Hand Font14 Bold', { cur: this.state.tab === o.key })}
                    onClick={() => {
                      this.props.handleChangePage(() => {
                        setQuickTag();
                        this.setState({
                          tab: o.key,
                        });
                      });
                    }}
                  >
                    {o.txt}
                  </span>
                );
              })}
          </div>
          {isAdmin && (
            <div className="Right flexRow pTop20 pRight20">
              <Tooltip
                text={
                  <span>
                    {_l('开启时，当用户被添加、移除、变更角色时会收到系统通知，关闭时，以上操作不通知用户。')}
                  </span>
                }
                popupPlacement={'top'}
              >
                <span className="">
                  <Checkbox
                    className=""
                    size="small"
                    checked={notify}
                    onClick={this.updateAppRoleNotify}
                    text={_l('发送通知')}
                  />
                </span>
              </Tooltip>
              <Tooltip
                text={
                  <span>
                    {_l(
                      '开启时，普通用户（非管理员）可以查看应用下所有角色和人员。关闭后，普通用户将只能看到应用管理员。',
                    )}
                  </span>
                }
                popupPlacement={'top'}
              >
                <span>
                  <Checkbox
                    className="mLeft25"
                    size="small"
                    checked={rolesVisibleConfig !== ROLE_CONFIG.REFUSE}
                    onClick={this.handleSwitchRolesDisplay}
                    text={_l('允许查看')}
                  />
                </span>
              </Tooltip>
            </div>
          )}
          {isOwner && (
            <div className="Right pTop20 pRight20">
              <DropOption
                dataList={[
                  {
                    value: 0,
                    text: _l('转交应用'),
                  },
                ]}
                onAction={o => {
                  this.transferApp();
                }}
                popupAlign={{
                  points: ['tr', 'br'],
                  offset: [-180, 0],
                }}
              />
            </div>
          )}
        </WrapHeader>
        <WrapContext className={cx('flex')}>{this.renderCon()}</WrapContext>
      </WrapCon>
    );
  }
}
const mapStateToProps = state => ({
  appRole: state.appRole,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Con);
