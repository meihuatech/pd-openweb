import React from 'react';
import PropTypes from 'prop-types';

export default function Abnormal(props) {
  const { resultCode, entityName, empty } = props;
  return (
    <div className="abnormalCon flexColumn">
      <span className="statusIcon Icon icon icon-task-folder-message" />
      <p className="mTop5">
        {(() => {
          if (resultCode === 7) {
            return _l('无权限查看%0', entityName || _l('记录'));
          } else if (resultCode === 1 && empty) {
            return _l('当前子表中的字段为空');
          } else {
            return _l('%0无法查看', entityName || _l('记录'));
          }
        })()}
      </p>
    </div>
  );
}

Abnormal.propTypes = {
  resultCode: PropTypes.number,
  entityName: PropTypes.string,
  empty: PropTypes.bool,
};
