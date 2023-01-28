import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GalleryView from 'src/pages/worksheet/views/GalleryView';
import * as actions from 'mobile/RecordList/redux/actions';
import * as galleryActions from 'src/pages/worksheet/redux/actions/galleryview.js';
import QuickFilterSearch from 'mobile/RecordList/QuickFilter/QuickFilterSearch';
import { getAdvanceSetting } from 'src/util';
import { TextTypes } from 'src/pages/worksheet/common/Sheet/QuickFilter/Inputs';

class MobileGalleryView extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    let { view } = this.props;
    let hasGroupFilter = !_.isEmpty(view.navGroup) && view.navGroup.length > 0; // 是否存在分组列表
    if (!hasGroupFilter) {
      this.getFetch(this.props);
    }
  }
  getFetch = nextProps => {
    const { base, views } = nextProps;
    const { viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { clicksearch } = getAdvanceSetting(currentView);
    if (clicksearch === '1') {
      this.props.changeIndex(0);
    } else {
      this.props.fetch(1);
    }
  };

  render() {
    const { view, worksheetInfo, quickFilter, updateFilters, appDetail = {} } = this.props;
    const { detail } = appDetail;
    let hasGroupFilter = !_.isEmpty(view.navGroup) && view.navGroup.length > 0; // 是否存在分组列表
    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);
    const filters = view.fastFilters
      .map(filter => ({
        ...filter,
        control: _.find(sheetControls, c => c.controlId === filter.controlId),
      }))
      .filter(c => c.control);
    const excludeTextFilter = filters.filter(item => !TextTypes.includes(item.dataType));
    const textFilters = filters.filter(item => TextTypes.includes(item.dataType));
    const isFilter = quickFilter.filter(item => !TextTypes.includes(item.dataType)).length;

    return (
      <Fragment>
        <QuickFilterSearch
          textFilters={textFilters}
          excludeTextFilter={excludeTextFilter}
          isFilter={isFilter}
          filters={this.props.filters}
          detail={detail}
          view={view}
          worksheetInfo={worksheetInfo}
          sheetControls={sheetControls}
          updateFilters={updateFilters}
        />
        <GalleryView {...this.props} hasGroupFilter={hasGroupFilter} />
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.sheet, ['base', 'galleryview', 'views']),
    quickFilter: state.mobile.quickFilter,
    worksheetInfo: state.mobile.worksheetInfo,
    filters: state.mobile.filters,
    appDetail: state.mobile.appDetail,
  }),
  dispatch =>
    bindActionCreators(_.pick({ ...actions, ...galleryActions }, ['changeIndex', 'fetch', 'updateFilters']), dispatch),
)(MobileGalleryView);
