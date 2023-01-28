import React from 'react';
import { getPrintContent } from '../util';
import cx from 'classnames';
import { Table } from 'antd';
import { Resizable } from 'react-resizable';
import { DEFAULT_FONT_SIZE } from '../config';
import _ from 'lodash';
let minPictureW = 169;
let minW = 33;
const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;
  // if (!width) {
  //   return <th {...restProps}/>;
  // }
  let id = restProps.className.split('ant-table-cell ')[1];
  return (
    <Resizable
      width={width}
      height={0}
      className="ResizableBox"
      handle={
        <span
          className="react-resizable-handle"
          onClick={e => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
      onResizeStop={() => {
        $(`.${id}`).removeClass('borderLine');
      }}
      onResizeStart={() => {
        if (id === 'orderNumber') {
          return;
        }
        $(`.${id}`).addClass('borderLine');
      }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

export default class TableRelation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
  }
  componentDidMount() {
    this.setData(this.props);
    const { printData } = this.props;
    $('.ant-table').css({
      fontSize: printData.font || DEFAULT_FONT_SIZE,
    });
  }

  componentDidUpdate() {
    const { printData } = this.props;
    $('.ant-table').css({
      fontSize: printData.font || DEFAULT_FONT_SIZE,
    });
  }

  componentWillReceiveProps = function (nextProps) {
    if (
      !_.isEqual(nextProps.controls, this.props.controls) ||
      nextProps.showData !== this.props.showData ||
      !_.isEqual(nextProps.orderNumberCheck, this.props.orderNumberCheck)
    ) {
      this.setData(nextProps);
    }
  };

  setData = props => {
    const { printData, dataSource, controls, orderNumberCheck, id, isShowFn, showData } = props;
    const { controlStyles = [] } = printData;
    let list = [];
    if (orderNumberCheck) {
      list = [
        {
          title: _l('序号'),
          dataIndex: 'number',
          className: 'orderNumber',
          width: 50,
          render: (text, record, index) => index + 1,
        },
      ];
    }
    let controlsList = [];
    controls.map(it => {
      let da = false;
      dataSource.map((o, i) => {
        if (da) {
          return;
        }
        let data = {
          ...it,
          value: o[it.controlId],
        };
        if (
          isShowFn(
            getPrintContent({
              ...data,
              isRelateMultipleSheet: true,
              value: o[it.controlId],
              showData: showData,
              noUnit: true,
            }),
            true,
          )
        ) {
          da = true;
        }
      });
      if (da || !showData) {
        controlsList.push(it);
      }
    });
    controlsList.map(it => {
      if (it.type !== 22) {
        let isIn = this.isIn(it.controlId);
        let w = this.setDefaultWidth(controlsList, orderNumberCheck);
        let isPicture = this.isAttachments(it);
        let width = isIn
          ? isPicture
            ? Math.max(this.curStylesW(it.controlId), minPictureW)
            : this.curStylesW(it.controlId)
          : isPicture
          ? minPictureW
          : w;
        //不显示分段
        list.push({
          title: [6, 8, 20, 31, 37].includes(it.type)
            ? `${it.controlName || _l('未命名')}`
            : it.controlName || _l('未命名'),
          type: it.type,
          dataIndex: `${it.controlId}-${id}`,
          className: `${it.controlId}-${id}`,
          width,
          render: (text, record, index) => {
            if ([29].includes(it.type)) {
              let list = (it.relationControls || []).find(o => o.attribute === 1) || {};
              if (list.type && ![29, 30].includes(list.type)) {
                it = { ...it, sourceControlType: list.type, advancedSetting: list.advancedSetting };
              }
            }
            return getPrintContent({
              ...it,
              isRelateMultipleSheet: true,
              value: record[it.controlId],
            });
          },
        });
      }
    });
    this.setState({
      list: list,
    });
  };

  hasPicture = id => {
    const { dataSource } = this.props;
    let has = false;
    dataSource.map(it => {
      let attachments;
      try {
        attachments = JSON.parse(it[id]);
      } catch (err) {
        return;
      }
      const pictureAttachments = attachments.filter(attachment => File.isPicture(attachment.ext));
      const otherAttachments = attachments.filter(attachment => !File.isPicture(attachment.ext));
      has = pictureAttachments.length > 0 || otherAttachments.length > 0;
    });
    return has;
  };

  isAttachments = it => {
    return it.type === 14 || (it.type === 30 && it.sourceControlType === 14);
  };

  resizeWidth = (controlId, w) => {
    const { printData, handChange } = this.props;
    const { list } = this.state;
    let n = list.findIndex(it => it.dataIndex === controlId);
    if (n < 0 || n >= list.length - 1) {
      return;
    }
    let width = list[n].width;
    let nextControl = list[n + 1];
    let nextWidth = nextControl.width;
    let data = [];
    let nextW = width + nextWidth - w;
    let sumW = _.sum(list.map(it => it.width));
    if (nextW < minW || w < minW) {
      // 最小宽度33
      return;
    } else {
      if (
        (this.isAttachments(list[n]) && w <= minPictureW) ||
        (this.isAttachments(nextControl) && nextW <= minPictureW)
      ) {
        // 附件图片 最小宽度169
        return;
      }
    }
    list.map(it => {
      if (it.dataIndex === controlId) {
        data.push({
          ...it,
          width: w,
        });
      } else {
        if (it.dataIndex === nextControl.dataIndex) {
          data.push({
            ...it,
            width: width + nextWidth - w,
          });
        } else {
          data.push(it);
        }
      }
    });
    if (sumW !== _.sum(data.map(it => it.width))) {
      return;
    }
    this.setState(
      {
        list: data,
      },
      () => {
        let data = [];
        data = this.changeData(nextControl.dataIndex, width + nextWidth - w, this.changeData(controlId, w));
        handChange({
          ...printData,
          controlStyles: data,
        });
      },
    );
  };

  changeData = (controlId, w, dataList) => {
    const { printData, dataSource, controls, orderNumberCheck, id } = this.props;
    let { controlStyles = [] } = printData;
    let data = [];
    if (dataList) {
      controlStyles = dataList;
    }
    //存的时候 `${controlId}-${id}`
    let isData = controlStyles.map(it => it.controlId).includes(`${controlId}`);
    if (isData) {
      controlStyles.map(it => {
        if (it.controlId === `${controlId}`) {
          data.push({
            controlId: it.controlId,
            width: w,
          });
        } else {
          data.push(it);
        }
      });
    } else {
      data = controlStyles;
      data.push({
        controlId: `${controlId}`,
        width: w,
      });
    }
    return data;
  };

  handleResize =
    col =>
    (e, { size }) => {
      // 序号暂不拖拽宽度
      if (col.dataIndex === 'number') {
        return;
      }
      $(`.${col.dataIndex}`).addClass('borderLine');
      this.resizeWidth(col.dataIndex, size.width);
    };
  isIn = controlId => {
    const { printData, id } = this.props;
    const { controlStyles = [] } = printData;
    let list = controlStyles.map(o => o.controlId);
    return list.includes(`${controlId}-${id}`) || list.includes(controlId);
  };
  curStylesW = controlId => {
    const { printData, id } = this.props;
    const { controlStyles = [] } = printData;
    let o = controlStyles.find(s => s.controlId === `${controlId}-${id}`);
    o = !o ? controlStyles.find(o => o.controlId === controlId) || {} : o; //兼容之前老数据
    return o.width;
  };
  setDefaultWidth = (controls, orderNumberCheck) => {
    let widthN = 0;
    let num = 0;
    controls.map(it => {
      let width = 0;
      //是否附件且有内容
      let isType14 = this.isAttachments(it);
      if (this.isIn(it.controlId)) {
        width = isType14 ? Math.max(this.curStylesW(it.controlId), minPictureW) : this.curStylesW(it.controlId);
        widthN = widthN + width;
        num = num + 1;
      } else {
        if (isType14) {
          width = minPictureW;
          widthN = widthN + width;
          num = num + 1;
        }
      }
    });
    // 728总宽度 50序号宽度
    let width = Math.floor((728 - widthN) / (controls.length - num));
    if (orderNumberCheck) {
      width = Math.floor((728 - 50 - widthN) / (controls.length - num));
    }
    return width;
  };

  render() {
    const { printData, dataSource, controls, orderNumberCheck, id, showData } = this.props;
    const { list } = this.state;
    if (list.length <= 0 && !orderNumberCheck) {
      return '';
    }
    const columns = list.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleResize(col),
      }),
    }));
    return (
      <Table
        className={cx('relationsTable', { noData: dataSource.length <= 0 })}
        bordered
        pagination={false}
        components={{
          header: {
            cell: ResizeableTitle,
          },
        }}
        // tableLayout="fiexd" // 内容不会影响列的布局
        columns={columns}
        dataSource={dataSource}
      />
    );
  }
}
