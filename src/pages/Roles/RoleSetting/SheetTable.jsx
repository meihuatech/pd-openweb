import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Icon, Checkbox, Tooltip } from 'ming-ui';
import TransitionGroup from 'react-addons-transition-group';
import ViewGroup from './ViewGroup';
import TooltipSetting from '../TooltipSetting';
import styles from './style.less?module';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import SvgIcon from 'src/components/SvgIcon';

export const changeSheetModel = (sheet, type, checked) => {
  const KEYS = {
    READ: 'canRead',
    EDIT: 'canEdit',
    REMOVE: 'canRemove',
    ADD: 'canAdd',
  };
  const viewAuth = KEYS[type];
  if ('canAdd' === KEYS[type]) {
    return {
      ...sheet,
      canAdd: checked,
      views: _.map(sheet.views, view => {
        return {
          ...view,
          canRead: checked && getViewSize(sheet.views, 'canRead') <= 0 ? true : view.canRead,
        };
      }),
    };
  }
  return {
    ...sheet,
    canAdd: 'canRead' === KEYS[type] && !checked ? false : sheet.canAdd,
    views: _.map(sheet.views, view => {
      if (viewAuth !== 'canRead') {
        return {
          ...view,
          [viewAuth]: checked,
          canRead: checked ? true : view.canRead,
          navigateHide: !checked ? false : view.navigateHide,
        };
      } else {
        return {
          ...view,
          [viewAuth]: checked,
          canEdit: false,
          canRemove: false,
        };
      }
    }),
  };
};

const changeViewModel = (sheet, viewId, payload) => {
  return {
    ...sheet,
    views: _.map(sheet.views, view => {
      if (view.viewId === viewId) {
        return {
          ...view,
          ...payload,
        };
      } else {
        return view;
      }
    }),
  };
};

const isExist = (views, keyName) => {
  return _.some(views, view => view[keyName]);
};

const getViewSize = (views, keyName) => {
  return _.filter(views, view => view[keyName]).length;
};

export default class extends PureComponent {
  state = {
    show: false,
  };

  formatViews = views => {
    const readSize = getViewSize(views, 'canRead');
    const editSize = getViewSize(views, 'canEdit');
    const removeSize = getViewSize(views, 'canRemove');
    // 逻辑表达式 短路
    const showRead = isExist(views, 'canRead');
    const showEdit = isExist(views, 'canEdit');
    const showRemove = isExist(views, 'canRemove');

    return { readSize, editSize, removeSize, showRead, showEdit, showRemove };
  };

  toggleViewAuth = (key, checked) => {
    const { sheet, onChange } = this.props;
    onChange(changeSheetModel(sheet, key, checked));
  };

  toggleViewLevel = (viewId, payload, isAllNoRead) => {
    const { sheet, onChange } = this.props;
    onChange(changeViewModel({ ...sheet, canAdd: isAllNoRead ? false : sheet.canAdd }, viewId, payload));
  };

  changeSheetLevel = payload => {
    const { sheet, onChange } = this.props;
    onChange({
      ...sheet,
      ...payload,
    });
  };

