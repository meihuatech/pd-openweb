import React, { memo, useRef, useState } from 'react';
import styled from 'styled-components';
import CellControl from 'worksheet/components/CellControls';
import renderCellText from 'worksheet/components/CellControls/renderText';
import Switch from 'worksheet/components/CellControls/Switch';
import RecordOperate from 'worksheet/components/RecordOperate';
import { Checkbox } from 'ming-ui';
import update from 'immutability-helper';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'src';
import { FlexCenter, Text } from 'worksheet/styled';
import { checkCellIsEmpty } from 'src/pages/worksheet/util';
import { get, includes, findIndex, isEmpty, noop } from 'lodash';
import { getAdvanceSetting } from 'src/util';
import CardCoverImage from './CardCoverImage';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getCardDisplayPara, getMultiRelateViewConfig, isListRelate, isTextTitle } from '../util';
import { browserIsMobile } from 'src/util';
import { controlState } from 'src/components/newCustomFields/tools/utils';

const RecordItemWrap = styled.div`
  display: flex;
  flex-direction: ${props => props.coverDirection};
  justify-content: space-between;
  cursor: ${props => (props.canDrag ? 'grab' : 'pointer')};
  width: 100%;
  position: relative;
  min-height: 42px;
  .fieldContentWrap {
    flex: 1;
    padding: 10px 0;
    overflow: hidden;
  }
  .titleText {
    padding: 0 14px;
    font-size: 14px;
    font-weight: bold;
    word-break: break-all;
    white-space: normal;
    &.isGalleryView {
      white-space: nowrap;
    }
    &.maskHoverTheme {
      cursor: pointer;
      &:hover {
        color: #1d5786;
        .i.icon-eye_off {
          color: #9e9e9e !important;
        }
      }
    }
  }
  .abstractWrap {
    margin: 10px 14px 3px;
    max-height: 59px;
    overflow: hidden;
    color: #757575;
    text-overflow: ellipsis;
    white-space: break-spaces;
    word-break: break-all;
    display: -webkit-box;
    /*! autoprefixer: off */
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical;
    /* autoprefixer: on */
    &.galleryViewAbstract {
      height: 72px;
    }
  }

  .fieldItem {
    max-width: 96%;
    margin-top: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .editTitleTextInput {
      border: none;
      width: 100%;
      padding: 0;
    }
    .worksheetCellPureString {
      max-width: 100%;
      padding-left: 4px;
    }
  }
  .emptyHolder {
    height: 6px;
    background-color: #f0f0f0;
    border-radius: 12px;
    width: 20px;
  }
  .moreOperate {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    line-height: 24px;
    border-radius: 3px;
    background-color: rgba(255, 255, 255, 0.9);
    text-align: center;
    font-size: 18px;
    &:hover {
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
      background-color: #fff;
      i {
        color: #2196f3;
      }
    }
  }
  .recordOperateWrap {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    right: 0;
    visibility: hidden;
  }
  .hoverShow {
    visibility: hidden;
  }
  &:hover {
    .hoverShow {
      visibility: visible;
    }
  }
`;

const RecordFieldsWrap = styled(FlexCenter)`
  box-sizing: border-box;
  max-width: 100%;
  flex-grow: 1;
  flex-direction: column;
  align-items: start;
  padding: 0 14px;
  border-radius: 4px;
  /* &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.16);
  } */
  .contentWrap {
    flex: 1;
    overflow: auto;
    &::-webkit-scrollbar {
      height: 0;
    }
  }
  .linelimitcomp {
    white-space: break-spaces;
  }

  textarea {
    resize: none;
  }
`;

