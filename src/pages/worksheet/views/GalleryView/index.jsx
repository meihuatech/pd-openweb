import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv } from 'ming-ui';
import './index.less';
import cx from 'classnames';
import { RENDER_RECORD_NECESSARY_ATTR, getRecordAttachments } from '../util';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { RecordInfoModal } from 'mobile/Record';
import { getAdvanceSetting, browserIsMobile } from 'src/util';
import NoRecords from 'src/pages/worksheet/components/WorksheetTable/components/NoRecords';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ViewEmpty from '../components/ViewEmpty';
import { isEmpty } from 'lodash';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import GalleryItem from './GalleryItem';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import * as actions from 'worksheet/redux/actions/galleryview';
import addRecord from 'worksheet/common/newRecord/addRecord';
import autoSize from 'ming-ui/decorators/autoSize';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getEmbedValue } from 'src/components/newCustomFields/tools/utils.js';
import { controlState } from 'src/components/newCustomFields/tools/utils';

const isMobile = browserIsMobile();

@autoSize
@connect(
  state => ({ ...state.sheet, chatVisible: state.chat.visible, sheetListVisible: state.sheetList.isUnfold }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class RecordGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordInfoVisible: false,
      recordId: '',
      clicksearch: '',
    };
  }

  componentDidMount() {
    let hasGroupFilter = this.props.hasGroupFilter ? this.props.hasGroupFilter : false; // mobile画廊视图是否有分组列表，若有在mobile进行数据更新
    !hasGroupFilter && this.getFetch(this.props);
    window.addEventListener('resize', this.resizeBind);
  }

  componentWillReceiveProps(nextProps) {
    const {
      base,
      chatVisible,
      sheetListVisible, // 左侧打开或关闭
      galleryview,
      views,
      groupFilterWidth,
      navGroupFilters,
      quickFilter,
    } = nextProps;
    const { viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const preView = this.props.views.find(o => o.viewId === this.props.base.viewId) || {};
    const { clicksearch } = getAdvanceSetting(currentView);
    let hasGroupFilter = this.props.hasGroupFilter ? this.props.hasGroupFilter : false;
    if (clicksearch === '1' && quickFilter.length <= 0) {
      return;
    }
    const isNoAs =
      !_.isEqual(currentView, preView) ||
      clicksearch !== this.state.clicksearch ||
      !_.isEqual(navGroupFilters, this.props.navGroupFilters);
    if (
      sheetListVisible !== this.props.sheetListVisible ||
      isNoAs ||
      viewId !== this.props.base.viewId ||
      chatVisible !== this.props.chatVisible ||
      groupFilterWidth !== this.props.groupFilterWidth
    ) {
      !hasGroupFilter && this.getFetch(nextProps);
      this.resizeBind(nextProps);
    }
    this.setState({ clicksearch });
  }

  getFetch = nextProps => {
    const { base, views } = nextProps;
    const { viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { clicksearch } = getAdvanceSetting(currentView);
    if (clicksearch === '1') {
      //执行查询后显示数据
      this.setState({
        clicksearch,
      });
      this.props.changeIndex(0);
    } else {
      this.props.fetch(1);
    }
  };

  scrollLoad = (e, o) => {
    const { maxCount } = this.props;
    if (maxCount) {
      return;
    }
    const { galleryViewRecordCount, gallery, galleryLoading, galleryIndex } = this.props.galleryview;
    if (o.maximum - o.position <= 30 && gallery.length < galleryViewRecordCount && !galleryLoading) {
      const nextPageIndex = galleryIndex + 1;
      this.props.fetch(nextPageIndex);
    }
  };

  resizeBind = nextProps => {
    $(this.view)
      .find('.galleryItem')
      .css({
        width: this.getWith(nextProps),
      });
  };

  getWith = (props = this.props) => {
    let { base = {}, views = [], width } = props;
    const { viewId = '' } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const { coverposition = '2' } = getAdvanceSetting(view);
    const isTopCover = coverposition === '2'; // 封面上
    width = width - 8 * 2; //padding:8px;
    return Math.floor(width / Math.floor(width / (!isTopCover ? 336 : 246)));
  };

  formData = row => {
    const { base, controls, views, sheetSwitchPermit } = this.props;
    const { viewId } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const { displayControls = [] } = view;
    const parsedRow = row;
    const arr = [];

    const titleControl = _.find(controls, item => item.attribute === 1);
    if (titleControl) {
      // 标题字段
      arr.push({ ..._.pick(titleControl, RENDER_RECORD_NECESSARY_ATTR), value: parsedRow[titleControl.controlId] });
    }
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    let displayControlsCopy = !isShowWorkflowSys
      ? displayControls.filter(
          it =>
            !_.includes(
              ['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfdtime', 'wfcaid', 'wfctime', 'wfcotime'],
              it,
            ),
        )
      : displayControls;
    // 配置的显示字段
    displayControlsCopy.forEach(id => {
      const currentControl = _.find(controls, ({ controlId }) => controlId === id);
      if (currentControl) {
        const value = parsedRow[id];
        arr.push({ ..._.pick(currentControl, RENDER_RECORD_NECESSARY_ATTR), value });
      }
    });
    return arr;
  };

  noFilter = function () {
    const { searchType, filterControls, isUnRead, sortControls = [] } = this.props.filters;
    return (
      searchType === 1 &&
      !isUnRead &&
      !filterControls.length &&
      !sortControls.filter(item => item.controlId === 'ctime' || item.controlId === 'utime').length
    );
  };

  render() {
    const { base, views, sheetSwitchPermit, galleryview, filters, worksheetInfo, controls, quickFilter } = this.props;
    const { viewId, appId, worksheetId, groupId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { gallery = [], galleryViewLoading, galleryLoading, galleryIndex } = galleryview;
    const { coverCid } = currentView;
    let { coverposition = '2', abstract = '', clicksearch } = getAdvanceSetting(currentView);
    const isTopCover = coverposition === '2';
    const { recordInfoVisible, recordId } = this.state;
    if (galleryViewLoading) {
      return <LoadDiv size="big" className="mTop32" />;
    }
    if (clicksearch === '1' && (galleryIndex <= 0 || quickFilter.length <= 0)) {
      return (
        <div
          className="Gray_9e Font14 fastFilterNoClick"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {_l('执行查询后显示结果')}
        </div>
      );
    }
    if (gallery.length <= 0) {
      if (filters.keyWords || !isEmpty(filters.filterControls) || isMobile) {
        return <ViewEmpty filters={filters} />;
      }
      return (
        <NoRecords
          sheetIsFiltered={!this.noFilter()}
          allowAdd={isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && worksheetInfo.allowAdd}
          showNewRecord={() => {
            addRecord({
              worksheetId,
              // defaultFormData,
              defaultFormDataEditable: true,
              directAdd: true,
              onAdd: record => {
                this.props.updateRow(record);
              },
            });
          }}
        />
      );
    }
    return (
      <ScrollView className="galleryScrollWrap" updateEvent={_.throttle(this.scrollLoad, 400)}>
        <div
          className={cx('galleryViewContentWrap', { coverTop: isTopCover })}
          ref={el => {
            this.view = el;
          }}
        >
          {gallery.map((item, index) => {
            let formData = controls.map(o => {
              return { ...o, value: item[o.controlId] };
            });
            const { coverImage, allAttachments } = getRecordAttachments(item[coverCid]);
            let coverData = { ...(controls.find(it => it.controlId === coverCid) || {}), value: item[coverCid] };
            if (coverData.type === 45) {
              //嵌入字段 dataSource需要转换
              let dataSource = transferValue(coverData.value);
              let urlList = [];
              dataSource.map(o => {
                if (!!o.staticValue) {
                  urlList.push(o.staticValue);
                } else {
                  urlList.push(
                    getEmbedValue(
                      {
                        projectId: worksheetInfo.projectId,
                        appId,
                        groupId,
                        worksheetId,
                        viewId,
                        recordId,
                      },
                      o.cid,
                    ),
                  );
                }
              });
              coverData = { ...coverData, value: urlList.join('') };
            }
            let abstractData = controls.find(it => it.controlId === abstract) || {};
            let data = {
              coverData,
              coverImage,
              allAttachments,
              allowEdit: item.allowedit,
              allowDelete: item.allowdelete,
              rawRow: item,
              fields: this.formData(item),
              formData,
              rowId: item.rowid,
              abstractValue: abstract //&& controlState(abstractData).visible //排除无查看权限的
                ? renderCellText({
                    ...abstractData,
                    value: item[abstract],
                  })
                : '',
            };
            return (
              <div
                className={cx('galleryItem', { mobile: isMobile })}
                style={isMobile ? { width: '100%', padding: '5px 0px' } : { width: this.getWith() }}
                onClick={() => {
                  const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
                  if (isMingdao) {
                    window.location.href = `/mobile/record/${appId}/${worksheetId}/${viewId}/${item.rowid}`;
                    return;
                  }
                  this.setState({ recordId: item.rowid, recordInfoVisible: true });
                }}
              >
                <GalleryItem
                  {...this.props}
                  data={data}
                  onUpdateFn={(updated, item) => {
                    this.props.updateRow(item);
                  }}
                  onDeleteFn={id => {
                    this.props.deleteRow(id);
                  }}
                  onCopySuccess={data => {
                    this.props.updateRow(data);
                  }}
                />
              </div>
            );
          })}
          {galleryLoading && <LoadDiv size="big" className="mTop32" />}
          {/* 表单信息 */}
          {recordInfoVisible &&
            (isMobile ? (
              <RecordInfoModal
                className="full"
                visible
                appId={appId}
                worksheetId={worksheetId}
                viewId={viewId}
                rowId={recordId}
                onClose={() => {
                  this.setState({ recordInfoVisible: false });
                }}
              />
            ) : (
              <RecordInfoWrapper
                sheetSwitchPermit={sheetSwitchPermit} // 表单权限
                allowAdd={worksheetInfo.allowAdd}
                visible
                projectId={worksheetInfo.projectId}
                currentSheetRows={gallery}
                showPrevNext={true}
                appId={appId}
                viewId={viewId}
                from={1}
                hideRecordInfo={() => {
                  this.setState({ recordInfoVisible: false });
                }}
                view={currentView}
                recordId={recordId}
                worksheetId={worksheetId}
                rules={worksheetInfo.rules}
                updateSuccess={(ids, updated, data) => {
                  this.props.updateRow(data);
                }}
                onDeleteSuccess={data => {
                  // 删除行数据后重新加载页面
                  this.props.deleteRow();
                  this.setState({ recordInfoVisible: false });
                }}
                handleAddSheetRow={data => {
                  this.props.updateRow(data);
                  this.setState({ recordInfoVisible: false });
                }}
              />
            ))}
        </div>
      </ScrollView>
    );
  }
}