  render() {
    const { sheet, getContainer, updateLookPages, updateNavigateHide } = this.props;
    const { readSize, editSize, removeSize, showRead, showEdit, showRemove } = this.formatViews(sheet.views);
    const showToolTipSetting = showRead || showEdit || showRemove;
    const AUTH = [
      { size: readSize, key: 'READ' },
      { size: editSize, key: 'EDIT' },
      { size: removeSize, key: 'REMOVE' },
      { key: 'ADD' },
    ];
    return (
      <div className={styles.tableRow}>
        <div className={styles.viewsGroup}>
          <div
            className={classNames('Hand', styles.viewSetting)}
            onClick={() => {
              this.setState({
                show: !this.state.show,
              });
            }}
          >
            <div
              className={classNames(
                'boxSizing TxtLeft Hand  flexRow',
                sheet.sheetId && sheet.views && sheet.views.length ? 'pLeft5' : 'pLeft25',
                styles.viewSettingItemMax,
              )}
              title={sheet.sheetName}
            >
              {!!(sheet.sheetId && sheet.views && sheet.views.length) && (
                <Icon
                  icon="arrow-right-tip"
                  className={classNames('Gray_75', styles.arrowIcon, {
                    [styles.rotated]: this.state.show,
                  })}
                />
              )}
              <span className="mRight6 InlineBlock">
                <SvgIcon
                  url={sheet.iconUrl}
                  fill={'#757575'}
                  size={18}
                />
              </span>
              <span className="flex overflow_ellipsis ThemeHoverColor3">{sheet.sheetName || sheet.name}</span>
              <Tooltip
                popupPlacement="top"
                disable={!(sheet.checked || readSize > 0)}
                text={<span>{_l('在导航中隐藏')}</span>}
              >
                <span
                  className={classNames('mLeft7', styles.arrowIconShow, {
                    [styles.show]: sheet.navigateHide,
                    [styles.canShow]: sheet.checked || readSize > 0,
                  })}
                  onClick={e => {
                    if (sheet.checked || readSize > 0) {
                      updateNavigateHide(!!sheet.sheetId, sheet.pageId || sheet.sheetId, !sheet.navigateHide);
                      e.stopPropagation();
                    }
                  }}
                >
                  <Icon icon="public-folder-hidden" />
                </span>
              </Tooltip>
            </div>

            {sheet.sheetId ? (
              AUTH.map((item, index) => (
                <div key={index} className={styles.viewSettingItem} style={{ height: 45 }}>
                  <Checkbox
                    className="InlineBlock"
                    checked={
                      item.key === 'ADD' ? (readSize <= 0 ? false : sheet.canAdd) : item.size === sheet.views.length
                    }
                    clearselected={item.key !== 'ADD' && item.size > 0 && item.size !== sheet.views.length}
                    onClick={(checked, value, event) => {
                      this.toggleViewAuth(item.key, !checked);
                      event.stopPropagation();
                    }}
                  />
                  {!!item.size && <div>{item.size === sheet.views.length ? _l('全部') : _l('%0个', item.size)}</div>}
                </div>
              ))
            ) : (
              <div className={styles.viewSettingItem} style={{ height: 45 }}>
                <Checkbox
                  className="InlineBlock"
                  checked={sheet.checked}
                  onClick={checked => updateLookPages(sheet.pageId, !sheet.checked)}
                />
              </div>
            )}
          </div>
          {sheet.sheetId && (
            <TransitionGroup component="div">
              {this.state.show ? (
                <ViewGroup className={styles.viewGroup} hasViews={!!(sheet.views && sheet.views.length)}>
                  {_.map(sheet.views, view => {
                    return (
                      <div className={styles.viewSetting} key={view.viewId}>
                        <div className={'boxSizing TxtLeft overflow_ellipsis ' + styles.viewSettingItemMax}>
                          <Icon
                            className="Gray_bd mRight8 Font14"
                            icon={_.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[view.type] }).icon}
                          />
                          {view.viewName}
                        </div>
                        <div className={styles.viewSettingItem} style={{ height: 45 }}>
                          <Checkbox
                            checked={view.canRead}
                            className="InlineBlock"
                            onClick={checked => {
                              const payload = checked
                                ? {
                                    canEdit: false,
                                    canRead: false,
                                    canRemove: false,
                                  }
                                : {
                                    canRead: true,
                                  };
                              this.toggleViewLevel(view.viewId, payload, (!checked ? readSize + 1 : readSize - 1) <= 0);
                            }}
                          />
                        </div>
                        <div className={styles.viewSettingItem} style={{ height: 45 }}>
                          <Checkbox
                            checked={view.canEdit}
                            className="InlineBlock"
                            onClick={checked => {
                              const payload = checked
                                ? {
                                    canEdit: false,
                                    canRead: true,
                                  }
                                : {
                                    canEdit: true,
                                    canRead: true,
                                  };
                              this.toggleViewLevel(view.viewId, payload);
                            }}
                          />
                        </div>
                        <div className={styles.viewSettingItem} style={{ height: 45 }}>
                          <Checkbox
                            checked={view.canRemove}
                            className="InlineBlock"
                            onClick={checked => {
                              const payload = checked
                                ? {
                                    canRemove: false,
                                    canRead: true,
                                  }
                                : {
                                    canRemove: true,
                                    canRead: true,
                                  };
                              this.toggleViewLevel(view.viewId, payload);
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </ViewGroup>
              ) : null}
            </TransitionGroup>
          )}
        </div>
        <div className={classNames(styles.settingGroup, { [styles.showSet]: showToolTipSetting })}>
          {showToolTipSetting ? (
            <TooltipSetting
              showRead={showRead}
              showEdit={showEdit}
              showRemove={showRemove}
              canAdd={sheet.canAdd}
              readLevel={sheet.readLevel}
              editLevel={sheet.editLevel}
              removeLevel={sheet.removeLevel}
              fields={sheet.fields}
              onChange={this.changeSheetLevel}
              getContainer={getContainer}
              isForPortal={this.props.isForPortal}
            >
              <span className="ThemeColor3 ThemeHoverColor2 Hand">{_l('设置')}</span>
            </TooltipSetting>
          ) : (
            <span className="Gray_9">-</span>
          )}
        </div>
      </div>
    );
  }
}
