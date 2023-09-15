﻿/**
 * init -> formatAttachment -> loadAttachment
 */
import attachmentAjax from 'src/api/attachment';
import kcAjax from 'src/api/kc';
import fileAjax from 'src/api/file';
import { getToken } from 'src/util';
import saveToKnowledge from 'src/components/saveToKnowledge/saveToKnowledge';
import folderDg from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import { NODE_VISIBLE_TYPE, PICK_TYPE } from '../../../constant/enum';
import kcService from '../../../api/service';
import { EXT_TYPE_DIC, PREVIEW_TYPE, LOADED_STATUS } from '../constant/enum';
import { splitFileName } from '../constant/util';
import ACTION_TYPES from '../constant/actionTypes';
import * as ajax from '../ajax';
import _ from 'lodash';

function addViewCount(attachment) {
  if (!attachment || !md.global.Account || !md.global.Account.accountId || !_.get(attachment, 'sourceNode.fileID')) {
    return;
  }
  if (attachment.previewAttachmentType === 'COMMON') {
    attachmentAjax.addAttachmentClick({
      fileId: attachment.sourceNode.fileID,
      fromType: attachment.sourceNode.fromType,
    });
  } else if (attachment.previewAttachmentType === 'KC') {
    kcService.addNodeViewCount(attachment.sourceNode.refId || attachment.sourceNode.id);
  }
}

function loadAttachment(attachment, options = {}) {
  const promise = $.Deferred();

  if (!attachment) attachment = {};

  let { previewAttachmentType, previewType } = attachment;
  const { refId } = attachment.sourceNode || {};
  addViewCount(attachment);
  let attachmentPromise = Object.assign({}, attachment);
  if (
    (previewAttachmentType === 'COMMON' && !!refId && md.global.Account.accountId) ||
    previewAttachmentType === 'KC_ID'
  ) {
    attachmentPromise = ajax.getKcNodeDetail(refId).then(data => {
      if (!data || data.visibleType === NODE_VISIBLE_TYPE.CLOSE) {
        promise.reject({
          text: '文件已删除或您没有权限查看此文件',
          status: LOADED_STATUS.DELETED,
        });
        return promise;
      }
      return Object.assign({}, attachment, {
        previewType: data.viewType,
        viewUrl: data.viewUrl,
        previewAttachmentType: 'KC',
        sourceNode: data,
        originNode: attachment.sourceNode,
      });
    });
  } else if (previewAttachmentType === 'COMMON_ID') {
    const args = {
      fileId: attachment.sourceNode.fileId || attachment.sourceNode.fileID,
    };
    if (window.shareState && window.shareState.shareId) {
      args.shareId = window.shareState.shareId;
      args.type =
        window.shareState.isRecordShare || window.shareState.isPublicRecord || _.get(window, 'shareState.isPublicView')
          ? 3
          : _.get(window, 'shareState.isPublicQuery') || _.get(window, 'shareState.isPublicForm')
          ? 11
          : 14;
    }
    args.worksheetId = options.worksheetId;
    attachmentPromise = attachmentAjax.getAttachmentDetail(args).then(data => {
      if (!data) {
        promise.reject({
          text: '文件不存在',
          status: LOADED_STATUS.DELETED,
        });
        return promise;
      }
      if (options.disableNoPeimission && data.refId && !data.shareUrl) {
        promise.reject({
          text: '您权限不足，无法分享，请联系管理员或文件上传者',
          status: LOADED_STATUS.DELETED,
        });
      }
      return Object.assign({}, attachment, {
        previewType: data.viewType,
        viewUrl: data.viewUrl,
        previewAttachmentType: 'COMMON',
        sourceNode: data,
        originNode: attachment.sourceNode,
      });
    });
  }

  $.when(attachmentPromise)
    .then(newAttachment => {
      previewAttachmentType = newAttachment.previewAttachmentType;
      previewType = newAttachment.previewType;
      if (previewAttachmentType === 'COMMON') {
        if (attachment.sourceNode.viewUrl) {
          newAttachment.viewUrl = attachment.sourceNode.viewUrl;
          promise.resolve(newAttachment);
        } else {
          promise.resolve(newAttachment);
        }
      } else if (previewAttachmentType === 'QINIU') {
        if (previewType === PREVIEW_TYPE.IFRAME) {
          ajax
            .fetchViewUrl(attachment)
            .then(fetchedAttachment => {
              promise.resolve(fetchedAttachment);
            })
            .fail(err => {
              promise.reject({
                text: err,
              });
            });
        } else if (previewType === PREVIEW_TYPE.VIDEO) {
          newAttachment.viewUrl = attachment.sourceNode.path;
          promise.resolve(newAttachment);
        } else {
          promise.resolve(newAttachment);
        }
      } else if (previewAttachmentType === 'KC') {
        newAttachment.viewUrl =
          previewType === PREVIEW_TYPE.PICTURE ? newAttachment.sourceNode.viewUrl : newAttachment.sourceNode.viewUrl;
        promise.resolve(newAttachment);
      } else {
        promise.resolve(newAttachment);
      }
    })
    .fail(err => {
      promise.reject({
        text: err,
      });
    });
  return promise;
}

