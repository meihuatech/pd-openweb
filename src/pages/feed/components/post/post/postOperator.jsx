import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';
import { addFavorite, removeFavorite } from '../../../redux/postActions';
import { connect } from 'react-redux';
import PostOperateList from './postOperateList';
import roleController from 'src/api/role';

/**
 * 动态右上角的操作项
 */
class PostOperator extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    postItem: PropTypes.object.isRequired,
    isShowOperate: PropTypes.bool,
  };

  static defaultProps = {
    isShowOperate: false,
  };

  constructor(props) {
    super(props);
    const { postItem } = props;

    this.state = {
      showOperateList: false,
      allowOperate: postItem && (!!postItem.allowOperate || postItem.user.accountId === md.global.Account.accountId),
      checkIsProjectAdmin: false,
    };
  }

  getPostAllowOperate() {
    if (this.state.allowOperate || this.state.checkIsProjectAdmin) return;
    const { postItem } = this.props;
    if (!postItem) return;
    const { projectIds } = postItem;
    if (!projectIds || !projectIds.length) return;
    projectIds.forEach((projectId) => {
      roleController.isProjectAdmin({ projectId }).then((result) => {
        if (result) {
          this.setState({ allowOperate: true });
        }
      });
    });

    this.setState({ checkIsProjectAdmin: true });
  }

  handleFavorite = () => {
    this.props.dispatch(addFavorite({ postId: this.props.postItem.postID }));
  };

  handleRemoveFavorite = () => {
    this.props.dispatch(removeFavorite({ postId: this.props.postItem.postID }));
  };

  toggleOperateList = () => {
    this.setState({ showOperateList: !this.state.showOperateList });
    this.getPostAllowOperate();
  };

  hideOperateList = (e) => {
    if (e && e.target && e.target === ReactDom.findDOMNode(this.toggleBtn)) {
      return;
    }
    this.setState({ showOperateList: false });
  };

  render() {
    let dropBtn;
    if (!this.props.isShowOperate) {
      dropBtn = (
        <div className="postOperatorListContainer clearfix">
          <span
            ref={(toggleBtn) => {
              this.toggleBtn = toggleBtn;
            }}
            onClick={this.toggleOperateList}
            className={cx('postOperatorListBtn icon-more_horiz Hand', this.state.showOperateList ? 'Gray_75' : 'Gray_9')}
          />
          {this.state.showOperateList ? (
            <PostOperateList
              handleHide={this.hideOperateList}
              className="postOperatorList z-depth-1"
              postItem={this.props.postItem}
              allowOperate={this.state.allowOperate}
            />
          ) : (
            undefined
          )}
        </div>
      );
    }

    return <div className="postOperator">{dropBtn}</div>;
  }
}

export default connect(state => ({}))(PostOperator);
