import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import { Modal } from 'antd-mobile';
import { LoadDiv, Icon, Radio } from 'ming-ui';
import './index.less';
import _ from 'lodash';

export default class MobileSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentChecked: props.value,
    };
  }
  componentDidMount() {
    if (this.props.enumDefault === 2) {
      this.searchInput && this.searchInput.focus();
    }
  }

  searchRealTime = value => {
    const { advancedSetting = {} } = this.props;
    const { itemtitle = '', clicksearch } = advancedSetting;
    let optionData = (this.props.optionData || []).map((it, index) => ({ ...it, index }));

    if (clicksearch === '1') {
      this.props.realTimeSearch(value);
    } else {
      let searchResult = optionData.filter(item => `${item[itemtitle]}`.indexOf(value) > -1);
      this.setState({ mobileSearchResult: searchResult });
    }
  };

  render() {
    const { enumDefault, controlName, value, loading, advancedSetting = {}, disabled, hint } = this.props;
    const { currentChecked = '', visible, mobileSearchResult = [] } = this.state;
    const { itemtitle = '', clicksearch, searchfirst, min = '0' } = advancedSetting;
    let optionData = (this.props.optionData || []).map((it, index) => ({ ...it, index }));
    let mobileOptionData =
      this.searchInput && this.searchInput.value && enumDefault === 1 ? mobileSearchResult : optionData;
    if (disabled) {
      return <div className="customFormControlBox customFormButton flexRow controlDisabled">{value}</div>;
    }

    return (
      <Fragment>
        <Select
          className="w100 customAntSelect mobileCustomApiSelect"
          dropdownRender={null}
          onClick={() => {
            this.setState({ visible: true });
            if ((enumDefault === 2 && searchfirst === '1') || enumDefault === 1) {
              this.props.handleSearch('');
            }
          }}
          value={value}
          placeholder={hint || _l('请选择')}
          suffixIcon={<Icon icon="arrow-right-border Font14" />}
          onChange={value => {
            // keywords判断是为了直接点击删除
            if (value || (this.searchInput && !this.searchInput.value.length)) {
              this.props.onChange(value);
            }
          }}
          notFoundContent={null}
        />

        <Modal
          popup
          visible={visible}
          animationType="slide-up"
          className="searchListModals"
          title={
            <div className="flexRow">
              <div
                className="ThemeColor3 TxtLeft pRight16 Font15"
                onClick={() => {
                  this.setState({ visible: false, mobileOptionData: [] });
                  if (this.searchInput) {
                    this.searchInput.value = '';
                  }
                }}
              >
                {_l('取消')}
              </div>
              <div className="flex ellipsis">{controlName}</div>
              <div
                className="ThemeColor3 pLeft16 TxtRight Font15"
                onClick={() => {
                  this.setState({ visible: false, currentChecked: '', mobileOptionData: [] });
                  if (this.searchInput) {
                    this.searchInput.value = '';
                  }
                  this.props.onChange();
                }}
              >
                {_l('移除')}
              </div>
            </div>
          }
        >
          {
            <Fragment>
              {enumDefault === 2 && clicksearch === '0' ? (
                <div className="searchBox GrayBGF8 selectSearchBox">
                  <input
                    ref={node => (this.searchInput = node)}
                    type="text"
                    className="cursorText flex Gray"
                    placeholder={hint || _l('请选择')}
                  />
                  <div
                    className="searchBtn"
                    onClick={() => {
                      if (this.searchInput.value.length < parseInt(min)) return;
                      this.props.handleSearch(this.searchInput.value);
                    }}
                  >
                    <Icon icon="search" className="Font18 Gray_75" />
                  </div>
                </div>
              ) : (
                <div className="searchBox GrayBGF8">
                  <Icon icon="search" className="searchIcon Font20 Gray_75" />
                  <input
                    type="text"
                    className="cursorText Gray"
                    placeholder={hint || _l('请选择')}
                    ref={node => (this.searchInput = node)}
                    onChange={e => {
                      const value = this.searchInput.value.trim();
                      if (!value) {
                        this.props.clearData();
                        return;
                      }
                      if (this.isOnComposition) return;
                      this.searchRealTime(value);
                    }}
                    onCompositionStart={() => (this.isOnComposition = true)}
                    onCompositionEnd={event => {
                      const value = this.searchInput.value.trim();
                      if (event.type === 'compositionend') {
                        this.isOnComposition = false;
                      }
                      this.searchRealTime(value);
                    }}
                  />
                </div>
              )}
              {loading ? (
                <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
                  <LoadDiv />
                </div>
              ) : _.get(this.searchInput || {}, 'value') && enumDefault === 1 && _.isEmpty(mobileSearchResult) ? (
                <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
                  <Icon icon="h5_search" className="Font50" />
                  <div className="Gray_bd Font17 Bold mTop40">{_l('没有搜索结果')}</div>
                </div>
              ) : (
                <div className="flex searchResult">
                  {mobileOptionData.map((item, i) => {
                    const labelNode = this.props.renderList(item);
                    return (
                      <div
                        key={i}
                        className="flexRow searchItem alignItemsCenter"
                        onClick={() => {
                          this.setState({ visible: false, currentChecked: item[itemtitle] });
                          this.props.onChange(item[itemtitle]);
                          this.props.handleSelect({
                            key: String(item.index),
                            value: item[itemtitle],
                            label: item[itemtitle],
                          });
                        }}
                      >
                        <Radio checked={item[itemtitle] === currentChecked} />
                        <div className="flex TxtLeft overflowHidden itemContent"> {labelNode}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Fragment>
          }
        </Modal>
      </Fragment>
    );
  }
}
