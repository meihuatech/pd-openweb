﻿import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { createLinksForMessage } from 'src/components/common/function';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAway = createDecoratedComponent(withClickAway);
import postEnum from '../../../constants/postEnum';
const { POST_TYPE } = postEnum;
import {
  addTop,
  removeTop,
  remove,
  removeComment,
  editVoteEndTimeSuccess,
  editShareScopeSuccess,
} from '../../../redux/postActions';
import { connect } from 'react-redux';
import EditPostDialog from './EditPostDialog';
import EditVoteEndTimeDialog from './EditVoteEndTimeDialog';
import createTask from 'src/components/createTask/createTask';
import './postOperateList.css';
import createCalendar from 'src/components/createCalendar/createCalendar';
import { index as dialog } from 'src/components/mdDialog/dialog';
import addOldTask from 'src/components/createTask/addOldTask';
import editShareScope from '../postComponent/editShareScope/editShareScope';
import post from 'src/api/post';

/**
 * 动态的操作列表
 */
const PostOperateList = createReactClass({
  displayName: 'PostOperateList',

  propTypes: {
    dispatch: PropTypes.func,
    options: PropTypes.object,
    postItem: PropTypes.any.isRequired,
    handleHide: PropTypes.func,
  },

  getInitialState() {
    return {
      index: 0,
      taskEvent: 0,
    };
  },

  componentClickAway(e) {
    if (this.props.handleHide) {
      this.props.handleHide(e);
    }
  },

  handleEdit() {
    this.componentClickAway();
    EditPostDialog.show(this.props.postItem, this.props.dispatch);
    return;
  },

  handleRemove() {
    const { dispatch } = this.props;
    this.componentClickAway();
    const postItem = this.props.postItem;
    const isComment = !!postItem.commentID;
    let header;
    if (isComment) {
      header = _l('确认删除此条回复') /* 确认删除此条回复*/ + '?';
    } else {
      header =
        postItem.isMy || !postItem.multiProjects
          ? _l('确认要删除此动态吗？')
          : _l('移除后，该动态在动态墙中不可见，确认继续？');
    }
    dialog({
      width: 420,
      container: {
        header,
        content: "<div class='mTop10'></div>",
        yesFn() {
          if (isComment) {
            const { postID, commentID } = postItem;
            dispatch(removeComment(postID, commentID));
          } else {
            dispatch(remove(postItem.postID));
          }
        },
        noFn: true,
        yesText: _l('确定'),
        noText: _l('取消'),
      },
    });
  },

  handleTop() {
    const { postItem, dispatch } = this.props;
    this.componentClickAway();
    dialog({
      container: {
        header: _l('请选择置顶时长'),
        content: `<div>
            <div class='mTop20 ThemeColor3 Font14' id='feedTopTime'>
              <label>
                <input type='radio' name='feedTopTime' checked='checked' value='24' />
                24${_l('小时')}
              </label>
              <label class='mLeft20 mRight20'>
                <input type='radio' name='feedTopTime' value='48' />
                48${_l('小时')}
              </label>
              <label><input type='radio' name='feedTopTime' value='72' /> 72${_l('小时')}</label>
              <label class='mLeft20'><input type='radio' name='feedTopTime' value='' />${_l('不限时长')}</label>
            </div>
            <div class='Clear'></div>
            </div>`,
        yesFn() {
          const hours = $('#feedTopTime').find('input[type=radio]:checked').val();
          dispatch(addTop({ postId: postItem.postID, hours }));
        },
        noFn: true,
        yesText: _l('确定'),
        noText: _l('取消'),
      },
      width: 450,
    });
  },

  handleRemoveTop() {
    const { postItem, dispatch } = this.props;
    dispatch(removeTop({ postId: postItem.postID }));
    this.componentClickAway();
  },

  handleCreateNewCalender() {
    const postItem = this.props.postItem;
    this.componentClickAway();
    const message = createLinksForMessage({
      message: postItem.message,
      rUserList: postItem.rUserList,
      rGroupList: postItem.rGroupList,
      categories: postItem.categories,
      noLink: true,
    });
    createCalendar({
      MemberArray: _(postItem.rUserList)
        .filter(a => a)
        .map(a => ({ accountId: a.aid, avatar: a.avatar, fullname: a.name }))
        .concat(
          _(postItem.comments)
            .map(c => c.user)
            .filter(a => a)
            .map(a => ({ accountId: a.accountId, avatar: a.avatar, fullname: a.userName }))
            .value(),
        )
        .concat(
          _(postItem.comments)
            .map(c =>
              _(c.rUserList)
                .filter(a => a)
                .map(a => ({ accountId: a.aid, avatar: a.avatar, fullname: a.name }))
                .value(),
            )
            .flatten()
            .value(),
        )
        .uniq('accountId')
        .filter(a => a.accountId)
        .value(),
      Message: message.replace(/<[^>]+>/g, ''),
    });
  },

  handleCreateNewTask(param) {
    const postItem = _.clone(this.props.postItem);
    this.componentClickAway();
    const message = createLinksForMessage({
      message: postItem.message,
      rUserList: postItem.rUserList,
      rGroupList: postItem.rGroupList,
      categories: postItem.categories,
      noLink: true,
    });
    if (param === 1) {
      createTask({
        MemberArray: _(postItem.rUserList)
          .uniq('aid')
          .map(a => ({ accountId: a.aid, avatar: a.avatar, fullname: a.name }))
          .value(),
        Description: message.replace(/<[^>]+>/g, ''),
        PostID: postItem.postID,
        isFromPost: true,
        ProjectID: postItem.projectIds && postItem.projectIds.length === 1 ? postItem.projectIds[0] : null,
      });
    } else if (param === 2) {
      addOldTask({
        MemberArray: _(postItem.rUserList)
          .uniq('aid')
          .map(a => ({ accountId: a.aid, avatar: a.avatar, fullname: a.name }))
          .value(),
        Description: message.replace(/<[^>]+>/g, ''),
        PostID: postItem.postID,
      });
    }
  },

  handleEditVoteEndTime() {
    const { dispatch } = this.props;
    this.componentClickAway();
    const postItem = _.clone(this.props.postItem);
    EditVoteEndTimeDialog.show(postItem, deadline => {
      dispatch(editVoteEndTimeSuccess({ postId: postItem.postID, deadline }));
    });
  },

  handleEditScope() {
    const { dispatch } = this.props;
    this.componentClickAway();
    const postItem = _.clone(this.props.postItem);
    editShareScope(postItem, scope => {
      dispatch(editShareScopeSuccess({ postId: postItem.postID, scope }));
    });
  },

  render() {
    const postItem = this.props.postItem;
    const canEdit = postItem.isMy;
    const canRemove = this.props.allowOperate;
    const isTop = !!postItem.isFeedtop;
    const canTop = !!postItem.feedtop;

    // Edit
    const editOption = canEdit ? <MenuItem onClick={this.handleEdit}>{_l('编辑')}</MenuItem> : undefined;

    // Remove
    const removeOption = canRemove && (
      <MenuItem onClick={() => this.handleRemove()}>
        {postItem.isMy || !postItem.multiProjects ? _l('删除') : _l('从本组织移除')}
      </MenuItem>
    );

    // Top
    let topOption;
    if (canTop) {
      topOption = isTop ? (
        <MenuItem onClick={this.handleRemoveTop}>{_l('取消此条置顶')}</MenuItem>
      ) : (
        <MenuItem onClick={this.handleTop}>{_l('设为置顶动态')}</MenuItem>
      );
    }

    // Task
    let taskHtml;
    if (postItem.postType != POST_TYPE.video && postItem.postType != POST_TYPE.vote && postItem.postType != '5') {
      if (!postItem.source || postItem.source.id != md.global.APPInfo.taskAppID) {
        taskHtml = (
          <MenuItem
            subMenu={
              <Menu>
                <MenuItem onClick={() => this.handleCreateNewTask(1)}>{_l('创建为新任务')}</MenuItem>
                <MenuItem onClick={() => this.handleCreateNewTask(2)}>{_l('加入已有任务')}</MenuItem>
              </Menu>
            }
          >
            {_l('加入任务')}
          </MenuItem>
        );
      } else if (!postItem.source) {
        taskHtml = (
          <MenuItem
            target="_blank"
            rel="noopener noreferrer"
            href={'/' + postItem.source.appUrl + '?appDetailID=' + postItem.source.detailID}
          >
            {_l('查看任务')}
          </MenuItem>
        );
      }
    }

    // Calendar
    let calendarOption;
    if (postItem.postType != '7' && postItem.postType != '5') {
      if (postItem.source == undefined || postItem.source.id !== md.global.APPInfo.calendarAppID) {
        calendarOption = (
          <MenuItem id="createNewCalendar" onClick={this.handleCreateNewCalender}>
            {_l('加入日程')}
          </MenuItem>
        );
      } else if (postItem.source != undefined) {
        calendarOption = (
          <MenuItem target="_blank" rel="noopener noreferrer" href={postItem.source.detailUrl}>
            {_l('查看日程')}
          </MenuItem>
        );
      }
    }

    // edit vote end time
    let editVoteEndTime;
    if (postItem.isMy && postItem.postType === '7' && !postItem.isPostVote) {
      editVoteEndTime = <MenuItem onClick={this.handleEditVoteEndTime}>{_l('修改截止日期')}</MenuItem>;
    }

    // edit scope
    // 发布者
    // 管理员 && 有且仅有1个企业网络下的至少一个群组。
    let editScope;
    if (postItem.isMy || (postItem.projectIds.length === 1 && this.props.allowOperate)) {
      editScope = <MenuItem onClick={() => this.handleEditScope()}>{_l('修改可见范围')}</MenuItem>;
    }

    if (editOption || topOption || taskHtml || calendarOption || removeOption || editVoteEndTime || editScope) {
      return (
        <ClickAway onClickAway={this.componentClickAway}>
          <Menu>
            {editOption}
            {editScope}
            {editVoteEndTime}
            {topOption}
            {taskHtml}
            {calendarOption}
            {removeOption}
          </Menu>
        </ClickAway>
      );
    }
    return (
      <ClickAway onClickAway={this.componentClickAway}>
        <Menu>
          <MenuItem className="cursorDefault">{_l('无操作权限')}</MenuItem>
        </Menu>
      </ClickAway>
    );
  },
});

export default connect(state => {
  const { options } = state.post;
  return { options };
})(PostOperateList);
