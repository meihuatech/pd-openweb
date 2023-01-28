import React, { Fragment, useEffect } from 'react';
import { SettingItem } from '../../styled';
import { handleAdvancedSettingChange } from '../../util/setting';
import Components from '../components';

export default function Money(props) {
  const { data, onChange } = props;

  useEffect(() => {
    // 初始化用老数据unit覆盖suffix
    if (data.unit && !(data.advancedSetting || {}).suffix) {
      onChange(handleAdvancedSettingChange({ ...data, unit: '' }, { suffix: data.unit }));
    }
  }, [data.controlId]);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('单位')}</div>
        <Components.PreSuffix {...props} />
      </SettingItem>
      <Components.PointerConfig {...props} />
    </Fragment>
  );
}
