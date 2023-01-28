import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import _ from 'lodash';
import '../WorksheetRecordLogValue.less';
function TriggerSelect(props) {
  const { text, childNode, onSelect } = props;
  const [visible, setVisible] = useState(false);
  return (
    <Trigger
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        setVisible(visible);
      }}
      action={['click']}
      popupAlign={{ points: ['tl', 'bl'] }}
      popup={
        <span
          onClick={() => {
            onSelect();
            setVisible(false);
          }}
          className="triggerSelectPopup"
        >
          {text}
        </span>
      }
    >
      {childNode}
    </Trigger>
  );
}
export default TriggerSelect;
