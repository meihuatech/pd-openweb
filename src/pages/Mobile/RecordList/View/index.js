import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import * as worksheetActions from 'src/pages/worksheet/redux/actions';
import { bindActionCreators } from 'redux';
import { Flex } from 'antd-mobile';
import SheetView from './SheetView';
import HierarchyView from './HierarchyView';
import BoardView from './BoardView';
import GalleryView from './GalleryView';
import CalendarView from './CalendarView';
import GunterView from './GunterView';
import GroupFilter from '../GroupFilter';
import State from '../State';
import { VIEW_TYPE_ICON, VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import _ from 'lodash';

const { board, sheet, calendar, gallery, structure, gunter } = VIEW_DISPLAY_TYPE;

const TYPE_TO_COMP = {
  [sheet]: SheetView,
  [structure]: HierarchyView,
  [board]: BoardView,
  [gallery]: GalleryView,
  [calendar]: CalendarView,
  [gunter]: GunterView,
};

class View extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if (this.props.mobileNavGroupFilters.length) {
      this.props.fetchSheetRows({ navGroupFilters: this.props.mobileNavGroupFilters });
    } else {
      this.props.fetchSheetRows();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.mobileNavGroupFilters, nextProps.mobileNavGroupFilters)) {
      this.props.fetchSheetRows({ navGroupFilters: nextProps.mobileNavGroupFilters });
    }
  }
  renderError() {
    const { view } = this.props;
    return (
      <Flex className="withoutRows flex" direction="column" justify="center" align="center">
        <div className="text" style={{ width: 300, textAlign: 'center' }}>
          {_l(
            '抱歉，%0视图暂不支持，您可以通过PC端浏览器，或者移动客户端查看',
            _.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[view.viewType] }).text,
          )}
        </div>
      </Flex>
    );
  }
  render() {
    const { view, viewResultCode, base, isCharge } = this.props;
    if (viewResultCode !== 1) {
      return <State resultCode={viewResultCode} type="view" />;
    }

    if (_.isEmpty(view)) {
      return null;
    }

    const Component = TYPE_TO_COMP[String(view.viewType)];
    const viewProps = {
      ...base,
      isCharge,
      view,
    };
    let hasGroupFilter =
      view.viewId === base.viewId &&
      !_.isEmpty(view.navGroup) &&
      view.navGroup.length > 0 &&
      _.includes([sheet, gallery], String(view.viewType)); // 是否存在分组列表
    if (hasGroupFilter) {
      return (
        <GroupFilter
          {...this.props}
          changeMobielSheetLoading={this.props.changeMobielSheetLoading}
          groupId={this.props.base.groupId}
        />
      );
    }
    return (
      <div className="overflowHidden flex mobileView flexColumn Relative">
        <Component {...viewProps} />
      </div>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, [
      'base',
      'isCharge',
      'worksheetInfo',
      'viewResultCode',
      'mobileNavGroupFilters',
      'batchOptVisible',
      'appColor',
    ]),
    controls: state.sheet.controls,
    views: state.sheet.views,
    ...state.sheet,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick({ ...actions, ...worksheetActions }, [
          'fetchSheetRows',
          'getNavGroupCount',
          'changeMobielSheetLoading',
          'updateMobileViewPermission',
          'addNewRecord',
          'openNewRecord',
          'changeBatchOptVisible',
          'changeMobileGroupFilters',
          'unshiftSheetRow',
        ]),
      },
      dispatch,
    ),
)(View);