const ControlName = styled(Text)`
  flex-shrink: 0;
  margin: 0 8px 0 0;
  color: #9e9e9e;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const BaseCard = props => {
  const {
    data = {},
    stateData = {},
    className,
    canDrag,
    currentView,
    viewParaOfRecord,
    allowCopy,
    isCharge,
    sheetSwitchPermit = [],
    editTitle,
    onUpdate = noop,
    onDelete = noop,
    onCopySuccess = noop,
    showNull = false,
  } = props;
  let { rowId, coverImage, allowEdit, allowDelete, abstractValue } = data;
  const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
  const fields = data.fields
    ? !isShowWorkflowSys && _.isArray(data.fields)
      ? data.fields.filter(
          it =>
            !_.includes(
              ['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfdtime', 'wfcaid', 'wfctime', 'wfcotime'],
              it.controlId,
            ),
        )
      : data.fields
    : [];
  const { path = [] } = stateData;
  const titleIndex = findIndex(fields, item => item.attribute === 1);
  const titleField = fields[titleIndex] || {};
  const para = getCardDisplayPara({ currentView, data: stateData });
  const [forceShowFullValue, setForceShowFullValue] = useState(_.get(titleField, 'advancedSetting.datamask') !== '1');
  let viewId, worksheetId;
  const { appId, projectId, viewType, viewControls, childType, showControlName } = para;
  if (viewParaOfRecord) {
    viewId = viewParaOfRecord.viewId;
    worksheetId = viewParaOfRecord.worksheetId;
  } else {
    viewId = para.viewId;
    worksheetId = para.worksheetId;
  }
  const $ref = useRef(null);

  const multiRelateViewConfig = getMultiRelateViewConfig(currentView, stateData);
  const { coverposition = '0', abstract } = getAdvanceSetting(multiRelateViewConfig);

  if (isEmpty(data)) return null;

  const isGalleryView = String(viewType) === '3';
  const isVerticalHierarchy = String(viewType) === '2' && ['1', '2'].includes(_.get(para, 'advancedSetting.hierarchyViewType'));

  abstractValue = abstract ? abstractValue : '';

  const otherFields = update(fields, { $splice: [[titleIndex, 1]] });
  const titleMasked =
    ((isCharge || _.get(titleField, 'advancedSetting.isdecrypt') === '1') &&
      _.get(titleField, 'advancedSetting.datamask') === '1' &&
      !forceShowFullValue &&
      titleField.type === 2 &&
      titleField.enumDefault === 2) ||
    _.includes([6, 8, 3, 5, 7], titleField.type);

  const isShowControlName = () => {
    if (String(viewType) === '2' && String(childType) === '2') {
      if (path.length < 2) return showControlName;
      const viewConfig = viewControls[path.length - 1];
      return get(viewConfig, 'showControlName');
    }
    return showControlName;
  };

  // 是否有更多操作
  const isHaveRecordOperate = () => {
    const { customButtons = [] } = currentView;
    const recordPrintSwitch = isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId); //记录打印
    const recordShareSwitch = isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId); //记录分享
    const recordCopySwitch = isOpenPermit(permitList.recordCopySwitch, sheetSwitchPermit, viewId); //记录复制
    if (allowDelete) return true;
    if (recordPrintSwitch || recordShareSwitch || recordCopySwitch) return true;
    if (customButtons.length > 0) return true;
    return false;
  };

  const isCanQuickEdit = () => {
    return isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, viewId) && isTextTitle(fields) && allowEdit;
  };

  const renderTitleControl = () => {
    const titleValue = renderCellText(titleField, { noMask: forceShowFullValue });
    const content = titleValue || _l('未命名');
    if (props.renderTitle) return props.renderTitle({ content, titleField });
    return (
      <div
        className={cx('titleText', {
          haveOtherField: !isEmpty(otherFields),
          overflow_ellipsis: titleField.type === 2,
          isGalleryView,
          maskHoverTheme: titleMasked,
        })}
        title={content}
        onClick={e => {
          if (!titleMasked) return;
          e.stopPropagation();
          setForceShowFullValue(true);
        }}
      >
        {content}
        {titleMasked && titleValue && (
          <i
            className="icon icon-eye_off Hand maskData Font16 Gray_bd mLeft4 mTop4 hoverShow"
            style={{ verticalAlign: 'middle' }}
          />
        )}
      </div>
    );
  };
  const renderContent = ({ item, content }) => {
    let currentContent = content;

    if (item.type === 36) {
      const canEdit =
        isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, viewId) && allowEdit && controlState(item).editable;
      currentContent = (
        <div onClick={e => e.stopPropagation()}>
          <Switch cell={item} from={4} editable={canEdit} updateCell={({ value }) => props.onChange(item, value)} />
        </div>
      );
    }

    const displayContent = !checkCellIsEmpty(item.value) ? (
      <div className="contentWrap">{currentContent}</div>
    ) : (
      <div className="emptyHolder"> </div>
    );

    if (isShowControlName() && item.controlName) {
      return (
        <FlexCenter>
          <ControlName>{item.controlName}</ControlName>
          {displayContent}
        </FlexCenter>
      );
    }
    return displayContent;
  };

  const renderAbstract = () => {
    return abstract ? (
      <div className={cx('abstractWrap', { galleryViewAbstract: isGalleryView || isVerticalHierarchy })}>
        {abstractValue || <div className="emptyHolder"></div>}
      </div>
    ) : null;
  };

  const getPopAlign = () => {
    if ($ref.current) {
      const { right } = $ref.current.getBoundingClientRect();
      /**
       * 如果右侧放不下就放卡片的左侧
       * 208 = 目录的宽度(200) + 间隔(8)
       */
      if (window.innerWidth - 208 < right) {
        return {
          points: ['tr', 'tr'],
          offset: [8, 30],
        };
      }
    }
    return {
      points: ['tl', 'tr'],
      offset: [16, -8],
    };
  };
  const isMobile = browserIsMobile();
  const hideOperate = isMobile || _.get(window, 'shareState.isPublicView');
  return (
    <RecordItemWrap
      ref={$ref}
      className={className}
      coverDirection={includes(['0', '1'], coverposition) ? 'row' : 'column'}
      canDrag={canDrag}
    >
      {/* // 封面图片左、上放置 */}
      {includes(['1', '2'], coverposition) && <CardCoverImage {...props} viewId={viewId} />}
      <div className="fieldContentWrap">
        {renderTitleControl({ forceShowFullValue })}
        {renderAbstract()}
        {!_.isEmpty(otherFields) && (
          <RecordFieldsWrap hasCover={!!coverImage}>
            {otherFields
              // .filter(o => controlState(o).visible)//排除无查看权限的字段
              .map(item => {
                if (checkCellIsEmpty(item.value) && !isGalleryView && !showNull) return null;
                const content = (
                  <CellControl
                    from={4}
                    cell={_.find(data.formData, c => c.controlId === item.controlId) || item}
                    rowFormData={() => data.formData || []}
                    sheetSwitchPermit={sheetSwitchPermit}
                    worksheetId={worksheetId}
                    viewId={viewId}
                    row={{ rowid: rowId }}
                    isCharge={isCharge}
                  />
                );
                // 画廊视图或有内容控件则渲染
                return (
                  <div key={item.controlId} className={'fieldItem'} style={item.type === 6 ? { width: '100%' } : {}}>
                    {renderContent({ content, item })}
                  </div>
                );
              })}
          </RecordFieldsWrap>
        )}
      </div>
      {/* // 封面图片右放置 */}
      {includes(['0'], coverposition) && <CardCoverImage {...props} viewId={viewId} />}
      {!hideOperate && (
        <div className="recordOperateWrap" onClick={e => e.stopPropagation()}>
          {isHaveRecordOperate() ? (
            <RecordOperate
              shows={['share', 'print', 'copy', 'openinnew']}
              popupAlign={getPopAlign()}
              allowDelete={allowDelete}
              allowCopy={allowCopy}
              projectId={projectId}
              formdata={fields}
              appId={worksheetId === currentView.worksheetId ? appId : undefined}
              worksheetId={worksheetId}
              sheetSwitchPermit={sheetSwitchPermit}
              defaultCustomButtons={currentView.customButtons}
              viewId={viewId}
              recordId={rowId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onCopySuccess={onCopySuccess}
            >
              <div
                className="moreOperate"
                onClick={() => {
                  if (isCanQuickEdit()) {
                    editTitle();
                  }
                }}
              >
                <Icon type="link" icon="task-point-more Font18" />
              </div>
            </RecordOperate>
          ) : (
            isCanQuickEdit() && (
              <div className="moreOperate">
                <Icon type="link" className="icon-edit" onClick={editTitle} />
              </div>
            )
          )}
        </div>
      )}
    </RecordItemWrap>
  );
};

export default BaseCard;
