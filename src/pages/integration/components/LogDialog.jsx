import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LoadDiv, Dialog } from 'ming-ui';
import { useSetState } from 'react-use';
import JsonView from 'react-json-view';
import { getHistoryDetail } from 'src/pages/workflow/api/packageVersion';

import cx from 'classnames';
const TABLIST = ['请求参数', '返回值'];
const Wrap = styled.div`
  .tabCon {
    border-bottom: 1px solid #f5f5f5;
    li {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      display: inline-block;
      margin: 0 18px;
      padding: 0 20px 10px;
      box-sizing: border-box;
      border-bottom: 3px solid rgba(0, 0, 0, 0);
      &.isCur {
        color: #2196f3;
        border-bottom: 3px solid #2196f3;
      }
    }
  }
  .con {
    height: 380px;
    background: #efffff;
    overflow: auto;
    padding: 16px;
  }
`;
export default function LogDialog(props) {
  const [{ data, tab, loading, isErr }, setState] = useSetState({
    data: {},
    tab: 0,
    loading: true,
    isErr: false,
  });
  useEffect(() => {
    getLogDetail();
  }, []);
  const getLogDetail = () => {
    setState({ loading: true });
    getHistoryDetail(
      {
        instanceId: props.info.id,
      },
      { isIntegration: true },
    ).then(
      res => {
        setState({ loading: false, data: res, isErr: false });
      },
      () => {
        setState({
          isErr: true,

          loading: false,
          data: props.info.instanceLog,
        });
      },
    );
  };
  const renderTabCon = () => {
    return (
      <div className="tabCon TxtLeft mTop22">
        <ul>
          {TABLIST.map((o, i) => {
            return (
              <li
                className={cx('Hand Font15', { isCur: tab === i })}
                onClick={() => {
                  setState({ tab: i });
                }}
              >
                {o}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  const getInfo = info => {
    let da = {};
    try {
      da = JSON.parse(info);
    } catch (error) {
      da = {};
    }
    return da;
  };
  return (
    <Dialog
      className=""
      width="740"
      visible={true}
      title={'查看 API 请求日志详情'}
      footer={null}
      onCancel={props.onCancel}
    >
      <Wrap className="">
        {loading ? (
          <LoadDiv />
        ) : isErr ? (
          <div className="con mTop16">
            <JsonView
              src={data}
              // theme="brewer"
              displayDataTypes={false}
              displayObjectSize={false}
              // name={_l('成功')}
            />
          </div>
        ) : (
          <React.Fragment>
            {renderTabCon()}
            <p className="Gray_9e mTop24 WordBreak">
              {tab === 0 ? (
                <React.Fragment>
                  {data.method !== 1 ? `(POST)` : `(GET)`} {data.url}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {_l(
                    '请求时间 %0, 状态码 %1，耗时 %2 秒',
                    props.info.createDate,
                    data.json.code,
                    !props.info.completeDate
                      ? ''
                      : moment(props.info.completeDate).diff(moment(props.info.createDate), 'seconds'),
                  )}
                </React.Fragment>
              )}
            </p>
            <div className="con mTop16">
              <JsonView
                src={
                  tab !== 0
                    ? getInfo(data.json.result)
                    : [1, 4].includes(data.contentType) //contentType 1 4 请求使用这个requests
                    ? data.requests
                    : getInfo(data.body)
                }
                // theme="brewer"
                displayDataTypes={false}
                displayObjectSize={false}
                // name={_l('成功')}
              />
            </div>
          </React.Fragment>
        )}
      </Wrap>
    </Dialog>
  );
}