function getExtType(ext) {
  return EXT_TYPE_DIC[ext.toLowerCase()];
}

function formatAttachment(attachments, callfrom) {
  return attachments.map(attachment => {
    let previewAttachmentType, previewType, name, ext, size, viewUrl, msg;
    attachment.ext = attachment.ext || '';
    if (attachment.previewAttachmentType) {
      previewAttachmentType = attachment.previewAttachmentType;
    } else if (callfrom) {
      if (callfrom === 'kc') {
        previewAttachmentType = 'KC';
      } else if (callfrom === 'player') {
        previewAttachmentType = 'COMMON';
      } else if (callfrom === 'chat') {
        previewAttachmentType = 'QINIU';
      } else {
        console.error('不合法的callfrom');
      }
    } else {
      console.log('attachmentType.....');
    }
    if (previewAttachmentType === 'COMMON' || previewAttachmentType === 'COMMON_ID') {
      ext = attachment.ext[0] === '.' ? attachment.ext.slice(1) : attachment.ext;
      previewType = attachment.viewType || getExtType(ext) || PREVIEW_TYPE.OTHER;
      name = attachment.originalFilename || attachment.name;
      size = attachment.filesize || attachment.size;
    } else if (previewAttachmentType === 'KC') {
      previewType = attachment.viewType;
      name = attachment.name;
      ext = attachment.ext;
      size = attachment.size;
    } else if (previewAttachmentType === 'QINIU') {
      const splited = splitFileName(attachment.name);
      ext = attachment.ext || splited.ext;
      previewType = getExtType(ext) || PREVIEW_TYPE.OTHER;
      if (previewType === PREVIEW_TYPE.LINK) {
        const url = attachment.linkUrl.match(/http(|s):\/\/.*/) ? attachment.linkUrl : 'http://' + attachment.linkUrl;
        attachment.shortLinkUrl = url;
        attachment.originLinkUrl = url;
      }
      name = splited.name;
      size = attachment.size;
    }
    if (previewType === PREVIEW_TYPE.PICTURE) {
      viewUrl =
        previewAttachmentType === 'COMMON'
          ? attachment.viewUrl || attachment.filepath + attachment.filename
          : previewAttachmentType === 'KC'
          ? attachment.viewUrl
          : attachment.path;
    } else if (previewType === PREVIEW_TYPE.CODE || previewType === PREVIEW_TYPE.MARKDOWN) {
      if (size > 512 * 1024) {
        // 大于 0.5M 的文件不预览
        previewType = PREVIEW_TYPE.OTHER;
      } else {
        if (previewAttachmentType === 'KC') {
          viewUrl = attachment.viewUrl;
        } else if (previewAttachmentType === 'QINIU') {
          // viewUrl = attachment.path;
          previewType = PREVIEW_TYPE.OTHER; // path 暂时没有 token，无法预览
        } else {
          viewUrl = attachment.downloadUrl;
        }
      }
    }
    if (previewType === PREVIEW_TYPE.VIDEO && (attachment.filesize || attachment.size) > 1024 * 1024 * 1024) {
      msg = _l('文件过大，不支持在线预览，请您下载后查看');
      previewType = PREVIEW_TYPE.OTHER;
    }
    if (ext === 'xd') {
      previewType = PREVIEW_TYPE.OTHER;
    }
    return {
      previewAttachmentType,
      previewType,
      name: name || '',
      ext: ext || '',
      size,
      viewUrl,
      msg,
      sourceNode: attachment,
    };
  });
}

export function init(options, extra) {
  return (dispatch, getState) => {
    const { callFrom, showThumbnail, showAttInfo, hideFunctions, fromType, onClose } = options;
    let { attachments, index } = options;
    let currentAttachment;
    index = index || 0;
    dispatch({
      type: 'FILE_PREVIEW_SAVE_ORIGIN_ATTACHMENTS',
      attachments,
    });
    attachments = formatAttachment(attachments, callFrom);
    currentAttachment = attachments[index];
    dispatch({
      type: 'FILE_PREVIEW_INIT',
      index,
      attachments,
      showThumbnail,
      showAttInfo,
      hideFunctions,
      fromType,
      onClose,
      extra,
    });
    loadAttachment(currentAttachment, options)
      .then(attachment => {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
          attachment,
          index,
        });
      })
      .fail(err => {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
          attachment: currentAttachment,
          index,
          error: err,
        });
      });
    if (index > attachments.length - 3) {
      loadMoreAttachments(getState(), dispatch);
    }
    if (index < 3) {
      preLoadMoreAttachments(getState(), dispatch);
    }
  };
}

