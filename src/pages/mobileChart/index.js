import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { getRequest, mdAppResponse } from 'src/util';
import preall from 'src/common/preall';
import ChartContent from 'mobile/CustomPage/ChartContent';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import _ from 'lodash';

const store = configureStore();

const LayoutContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px 15px;
  box-sizing: border-box;
  background-color: #fff;
`;

const { reportId, access_token, getFilters } = getRequest();

class MobileChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      filters: []
    }
  }
  componentDidMount() {
    if (getFilters === 'true') {
      mdAppResponse({ type: 'getFilters' }).then(data => {
        const { value } = data;
        this.setState({
          loading: false,
          filters: _.isArray(value) && value.length ? value : []
        });
      });
    } else {
      this.setState({
        loading: false
      });
    }
  }
  render() {
    const { loading, filters } = this.state;
    const paddingHorizontal = 15 * 2;
    const paddingVertical = 8 * 2;
    const dimensions = {
      width: document.documentElement.clientWidth - paddingHorizontal,
      height: document.documentElement.clientHeight - paddingVertical,
    };
    return (
      <Provider store={store}>
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          <LayoutContent className="mobileAnalysis flexColumn">
            <ChartContent
              reportId={reportId}
              accessToken={access_token}
              dimensions={dimensions}
              filters={filters}
            />
          </LayoutContent>
        )}
      </Provider>
    );
  }
}

const Comp = preall(MobileChart, { allownotlogin: false });

ReactDOM.render(<Comp />, document.querySelector('#mobileChart'));
