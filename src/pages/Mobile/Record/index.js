import React, { Fragment, Component, forwardRef, useMemo, useEffect } from 'react';
import AppPermissions from '../components/AppPermissions';
import RecordInfo from './RecordInfo';
import styled from 'styled-components';
import cx from 'classnames';
import { Modal } from 'antd-mobile';
import TouchHandler from 'mobile/components/TouchHandler';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';

const ModalWrap = styled(Modal)`
  height: 95%;
  overflow: hidden;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
  .am-modal-body {
    text-align: left;
  }
  &.full {
    height: 100%;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
  }
`;

export default AppPermissions(RecordInfo);

export const RecordInfoModal = forwardRef((props, ref) => {
  const {
    rowId,
    appId,
    worksheetId,
    viewId,
    sheetSwitchPermit,
    getDataType,
    from,
    getDraftData = () => {},
    notModal = false,
    editable,
    hideOtherOperate,
    updateSuccess,
  } = props;
  const { className, visible, onClose } = props;
  const store = useMemo(configureStore, []);

  if (!visible) return null;

  const Content = (
    <Provider store={store}>
      <RecordInfo
        isModal={true}
        ids={{ appId, worksheetId, viewId, rowId }}
        match={{ params: {} }}
        sheetSwitchPermit={sheetSwitchPermit}
        onClose={onClose}
        getDataType={getDataType}
        getDraftData={getDraftData}
        from={from}
        editable={editable}
        hideOtherOperate={hideOtherOperate}
        updateSuccess={updateSuccess}
      />
    </Provider>
  );

  if (notModal) {
    return Content;
  }

  return (
    <ModalWrap
      popup
      transitionName="noTransition"
      className={cx('RecordInfoModal', className)}
      onClose={onClose}
      visible={visible}
    >
      {rowId && (
        <TouchHandler onClose={onClose} touchClassName=".RecordInfoModal">
          {Content}
        </TouchHandler>
      )}
    </ModalWrap>
  );
});
