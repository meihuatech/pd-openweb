import React, { Fragment, Component } from 'react';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

export default class TableCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource,
      sorterInfo: props.defaultSorter || {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
      this.setState({ dataSource: nextProps.dataSource });
    }
  }
  updateState = () => {};

  loadNextPage = _.throttle(() => {
    this.props.loadNextPage();
  }, 200);

  renderEmpty = () => {
    const { emptyInfo = {} } = this.props;
    const { emptyIcon, emptyContent, emptyDescription = '' } = emptyInfo;
    return (
      <div className="emptyWrap flex flexColumn">
        <div className="iconWrap">
          <Icon icon={emptyIcon || 'draft-box'} />
        </div>
        <div className="emptyExplain">{emptyContent || _l('无数据')}</div>
        <div className="Gray_75">{emptyDescription}</div>
      </div>
    );
  };

  clickSorter = item => {
    const { sorterInfo = {} } = this.state;
    if (!item.sorter) return;
    this.setState(
      {
        sorterInfo: {
          order: sorterInfo.sortFiled === item.dataIndex && sorterInfo.order === 'asc' ? 'desc' : 'asc',
          sortFiled: item.dataIndex,
        },
      },
      () => {
        this.props.dealSorter(this.state.sorterInfo);
      },
    );
  };

  render() {
    const { columns = [], loading } = this.props;
    let { dataSource = [], sorterInfo = {} } = this.state;
    return (
      <div className="tableWrap">
        <div className="tableHeader flexRow">
          {columns.map(item => {
            return (
              <div className={`${item.className} flexRow`}>
                <div
                  className={cx('pRight12 pTop2', { ThemeHoverColor3: item.sorter, pointer: item.sorter })}
                  style={{ zIndex: 1 }}
                  onClick={() => {
                    this.clickSorter(item);
                  }}
                >
                  {item.title}
                </div>
                {item.sorter && (
                  <div className="flexColumn sorter">
                    <Icon
                      icon="arrow-up"
                      className={cx({
                        ThemeColor3: sorterInfo.order === 'asc' && sorterInfo.sortFiled === item.dataIndex,
                      })}
                    />
                    <Icon
                      icon="arrow-down"
                      className={cx({
                        ThemeColor3: sorterInfo.order === 'desc' && sorterInfo.sortFiled === item.dataIndex,
                      })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="tableContent">
          {loading ? (
            <LoadDiv className="top20" />
          ) : _.isEmpty(dataSource) ? (
            this.renderEmpty()
          ) : (
            <ScrollView onScrollEnd={this.loadNextPage}>
              {dataSource.map(item => {
                return (
                  <div className="row flexRow alignItemsCenter">
                    {columns.map(it => {
                      if (it.render) {
                        return <div className={it.className}>{it.render(item)}</div>;
                      } else {
                        return <div className={it.className}>{item[it.dataIndex]}</div>;
                      }
                    })}
                  </div>
                );
              })}
            </ScrollView>
          )}
        </div>
      </div>
    );
  }
}
TableCom.propTypes = {
  loading: PropTypes.bool,
  columns: PropTypes.array,
  dataSource: PropTypes.array,
  loadNextPage: PropTypes.func,
  dealSorter: PropTypes.func,
  defaultSorter: PropTypes.object,
};
