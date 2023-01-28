import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Radio, Menu, LoadDiv, Dialog, ScrollView } from 'ming-ui';
import { useSetState } from 'react-use';
import ConnectDesDia from '../../components/connectDesDialog';
import ConnectSet from './ConnectSet';
import APIList from './APIList';
import AuthorizeToApp from './AuthorizeToApp';
import { TYPELIST } from '../../config';
import Trigger from 'rc-trigger';
import PublishDialog from '../../components/PublishDialog';
import { RedMenuItemWrap, MenuItemWrap, ActWrap } from '../style';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import processAjax from 'src/pages/workflow/api/process';
import _ from 'lodash';
import ConnectAvator from '../../components/ConnectAvator';

const Wrap = styled.div`
  .scrollDiv {
    height: 0px;
  }
  p {
    margin: 0;
  }
  .chooseTypeCon {
    .Radio-text {
      font-weight: 600;
    }
  }
  height: 100%;
  background: #f7f7f7;
  position: relative;
  .head {
    transition: height 0.2s;
    &.isFix {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      padding-top: 10px;
      z-index: 10;
      .leftCon {
        position: absolute;
        z-index: 0;
        max-width: calc(50% - 230px);
        .des {
          display: none;
        }
        .logo {
          width: 32px;
          height: 32px;
          i {
            display: inline;
          }
        }
      }
      .tabCon {
        z-index: 1;
        li {
          padding-top: 10px;
        }
      }
      .node {
        position: fixed;
        right: 24px;
        height: 35px;
      }
    }
    .node {
    }
    padding: 20px 20px 0 37px;
    border-bottom: 1px solid rgb(235, 235, 235);
    background: #ffffff;
    .logo {
      width: 64px;
      height: 64px;
      background: #ffffff;
      border: 1px solid #efefef;
      border-radius: 32px;
    }
  }
  .connectTop {
    .icon {
      opacity: 0;
    }
    .docUrl {
      opacity: 1;
    }
    &:hover {
      .icon {
        opacity: 1;
        &:hover {
          color: #2196f3 !important;
        }
      }
    }
  }
  .tabCon {
    text-align: center;
    li {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      display: inline-block;
      margin: 0 18px;
      padding: 24px 8px 10px;
      box-sizing: border-box;
      border-bottom: 3px solid rgba(0, 0, 0, 0);
      &.disble {
        color: #757575;
      }
      &.isCur {
        color: #2196f3;
        border-bottom: 3px solid #2196f3;
      }
    }
  }
  .listCon {
    .chooseAuthType {
      width: 880px;
      padding: 24px;
      margin: 22px auto 0;
      background: #ffffff;
      border: 1px solid #dddddd;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.16);
      border-radius: 10px;
      text-align: center;
      .title {
        height: 24px;
        font-size: 17px;
        font-weight: 600;
        line-height: 22px;
        color: #333333;
      }
      .btn {
        margin: 40px auto 0;
        padding: 11px 50px;
        background: #2196f3;
        color: #fff;
        line-height: 1em;
        border-radius: 30px;

        &.disabled {
          opacity: 0.5;
        }
        &:hover {
          background: #1764c0;
        }
      }
    }
  }
  .infoDes {
    height: 34px;
  }
`;

const TABLIST = [_l('连接设置'), _l('API 管理'), _l('授权到应用')];

