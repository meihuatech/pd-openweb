import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import emptyCover from 'src/pages/worksheet/assets/emptyCover.png';
import { getAdvanceSetting, getClassNameByExt, browserIsMobile } from 'src/util';
import { openControlAttachmentInNewTab } from 'worksheet/controllers/record';
import { filter, includes, head, get } from 'lodash';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getMultiRelateViewConfig } from '../util';
import { isIframeControl } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import BarCode from 'src/components/newCustomFields/widgets/BarCode';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';

const CoverImageWrap = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 96px;
  flex-basis: 96px;
  flex-shrink: 0;
  border-left: 1px solid rgba(0, 0, 0, 0.08);

  .coverWrap {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-clip: content-box;

    &.emptyCoverWrap {
      img {
        width: 52px;
        height: 40px;
      }
      &:hover {
        &::after {
          content: '';
          display: none;
        }
      }
    }

    .fileIcon {
      width: 45px;
      height: 52px;
    }
    &:hover {
      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(221, 221, 221, 0.24);
      }
    }
  }

  &.dir-top {
    width: 100%;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    .coverWrap {
      height: 170px;
      &.coverWrapQr {
        & > img {
          height: 100% !important;
          width: initial !important;
        }
      }
    }
    .mobileOverWrap {
      height: 100px;
    }
  }
  &.display-circle,
  &.display-square {
    padding: 14px 0;

    .coverWrap {
      width: 80px;
      height: 80px;
      box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.04);
    }
  }
  &.display-circle {
    .coverWrap {
      border-radius: 50%;
      &:hover {
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(221, 221, 221, 0.24);
        }
      }
    }
  }
  &.dir-left {
    border: none;
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    &.display-circle,
    &.display-square {
      border: none;
      padding-left: 14px;
    }
  }
  &.dir-right {
    &.display-circle,
    &.display-square {
      border: none;
      padding-right: 14px;
    }
    .fileIcon {
      /* margin-left: 14px; */
    }
  }
  .coverCount {
    position: absolute;
    bottom: 6px;
    right: 6px;
    padding: 0 10px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    border-radius: 12px;
    background-color: rgba(33, 33, 33, 0.24);
  }
`;

const COVER_TYPE_TO_BACKGROUND_SIZE = {
  0: 'cover',
  1: 'contain',
  2: 'circle',
  3: 'square',
};

const COVER_IMAGE_POSITION = {
  2: 'top',
  1: 'left',
  0: 'right',
};

export default function CardCoverImage(props) {
  const { data, stateData = {}, sheetSwitchPermit = [], currentView, viewId = '' } = props;
  const { allAttachments = [], coverData = {}, formData, rowId } = data;
  const { type, controlId } = coverData;
  const { previewUrl, ext } = head(allAttachments) || {};
  const { viewType, appId, worksheetId } = currentView;
  const isGalleryView = String(viewType) === '3';
  const coverImage = data.coverImage || previewUrl;
  const coverSetting = getMultiRelateViewConfig(currentView, stateData);
  const { coverCid, coverType } = coverSetting;
  const { coverposition = '0', opencover } = getAdvanceSetting(coverSetting); //opencover 空(默认没key)或者1：允许 2：不允许
  const position = COVER_IMAGE_POSITION[coverposition];

  if (!coverCid) return null;
  if (!isGalleryView && position !== 'left' && !coverImage && type !== 47) return null;
  // 嵌入字段iframe展示
  const isIframeCover = isIframeControl(coverData);
  const previewAttachment = e => {
    // 不允许预览
    if (opencover === '2') {
      return;
    }
    e.stopPropagation();

    const recordAttachmentSwitch = !viewId
      ? true
      : isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewId);
    let hideFunctions = ['editFileName'];
    if (!recordAttachmentSwitch) {
      /* 是否不可下载 且 不可保存到知识和分享 */
      hideFunctions.push('download', 'share', 'saveToKnowlege');
    }
    previewAttachments(
      {
        index: 0,
        attachments: allAttachments.map(attachment =>
          Object.assign({}, attachment, {
            previewAttachmentType: attachment.refId ? 'KC_ID' : 'COMMON_ID',
          }),
        ),
        showThumbnail: true,
        hideFunctions: hideFunctions,
      },
      {
        openControlAttachmentInNewTab: recordAttachmentSwitch
          ? fileId => {
              openControlAttachmentInNewTab({
                controlId,
                fileId,
                appId,
                recordId: rowId,
                viewId,
                worksheetId,
              });
            }
          : undefined,
      },
    );
  };

  const getStyle = () => {
    if (includes([0, 1], coverType)) {
      return {
        backgroundImage: `url(${coverImage})`,
        backgroundSize: COVER_TYPE_TO_BACKGROUND_SIZE[coverType],
      };
    }
    return {
      backgroundImage: `url(${coverImage})`,
    };
  };

  const getCover = () => {
    const isMobile = browserIsMobile();
    if (!coverImage) {
      return (
        <div className={cx('coverWrap', 'emptyCoverWrap')}>
          <img src={emptyCover} />
        </div>
      );
    }
    if (coverImage) {
      return (
        <div className={cx('coverWrap', '')} onClick={previewAttachment} style={getStyle()}>
          {allAttachments.length > 1 && <div className="coverCount">{allAttachments.length}</div>}
        </div>
      );
    }
    return (
      <div className={cx('coverWrap', '', { mobileOverWrap: isMobile })} onClick={previewAttachment}>
        <div className={cx('fileIcon', getClassNameByExt(ext))} />
        {allAttachments.length > 1 && <div className="coverCount">{allAttachments.length}</div>}
      </div>
    );
  };

  const getIframe = () => {
    const isMobile = browserIsMobile();
    const isLegalLink = /^https?:\/\/.+$/.test(coverData.value);
    return (
      <div className="coverWrap">
        {isLegalLink ? (
          <iframe className="overflowHidden Border0" width="100%" height="100%" src={coverData.value} />
        ) : (
          <div className={cx('coverWrap', 'emptyCoverWrap', { mobileOverWrap: isMobile })}>
            <img src={emptyCover} />
          </div>
        )}
      </div>
    );
  };

  const getBarCode = () => {
    return (
      <BarCode
        {...coverData}
        className={cx('coverWrap', { coverWrapQr: coverData.enumDefault !== 1 })}
        formData={formData}
        appId={appId}
        worksheetId={worksheetId}
        recordId={rowId}
        viewIdForPermit={viewId}
        isView={true}
      />
    );
  };

  const renderContent = () => {
    const isBarCode = type === 47;
    if (isIframeCover) {
      return getIframe();
    } else if (isBarCode) {
      return getBarCode();
    } else {
      return getCover();
    }
  };

  return (
    <CoverImageWrap className={cx(`dir-${position} display-${COVER_TYPE_TO_BACKGROUND_SIZE[coverType]}`)}>
      {renderContent()}
    </CoverImageWrap>
  );
}
