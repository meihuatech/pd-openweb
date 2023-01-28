import React, { Component, Fragment } from 'react';
import { Dialog, ScrollView, Icon } from 'ming-ui';
import { Modal } from 'antd-mobile';
import MapLoader from './MapLoader';
import MapHandler from './MapHandler';
import '../less/MDMap.less';
import { Tooltip } from 'antd';
import _ from 'lodash';

export default class MDMap extends Component {
  static defaultProps = {
    isMobile: false,
    distance: 0,
    onAddressChange: () => {},
    onClose: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      defaultLocation: null,
      defaultList: [],
      list: [],
    };
  }

  componentDidMount() {
    this._MapLoader = new MapLoader();
    this._MapLoader.loadJs().then(() => {
      this.initMapObject();
    });
    if (this.conRef.current) {
      if (this.conRef.current.querySelector('.MDMapInput')) {
        this.conRef.current.querySelector('.MDMapInput').focus();
      }
    }
  }

  componentWillUnmount() {
    if (this._maphHandler) {
      this._maphHandler.destroyMap();
      this._maphHandler = null;
    }
  }

  conRef = React.createRef();

  initMapObject() {
    this._maphHandler = new MapHandler(this._mapContainer, { zoom: 15 });
    this._maphHandler.getCurrentPos(this.handleCurrPos); // 初始定位

    // 点击地图
    this._maphHandler.onClick((lng, lat, address, name) => {
      if (this.compareDistance(lng, lat)) {
        this.geoLocation(lng, lat, address, name);
      } else {
        alert(_l('不在定位范围内'), 2);
      }
    });

    // 移动地图
    this._maphHandler.moveEnd((lng, lat) => {
      this.setPosition(lng, lat, false);
    });
  }

  // 定位到当前位置，有可能会失败
  handleCurrPos = (status, result) => {
    const { defaultAddress } = this.props;

    if (status === 'complete') {
      this.setState({ defaultLocation: result });

      if (defaultAddress) {
        this.setPosition(defaultAddress.x, defaultAddress.y);
      } else {
        this.setPosition(result.position.lng, result.position.lat);
      }
    } else if (status === 'error' && defaultAddress) {
      const defaultLocation = {
        addressComponent: { building: defaultAddress.title },
        formattedAddress: defaultAddress.address,
        position: {
          lng: defaultAddress.x,
          lat: defaultAddress.y,
        },
      };
      this.setState({ defaultLocation });
      this.setPosition(defaultAddress.x, defaultAddress.y);
    }
  };

  // 定位并添加mark
  geoLocation = (lng, lat, address, name) => {
    if (this._maphHandler) {
      this.setPosition(lng, lat);
      this.props.onAddressChange({ lng, lat, address, name });
    }
  };

  // 定位
  setPosition(lng, lat, resetZoom = true) {
    const { distance } = this.props;

    if (this._maphHandler) {
      this._maphHandler.setPosition(lng, lat, resetZoom ? 18 : this._maphHandler.map.getZoom());
      this._maphHandler.removeMarker('searchMarker');
      this._maphHandler.addSearchMarker(lng, lat);

      // 周边搜索
      new AMap.PlaceSearch().searchNearBy('', [lng, lat], distance || 200, (status, result) => {
        if (status === 'complete') {
          this.setState({
            defaultList: result.poiList.pois.filter(
              item => item.location && item.location.lng && this.compareDistance(item.location.lng, item.location.lat),
            ),
          });
        } else {
          this.setState({ defaultList: [] });
        }
      });
    }
  }

  // 计算距离
  compareDistance(lng, lat) {
    const { distance } = this.props;
    const { defaultLocation } = this.state;
    const position = (defaultLocation || {}).position || {};

    if (!distance) return true;

    const lngLat = new AMap.LngLat(position.lng || '', position.lat || '');
    const myDistance = lngLat.distance([lng, lat]);

    if (myDistance < distance) {
      return true;
    }

    return false;
  }

  handleChange = event => {
    new AMap.PlaceSearch().search(event.currentTarget.value.trim(), (status, result) => {
      this.setState({
        list:
          status === 'complete'
            ? (_.get(result, 'poiList.pois') || []).filter(
                item =>
                  item.location && item.location.lng && this.compareDistance(item.location.lng, item.location.lat),
              )
            : [],
      });
    });
  };

  handleClearAndSet = location => {
    (document.getElementsByClassName('MDMapInput')[0] || {}).value = '';
    this.setPosition(location.lng, location.lat);
  };

  renderOperatorIcon() {
    const { isMobile, onClose } = this.props;
    const { defaultLocation } = this.state;

    return (
      <Fragment>
        <div
          className="Absolute"
          style={{ right: 12, top: 11, borderRadius: '50%', background: '#fff', width: 16, height: 16, zIndex: 9 }}
        />
        <Icon
          icon="delete_out"
          className="Gray_9e Font20 Absolute ThemeHoverColor3 pointer"
          style={{ right: 10, top: 10, zIndex: 10 }}
          onClick={onClose}
        />
        <div
          className="Gray_9e Absolute ThemeHoverColor3 pointer flexRow"
          style={{
            right: 10,
            top: isMobile ? 210 : 440,
            zIndex: 10,
            padding: 6,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: `0 3px 6px 0px rgba(0,0,0,0.16)`,
          }}
          onClick={() =>
            defaultLocation &&
            defaultLocation.position &&
            this.setPosition(defaultLocation.position.lng, defaultLocation.position.lat)
          }
        >
          <Icon icon="gps_fixed" className="Font18" />
        </div>
      </Fragment>
    );
  }

  renderSearch() {
    const { distance } = this.props;

    return (
      <Fragment>
        <div className="mLeft16 mRight16 relative">
          <Icon icon="search" className="Gray_9e Font16 Absolute" style={{ left: 12, top: 10 }} />
          <input
            type="text"
            placeholder={_l('搜索地点')}
            className="MDMapInput Gray"
            onKeyUp={e => e.keyCode === 13 && this.handleChange(e)}
            onChange={this.handleChange}
          />
        </div>
        {!!distance && (
          <div className="distanceInfo">
            <div className="Font12" style={{ color: '#4CAF50' }}>
              <Icon icon="task-setting_promet" className="Font14 mRight5" />
              {_l('仅能定位周边%0米以内的地点', distance)}
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  renderSearchList() {
    const { defaultLocation, list, defaultList } = this.state;
    const keywords = ((document.getElementsByClassName('MDMapInput')[0] || {}).value || '').trim();

    return (
      <ScrollView className="flex mTop5">
        {!keywords && defaultLocation && defaultLocation.formattedAddress && (
          <div className="MDMapList">
            <div
              className="flexColumn flex ellipsis"
              onClick={() =>
                this.geoLocation(
                  defaultLocation.position.lng,
                  defaultLocation.position.lat,
                  defaultLocation.formattedAddress,
                  (defaultLocation.addressComponent || {}).building,
                )
              }
            >
              <div className="ellipsis bold Gray">{(defaultLocation.addressComponent || {}).building}</div>
              <div className="ellipsis Gray_9e">{defaultLocation.formattedAddress}</div>
            </div>
            <Tooltip title={_l('当前位置')}>
              <Icon
                icon="gps_fixed"
                className="Font18 Gray_9e ThemeHoverColor3 pointer"
                onClick={() => this.handleClearAndSet(defaultLocation.position)}
              />
            </Tooltip>
          </div>
        )}
        {(keywords ? list : defaultList).map((item, index) => {
          if (item.address && typeof item.address === 'string') {
            return (
              <div className="MDMapList">
                <div
                  key={index}
                  className="flexColumn flex ellipsis"
                  onClick={() => {
                    this._maphHandler.getAddress(item.location.lng, item.location.lat, address => {
                      this.geoLocation(item.location.lng, item.location.lat, address || item.address, item.name);
                    });
                  }}
                >
                  <div className="ellipsis bold Gray">{item.name}</div>
                  <div className="ellipsis Gray_9e">{item.address}</div>
                </div>
                <Tooltip title={_l('定位')}>
                  <Icon
                    icon="location"
                    className="Font20 Gray_9e ThemeHoverColor3 pointer"
                    onClick={() => this.handleClearAndSet(item.location)}
                  />
                </Tooltip>
              </div>
            );
          }
          return null;
        })}
      </ScrollView>
    );
  }

  render() {
    const { isMobile } = this.props;

    if (isMobile) {
      return (
        <Modal popup animationType="slide-up" className="MDMap" style={{ height: '90%' }} visible>
          <div className="flexColumn leftAlign h100 relative">
            {this.renderOperatorIcon()}
            <div className="mBottom5" style={{ height: 250 }} ref={container => (this._mapContainer = container)} />
            {this.renderSearch()}
            {this.renderSearchList()}
          </div>
        </Modal>
      );
    }

    return (
      <Dialog.DialogBase className="MDMap" width="960" visible>
        {this.renderOperatorIcon()}
        <div ref={this.conRef} className="flexRow" style={{ height: 560 }}>
          <div className="MDMapSidebar flexColumn">
            {this.renderSearch()}
            {this.renderSearchList()}
          </div>

          <div className="flex" ref={container => (this._mapContainer = container)} />
        </div>
      </Dialog.DialogBase>
    );
  }
}