export function loading() {
  return {
    type: 'FILE_PREVIEW_CLOSE',
  };
}

export function error() {
  return {
    type: 'FILE_PREVIEW_ERROR',
    error: true,
  };
}

function loadMoreAttachments(state, dispatch, isPre) {
  const { extra, isLoadingMore, loadMoreFinished } = state;
  const loadAjaxName = isPre ? 'preLoadMoreAttachments' : 'loadMoreAttachments';
  if (extra && typeof extra[loadAjaxName] === 'function' && !isLoadingMore && !loadMoreFinished) {
    dispatch({
      type: 'FILE_PREVIEW_LOAD_MORE_START',
    });
    extra[loadAjaxName]()
      .then(data => {
        // if (data.length === 0) {
        //   // dispatch({
        //   //   type: 'FILE_PREVIEW_LOAD_MORE_OUT',
        //   // });
        // } else {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_MORE_SUCESS',
          attachments: formatAttachment(data),
          isPre,
        });
        // }
      })
      .fail(() => {
        alert('加载更多失败', 2);
      });
  }
}

function preLoadMoreAttachments(state, dispatch) {
  loadMoreAttachments(state, dispatch, true);
}

function changeIndexThunk(dispatch, getState, index, flag) {
  const state = getState();
  if (flag && flag === 'prev') {
    index = state.index - 1;
  } else if (flag && flag === 'next') {
    index = state.index + 1;
  }
  if (index > state.attachments.length - 3) {
    loadMoreAttachments(state, dispatch);
  }
  if (index < 3) {
    preLoadMoreAttachments(state, dispatch);
  }
  if (index < 0) {
    alert('已经是第一个了', 3);
    nothing();
    return;
  } else if (index >= state.attachments.length) {
    alert('已经是最后一个了', 3);
    nothing();
    return;
  }
  const currentAttachment = _.assign({}, state.attachments[index]);
  const { previewType } = currentAttachment;
  // if (state.fullscreen && previewType !== PREVIEW_TYPE.PICTURE) {
  //   dispatch({
  //     type: ACTION_TYPES.TOGGLE_FULLSCREEN,
  //   });
  // }
  dispatch({
    type: 'FILE_PREVIEW_CHANGE_INDEX',
    index,
  });
  dispatch({
    type: 'FILE_PREVIEW_LOAD_FILE_START',
  });
  loadAttachment(currentAttachment)
    .then(attachment => {
      dispatch({
        type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
        attachment,
        index,
      });
    })
    .fail(err => {
      dispatch({
        type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
        attachment: currentAttachment,
        index,
        error: err,
      });
    });
}

export function changeIndex(index, flag) {
  return (dispatch, getState) => {
    changeIndexThunk(dispatch, getState, index, flag);
  };
}

export function next() {
  return changeIndex(0, 'next');
}

export function prev() {
  return changeIndex(0, 'prev');
}

export function disableInited() {
  return {
    type: ACTION_TYPES.DISABLE_INITED,
  };
}

function nothing() {
  return {
    type: ACTION_TYPES.NOTHING,
  };
}

export function renameFile(value) {
  return (dispatch, getState) => {
    const state = getState();
    const index = state.index;
    const currentAttachment = state.attachments[index];
    const previewAttachmentType = currentAttachment.previewAttachmentType;
    if (previewAttachmentType === 'KC') {
      const { id, ext } = currentAttachment.sourceNode;
      ajax
        .renameKcFile(id, value, ext)
        .then(data => {
          currentAttachment.sourceNode.name = value;
          currentAttachment.name = value;
          alert('修改成功');
          // 修改文件名回掉
          if (state.extra && typeof state.extra.performUpdateItem === 'function') {
            state.extra.performUpdateItem(currentAttachment.sourceNode);
          }
          dispatch({
            type: 'FILE_PREVIEW_UPDATE_FILE',
            attachment: currentAttachment,
            index,
          });
        })
        .fail(() => {
          alert('修改失败', 2);
        });
    } else if (previewAttachmentType === 'COMMON') {
      const { docVersionID, fileID, ext, sourceID } = currentAttachment.sourceNode;
      ajax
        .renameFile(docVersionID, fileID, value, ext, sourceID)
        .then(data => {
          currentAttachment.sourceNode.originalFilename = value;
          currentAttachment.name = value;
          alert('修改成功');
          // extra 文件重命名回调
          if (state.extra && typeof state.extra.renameCallback === 'function') {
            state.extra.renameCallback(currentAttachment.sourceNode, state.originAttachments);
          }
          dispatch({
            type: 'FILE_PREVIEW_UPDATE_FILE',
            attachment: currentAttachment,
            index,
          });
        })
        .fail(() => {
          alert('修改失败', 2);
        });
    }
  };
}