//连接 详情层
function ConnectCon(props) {
  const [
    {
      connectData,
      nodeInfo,
      loading,
      showMenu,
      showEdit,
      tab,
      isFix,
      show,
      apiCount,
      apiList,
      isChange,
      isConnectOwner,
    },
    setState,
  ] = useSetState({
    connectData: {},
    showEdit: false,
    tab: 0,
    isFix: false,
    show: false,
    nodeInfo: {},
    apiCount: 0,
    apiList: [],
    loading: true,
    showMenu: false,
    isChange: false,
    isConnectOwner: false,
  });
  const cache = useRef({
    isFix: false,
  });
  const headerRef = useRef();
  const WrapRef = useRef();
  const [authType, setAuthType] = useState(_.get(props, ['data', 'authType']));
  useEffect(() => {
    const { match = {} } = props;
    const { params = {} } = match;
    let propsId = params.id || _.get(props, ['data', 'id']);
    if (propsId) {
      getInfo(propsId);
      getDetailInfo(propsId);
    } else {
      setState({
        loading: false,
      });
    }
  }, []);
  useEffect(() => {
    window.addEventListener('scroll', HandleScroll, true);
    return () => {
      window.removeEventListener('scroll', HandleScroll, true);
    };
  }, []);

  useEffect(() => {
    setState({
      isConnectOwner: props.isSuperAdmin || connectData.isOwner,
    });
  }, [props.isSuperAdmin, connectData]);

  const HandleScroll = e => {
    e.stopPropagation();
    if (!WrapRef.current) return;
    let toFix = $(WrapRef.current).offset().top <= 50;
    if (toFix !== cache.current.isFix) {
      setState({
        isFix: toFix,
      });
      cache.current.isFix = toFix;
    }
  };
  // 获取基本详情
  const getDetailInfo = id => {
    packageVersionAjax.getDetail(
      {
        isPublic: true,
        id: id,
      },
      { isIntegration: true },
    ).then(
      res => {
        const { apks = [] } = res;
        let newData = { ...connectData, ...res, apks };
        if (props.isSuperAdmin || newData.isOwner) {
          setState({
            connectData: newData,
            isConnectOwner: true,
          });
        } else {
          setTimeout(() => {
            location.href = '/integration';
          }, 500);
          alert(_l('你暂时没有权限查看该连接！', 3));
        }
      },
      () => {
        setTimeout(() => {
          location.href = '/integration';
        }, 500);
        alert(_l('你暂时没有权限查看该连接！', 3));
      },
    );
  };
  //创建api管理
  const addConnet = () => {
    packageVersionAjax.add(
      {
        companyId: localStorage.getItem('currentProjectId'),
        defaultFlowNode: {
          actionId: TYPELIST.find(o => o.appType === authType).actionId,
          appType: authType,
        },
        explain: '',
        iconColor: '',
        iconName: '',
        name: _l('未命名连接'),
        relationId: '',
        relationType: 4,
        startEventAppType: 0,
      },
      { isIntegration: true },
    ).then(res => {
      getInfo(res.id);
      let newData = {
        ...connectData,
        ...res,
        isOwner: true,
        authType: authType,
        type: 1,
        ownerAccount: {
          ...res.ownerAccount,
          accountId: md.global.Account.accountId,
          fullName: md.global.Account.fullname,
        },
      };
      setState({
        connectData: newData,
        isChange: true,
        isConnectOwner: props.isSuperAdmin || newData.isOwner,
      });
    });
  };
  // 获取连接详情
  const getInfo = processId => {
    if (!processId) {
      return;
    }
    flowNodeAjax.get(
      {
        processId,
      },
      { isIntegration: true },
    ).then(res => {
      setState({
        nodeInfo: res,
        loading: false,
      });
      getApiListFetch(res.id);
    });
  };
  const getApiListFetch = id => {
    packageVersionAjax.getApiList(
      {
        companyId: localStorage.getItem('currentProjectId'),
        pageIndex: 1,
        pageSize: 100000, //PageSize,
        keyword: '',
        relationId: id,
      },
      { isIntegration: true },
    ).then(res => {
      setState({ apiCount: res.length, apiList: res });
    });
  };
  // 更新基本信息
  const updateInfo = info => {
    processAjax.updateProcess(
      {
        companyId: localStorage.getItem('currentProjectId'),
        processId: connectData.id,
        name: info.name,
        explain: info.explain,
        iconName: (info.iconName || '').split('?e=')[0],
      },
      { isIntegration: true },
    ).then(res => {
      //新建的会丢ownerAccount
      let newData = {
        ...connectData,
        ...res,
        ownerAccount: !res.ownerAccount.accountId ? connectData.ownerAccount : res.ownerAccount,
        isOwner: connectData.isOwner,
        iconName: info.iconName,
        isChange: true,
      };
      setState({
        connectData: newData,
        isConnectOwner: props.isSuperAdmin || newData.isOwner,
      });
    });
  };
  const upperConnect = info => {
    packageVersionAjax.upper(
      {
        id: connectData.id,
        ...info,
      },
      { isIntegration: true },
    ).then(res => {
      if (res) {
        setState({ show: false });
        getDetailInfo(connectData.id); //上架成功，重新获取一次详情
        alert(_l('已申请上架，请等待审核'));
      } else {
        alert(_l('申请失败，请稍后再试', 2));
      }
    });
  };
  const renderCon = () => {
    switch (tab) {
      case 0:
        return (
          <ConnectSet
            hasChange={() =>
              setState({
                isChange: true,
              })
            }
            {...nodeInfo}
            connectId={connectData.id}
            connectType={connectData.type}
            isConnectOwner={isConnectOwner}
          />
        );
      case 1:
        return (
          <APIList
            {...connectData}
            connectData={connectData}
            isConnectOwner={isConnectOwner}
            hasChange={() =>
              setState({
                isChange: true,
              })
            }
            connectType={connectData.type}
            apiList={apiList}
            updateList={apiList => {
              setState({ apiCount: apiList.length, apiList: apiList });
            }}
            apkCount={props.apkCount}
          />
        );
      case 2:
        return (
          <AuthorizeToApp
            {...nodeInfo}
            isConnectOwner={isConnectOwner}
            isSuperAdmin={props.isSuperAdmin}
            processId={connectData.id}
            list={connectData.apks || []}
            hasChange={() =>
              setState({
                isChange: true,
              })
            }
            onFresh={() => {
              setState({
                isChange: true,
              });
              getDetailInfo(connectData.id);
            }}
          />
        );
    }
  };
  const openNewPage = () => {
    window.open(`/integrationConnect/${localStorage.getItem('currentProjectId')}/${connectData.id}`);
  };

  const onDel = () => {
    packageVersionAjax.delete(
      {
        id: connectData.id,
      },
      { isIntegration: true },
    ).then(res => {
      if (res) {
        alert(_l('删除成功'));
        setTimeout(() => {
          location.href = '/integration';
        }, 1000);
      } else {
        alert(_l('有API被引用，请删除引用后重试'), 3);
      }
    });
  };
  if (loading) {
    return <LoadDiv />;
  }
  {
    props.forPage ? (document.title = `${_l('集成中心')}-${connectData.name || _l('未命名连接')}`) : '';
  }
  return (
    <ScrollView>
      <Wrap>
        <div className={cx('head', { isFix })} ref={headerRef}>
          <div className="flexRow leftCon">
            <ActWrap
              className="act InlineBlock TxtMiddle TxtCenter mLeft0 mRight32 Hand LineHeight36"
              onClick={() => {
                if (location.href.indexOf('integrationConnect') < 0) {
                  props.onClose(isChange);
                } else {
                  if (history.length === 1) {
                    location.href = '/integration';
                  } else {
                    history.back();
                  }
                }
              }}
            >
              <Icon icon="knowledge-return" className="Font16" />
            </ActWrap>
            <div className="Hand connectDes flexRow flex" onClick={() => {}}>
              <ConnectAvator {...connectData} width={isFix ? 32 : 64} size={isFix ? 22 : 50} />
              <div className={cx('connectTop mLeft16', { mTop8: !isFix, 'mTop2 flex overflowHidden': isFix })}>
                <p className={cx('name Font20', { 'flexRow flex alignItemsCenter': isFix, Block: !isFix })}>
                  <span className={cx({ 'flex WordBreak overflow_ellipsis': isFix })}>
                    {connectData.name || _l('未命名连接')}
                  </span>
                  {connectData.type === 2 && (
                    // 安装的API 有文档链接icon
                    <Icon
                      className="Hand docUrl Font14 InlineBlock ThemeColor3 mLeft5"
                      icon="task-new-detail"
                      onClick={() => {
                        window.open(connectData.info.docUrl);
                      }}
                    />
                  )}
                  {!!nodeInfo.startEventId &&
                    (connectData.type === 1 || connectData.type === 2) && //自定义的连接或者安装的 安装的连接 不可修改连接LOGO
                    isConnectOwner && (
                      <Icon
                        icon="edit"
                        className="Gray_9d mLeft8"
                        onClick={() => {
                          setState({ showEdit: true });
                        }}
                      />
                    )}
                </p>
                <p className="des Gray_9e pRight8">{connectData.explain || _l('添加连接说明')}</p>
              </div>
            </div>
            {showEdit && (
              <div className="connectDesDia">
                <ConnectDesDia
                  onOk={connectData => {
                    setState({ showEdit: false, isChange: true });
                    updateInfo(connectData);
                  }}
                  data={connectData}
                  onClickAway={() => {
                    setState({ showEdit: false });
                  }}
                  onClickAwayExceptions={[
                    '.ant-modal-mask',
                    '.ant-modal-wrap',
                    '.mdDialog',
                    '.mui-dialog-scroll-container',
                  ]}
                />
              </div>
            )}
            {(connectData.ownerAccount || (connectData.info || {}).createdBy) && (
              <div className="Gray_75 node TxtMiddle mLeft10 flexRow infoDes alignItemsCenter">
                {connectData.type === 2 ? (
                  <React.Fragment>
                    <span className="Gray mRight8">{connectData.ownerAccount.fullName}</span>
                    <span className="" style={{ color: '#999' }}>
                      {_l('安装于')}
                      {connectData.createdDate}
                    </span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <span className="Gray_75 mRight8">{connectData.ownerAccount.fullName}</span>
                    <span className="" style={{ color: '#999' }}>
                      {!connectData.lastModifiedDate ? _l('创建于') : _l('更新于')}
                      {connectData.lastModifiedDate ? connectData.lastModifiedDate : connectData.createdDate}
                    </span>
                  </React.Fragment>
                )}
                {(isConnectOwner || location.href.indexOf('integrationConnect') < 0) && (
                  <Trigger
                    action={['click']}
                    popupVisible={showMenu}
                    onPopupVisibleChange={visible => {
                      setState({
                        showMenu: visible,
                      });
                    }}
                    popup={
                      <Menu>
                        {location.href.indexOf('integrationConnect') < 0 && (
                          <MenuItemWrap
                            icon={<Icon icon="launch" className="Font17 mLeft5" />}
                            onClick={() => {
                              openNewPage();
                            }}
                          >
                            <span>{_l('新页面打开')}</span>
                          </MenuItemWrap>
                        )}
                        {isConnectOwner && (
                          <React.Fragment>
                            {/* 自定义连接如果还未上架，则有「申请上架」菜单可选；如果已经上架，则弹出「申请上架新版本」菜单； */}
                            {!md.global.Config.IsLocal && //私有部署没有上架
                              connectData.type !== 2 && ( //安装的连接 不能上架
                                <MenuItemWrap
                                  icon={<Icon icon="publish" className="Font17 mLeft5" />}
                                  onClick={() => {
                                    setState({ show: true, showMenu: false });
                                  }}
                                >
                                  {/* 状态 0已删除 1正常 2审核中 3已发布 */}
                                  <span>
                                    {connectData.status === 3 || connectData.info
                                      ? _l('申请上架新版本')
                                      : _l('申请上架到API库')}
                                  </span>
                                </MenuItemWrap>
                              )}
                            {/* 可以「删除」已添加的自定义连接；删除前需要后端判断是否有API被引用，被引用则不能删除； */}
                            <RedMenuItemWrap
                              icon={<Icon icon="task-new-delete" className="Font17 mLeft5" />}
                              onClick={() => {
                                setState({ showMenu: false });
                                Dialog.confirm({
                                  title: <span className="Red">{_l('删除')}</span>,
                                  buttonType: 'danger',
                                  width: 500,
                                  description: _l('删除后将不可恢复，确认删除吗？'),
                                  onOk: () => {
                                    onDel();
                                  },
                                });
                              }}
                            >
                              <span>{_l('删除')}</span>
                            </RedMenuItemWrap>
                          </React.Fragment>
                        )}
                      </Menu>
                    }
                    popupClassName={cx('dropdownTrigger')}
                    popupAlign={{
                      points: ['tl', 'bl'],
                      overflow: {
                        adjustX: true,
                        adjustY: true,
                      },
                    }}
                  >
                    <ActWrap
                      className="act InlineBlock TxtMiddle TxtCenter"
                      onClick={() => {
                        setState({
                          showMenu: true,
                        });
                      }}
                    >
                      <i className={'icon-more_vert Font22 TxtMiddle'} />
                    </ActWrap>
                  </Trigger>
                )}
              </div>
            )}
          </div>
          <div className="tabCon">
            <ul>
              {TABLIST.map((o, i) => {
                return (
                  <li
                    className={cx('Hand', { isCur: tab === i, disble: !nodeInfo.startEventId })}
                    onClick={() => {
                      if (!nodeInfo.startEventId) {
                        return;
                      }
                      setState({ tab: i });
                    }}
                  >
                    {o}
                    {i === 0 ? '' : `( ${i === 1 ? apiCount : (connectData.apks || []).length} )`}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className={cx('listCon')} style={{ 'padding-top': isFix ? 124 : 0 }}>
          <div className="scrollDiv" ref={WrapRef}></div>
          {!nodeInfo.startEventId && !loading ? ( //新创建
            <div className="chooseAuthType">
              <p className="title TxtLeft">{_l('请选择鉴权方式')}</p>
              <ul className="flexRow mTop30">
                {TYPELIST.map(o => {
                  return (
                    <li className="flex chooseTypeCon">
                      <Radio
                        className=""
                        text={o.name}
                        checked={authType === o.appType}
                        onClick={() => {
                          setAuthType(o.appType);
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
              <div
                className={cx('btn Bold', { disabled: !authType })}
                onClick={e => {
                  if (!authType) {
                    return;
                  }
                  addConnet();
                }}
              >
                {_l('保存并继续')}
              </div>
            </div>
          ) : (
            renderCon()
          )}
        </div>
        {show && (
          <PublishDialog
            onOk={data => {
              upperConnect(data);
            }}
            onCancel={() => {
              setState({ show: false });
            }}
            isSuperAdmin={props.isSuperAdmin}
            connectInfo={connectData}
            info={connectData.info}
            status={connectData.status}
            list={apiList.filter(o => o.enabled)} ///默认选择全部已启用的API，未启用的API不显示在列表中
          />
        )}
      </Wrap>
    </ScrollView>
  );
}

export default ConnectCon;
