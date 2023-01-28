import React, { useState, useEffect, useRef } from 'react';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';
import styled from 'styled-components';
const MenuWrap = styled(Menu)`
  width: auto !important;
`;
const MenuItemWrap = styled(MenuItem)``;
const RedMenuItemWrap = styled(MenuItemWrap)`
  .Item-content {
    color: #f44336 !important;
    .Icon {
      color: #f44336 !important;
    }
  }
  &:not(.disabled):hover {
    .Icon {
      color: #fff !important;
    }
  }
`;
export default function DropOption(props) {
  const { popupAlign, key } = props;
  const [optionShow, setOptionShow] = useState(false);
  return (
    <Trigger
      popupVisible={optionShow}
      action={['click']}
      onPopupVisibleChange={optionShow => {
        setOptionShow(optionShow);
      }}
      key={key}
      popup={
        <MenuWrap className="Relative">
          {props.showHeader && props.showHeader()}
          {props.dataList.map(o => {
            if (o.type === 'err') {
              return (
                <RedMenuItemWrap
                  onClick={e => {
                    e.stopPropagation();
                    props.onAction(o);
                    setOptionShow(false);
                  }}
                >
                  {o.text}
                </RedMenuItemWrap>
              );
            }
            return (
              <React.Fragment>
                {o.showLine && <div style={{ width: '100%', margin: '6px 0', borderTop: '1px solid #EAEAEA' }} />}
                <MenuItemWrap
                  onClick={e => {
                    e.stopPropagation();
                    props.onAction(o);
                    setOptionShow(false);
                  }}
                >
                  {o.text}
                </MenuItemWrap>
              </React.Fragment>
            );
          })}
        </MenuWrap>
      }
      getPopupContainer={() => document.body}
      popupClassName="optionTrigger"
      popupAlign={{
        points: ['tl', 'bl'],
        overflow: {
          adjustX: true,
          adjustY: true,
        },
      }}
    >
      <Icon
        className="TxtMiddle Hand moreop Font20"
        type={props.iconType || 'moreop'}
        onClick={e => {
          e.stopPropagation();
        }}
      />
    </Trigger>
  );
}