export function updateAllowDownload() {
  return (dispatch, getState) => {
    const state = getState();
    const index = state.index;
    const currentAttachment = state.attachments[index];
    const docVersionID = currentAttachment.sourceNode.docVersionID;
    const allowDown = !!currentAttachment.sourceNode.allowDown;
    ajax
      .updateAllowDownload(docVersionID, !allowDown)
      .then(resp => {
        if (allowDown) {
          delete currentAttachment.sourceNode.allowDown;
          alert('已设置为不可以下载');
        } else {
          currentAttachment.sourceNode.allowDown = 'ok';
          alert('已设置为可以下载');
        }
        dispatch({
          type: 'FILE_PREVIEW_UPDATE_FILE',
          attachment: currentAttachment,
          index,
        });
      })
      .fail(() => {
        alert('设置失败', 3);
      });
  };
}

function selectFolder() {
  const promise = $.Deferred();
  folderDg({
    dialogTitle: _l('选择路径'),
    isFolderNode: 1,
    selectedItems: null,
    zIndex: 9999,
  })
    .then(result => {
      promise.resolve(result);
    })
    .fail(() => {
      promise.reject();
    });
  return promise;
}

export function saveToKnowlwdge(savePath) {
  return (dispatch, getState) => {
    const state = getState();
    const index = state.index;
    const currentAttachment = state.attachments[index];
    const { previewAttachmentType, sourceNode, previewType } = currentAttachment;
    let savePromise = $.Deferred();
    if (savePath === 1) {
      savePromise = $.when({ type: PICK_TYPE.MY, node: { id: null, name: _l('我的文件') } });
    } else {
      if (!md.global.Account || !md.global.Account.accountId) {
        alert(_l('保存失败, 您无法选择文件路径'), 2);
        return;
      }
      savePromise = selectFolder();
    }
    savePromise
      .then(path => {
        const sourceData = {};
        let attachmentType;
        if (previewAttachmentType === 'COMMON') {
          attachmentType = 1;
          sourceData.fileID = sourceNode.fileID;
          sourceData.allowDown = !!(sourceNode.allowDown && sourceNode.allowDown === 'ok');
          if (previewType === PREVIEW_TYPE.PICTURE) {
            sourceData.allowDown = true;
          }
        } else if (previewAttachmentType === 'KC') {
          attachmentType = 2;
          sourceData.nodeId = sourceNode.id;
          if (state.extra && state.extra.shareFolderId) {
            sourceData.isShareFolder = true;
          }
        } else if (previewAttachmentType === 'QINIU') {
          attachmentType = 0;
          sourceData.name = currentAttachment.name + '.' + currentAttachment.ext;
          sourceData.filePath = sourceNode.path;
        }
        saveToKnowledge(attachmentType, sourceData)
          .save(path)
          .then(message => {
            // alert(message || '保存成功');
          })
          .fail(message => {
            alert(message || _l('保存失败'), 3);
          });
      })
      .fail(() => {
        // alert(_l('保存失败'), 2, 3000);
      });
  };
}

export function replaceAttachment(originAttachment, index, callFrom) {
  return dispatch => {
    const currentAttachment = formatAttachment([originAttachment], callFrom)[0];
    loadAttachment(currentAttachment)
      .then(attachment => {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
          attachment,
          index,
        });
      })
      .fail(err => {
        dispatch({
          type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
          attachment: currentAttachment,
          index,
          error: err,
        });
      });
  };
}

export function changeStateOfAttachment(attachment, index) {
  return dispatch => {
    dispatch({
      type: 'FILE_PREVIEW_LOAD_FILE_SUCESS',
      attachment,
      index,
    });
  };
}

export function onClose() {
  return (dispatch, getState) => {
    const state = getState();
    if (state.onClose) {
      state.onClose();
    }
  };
}

export function changePreviewService(previewService) {
  return dispatch => {
    dispatch({
      type: 'CHANGE_PREVIEW_SERVICE',
      previewService,
    });
  };
}

function toggleWindowFullScreen() {
  if (
    !document.fullscreenElement && // alternative standard method
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement
  ) {
    // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

// 全屏模式
export function toggleFullScreen() {
  // toggleWindowFullScreen();
  return {
    type: ACTION_TYPES.TOGGLE_FULLSCREEN,
  };
}
