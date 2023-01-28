import React, { Component } from 'react';
import { string } from 'prop-types';
import { Motion, spring } from 'react-motion';
import CommonUserHandle from '../components/CommonUserHandle';
import IndexSide from '../components/IndexSide';
import SwitchProject from '../components/SwitchProject';
import '../NativeHeader/index.less';
import { navigateTo } from 'src/router/navigateTo';
import styled from 'styled-components';
const HomeEntry = styled.div`
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  border: 1px solid #eaeaea;
  margin: 0 12px 0 16px;
  color: #9e9e9e;
  text-align: center;
  line-height: 29px;
  cursor: pointer;
  &:hover {
    border-color: #ddd;
    color: #2196f3;
  }
`;
const Wrap = styled.div`
  .commonUserHandleWrap {
    float: right;
  }
  .nativeModuleLogo {
    width: auto !important;
    font-weight: 600;
    padding-right: 16px;
    padding-left: 0px !important;
  }
  .iconNav {
    width: 28px;
    height: 28px;
    background: #9d27b0;
    border-radius: 5px 5px 5px 5px;
    border-radius: 6px;
    color: #fff;
    line-height: 30px;
  }
  .line {
    width: 0px;
    height: 15px;
    border: 1px solid #e5e5e5;
    opacity: 1;
    margin-right: 12px;
  }
`;
export default class HubHeader extends Component {
  static propTypes = {
    path: string,
  };
  static defaultProps = {
    path: 'integration',
  };
  state = { indexSideVisible: false };

  changeIndexVisible = (visible = true) => {
    this.timer = setTimeout(() => {
      this.setState({ indexSideVisible: visible });
    }, 100);
  };

  render() {
    const { indexSideVisible } = this.state;
    return (
      <Wrap className="nativeHeaderWrap flexRow">
        <div className="flex flexRow alignItemsCenter">
          <div className="nativeModuleLogo">
            <HomeEntry data-tip={_l('主页')} onClick={() => navigateTo('/app/my')}>
              <i className="icon-home_page Font18"></i>
            </HomeEntry>
            <div className="nativeTitle">{_l('集成中心')}</div>
          </div>
          <div className="line"></div>
          <SwitchProject />
          <Motion style={{ x: spring(indexSideVisible ? 0 : -352) }}>
            {({ x }) => (
              <IndexSide
                posX={x}
                visible={indexSideVisible}
                onClose={() => this.setState({ indexSideVisible: false })}
                onClickAway={() => indexSideVisible && this.setState({ indexSideVisible: false })}
              />
            )}
          </Motion>
        </div>
        <CommonUserHandle type={'integration'} />
      </Wrap>
    );
  }
}
