export default {
  /**
  * map解锁
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.password
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   unlock: function (args, options = {}) {
     
     return $.api('AppManagement', 'Unlock', args, options);
   },
  /**
  * 修改锁定密码
  * @param {Object} args 请求参数
  * @param {string} args.newPassword
  * @param {string} args.appId
  * @param {string} args.password
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editLockPassword: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditLockPassword', args, options);
   },
  /**
  * 重新锁定
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {boolean} args.getSection 是否获取分组信息
  * @param {boolean} args.getManager 是否获取管理员列表信息
  * @param {boolean} args.getProject 获取组织信息
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resetLock: function (args, options = {}) {
     
     return $.api('AppManagement', 'ResetLock', args, options);
   },
  /**
  * 关闭应用锁
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {boolean} args.getSection 是否获取分组信息
  * @param {boolean} args.getManager 是否获取管理员列表信息
  * @param {boolean} args.getProject 获取组织信息
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   closeLock: function (args, options = {}) {
     
     return $.api('AppManagement', 'CloseLock', args, options);
   },
  /**
  * 添加角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.name 名称
  * @param {boolean} args.hideAppForMembers 该角色成员不可见当前应用
  * @param {string} args.description 描述
  * @param {integer} args.permissionWay 角色类型（0:自定义、10:只读、50::成员、100:管理员）
  * @param {string} args.projectId 网络id
  * @param {array} args.sheets 工作表权限集合
  * @param {array} args.userIds 角色成员id集合
  * @param {array} args.pages 自定义页面
  * @param {array} args.extendAttrs 用户扩展权限字段
  * @param {} args.generalAdd 是否启用 通用新增
  * @param {} args.gneralShare 是否启用 通用分享
  * @param {} args.generalImport 是否启用 通用导入
  * @param {} args.generalExport 是否启用 通用导出
  * @param {} args.generalDiscussion 是否启用 通用讨论
  * @param {} args.generalSystemPrinting 是否启用 通用系统打印
  * @param {} args.generalAttachmentDownload 是否启用 通用附件下载
  * @param {} args.generalLogging 是否启用 通用日志
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddRole', args, options);
   },
  /**
  * 删除角色(并把人员移动到其他角色)
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {string} args.resultRoleId 目标角色id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'RemoveRole', args, options);
   },
  /**
  * 添加角色成员
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {array} args.userIds 用户
  * @param {array} args.departmentIds 部门
  * @param {array} args.departmentTreeIds 部门树
  * @param {array} args.projectOrganizeIds 网络角色
  * @param {array} args.jobIds 职位ids
  * @param {string} args.projectId 网络id
  * @param {} args.enableGeneralAdd 是否启用 通用新增
  * @param {} args.enableGneralShare 是否启用 通用分享
  * @param {} args.enableGeneralImport 是否启用 通用导入
  * @param {} args.enableGeneralExport 是否启用 通用导出
  * @param {} args.enableGeneralDiscussion 是否启用 通用讨论
  * @param {} args.enableGeneralSystemPrinting 是否启用 通用系统打印
  * @param {} args.enableGeneralAttachmentDownload 是否启用 通用附件下载
  * @param {} args.enableGeneralLogging 是否启用 通用日志
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRoleMembers: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddRoleMembers', args, options);
   },
  /**
  * 移除角色成员
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {boolean} args.selectAll 是否全选
  * @param {array} args.userIds 用户
  * @param {array} args.departmentIds 部门
  * @param {array} args.jobIds 职位
  * @param {array} args.departmentTreeIds 部门树
  * @param {array} args.projectOrganizeIds 网络角色
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRoleMembers: function (args, options = {}) {
     
     return $.api('AppManagement', 'RemoveRoleMembers', args, options);
   },
  /**
  * 设置 角色负责人
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {string} args.projectId 网络id
  * @param {string} args.memberId 成员Id（用户Id、部门Id、部门树的部门Id、职位Id、组织角色Id、全组织 的 组织Id）
  * @param {integer} args.memberCategory 成员类型（用户 = 10、部门 = 20、部门树 = 21、职位 = 30、组织角色 = 40、网络（全组织） = 50）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setRoleCharger: function (args, options = {}) {
     
     return $.api('AppManagement', 'SetRoleCharger', args, options);
   },
  /**
  * 取消设置 角色负责人
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {string} args.projectId 网络id
  * @param {string} args.memberId 成员Id（用户Id、部门Id、部门树的部门Id、职位Id、组织角色Id、全组织 的 组织Id）
  * @param {integer} args.memberCategory 成员类型（用户 = 10、部门 = 20、部门树 = 21、职位 = 30、组织角色 = 40、网络（全组织） = 50）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelRoleCharger: function (args, options = {}) {
     
     return $.api('AppManagement', 'CancelRoleCharger', args, options);
   },
  /**
  * 退出应用单个角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   quitAppForRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'QuitAppForRole', args, options);
   },
  /**
  * 退出应用下所有角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   quitRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'QuitRole', args, options);
   },
  /**
  * 配置角色权限
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {} args.appRoleModel 角色配置实体
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditAppRole', args, options);
   },
  /**
  * 把人员移动到其他角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.sourceAppRoleId 来源角色id
  * @param {array} args.resultAppRoleIds 目标角色id
  * @param {boolean} args.selectAll 是否全选
  * @param {array} args.userIds 用户id集合
  * @param {array} args.departmentIds 部门id集合
  * @param {array} args.jobIds 职位id集合
  * @param {string} args.projectId 网络id
  * @param {array} args.departmentTreeIds 部门树
  * @param {array} args.projectOrganizeIds 网络角色
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeUserToRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'RemoveUserToRole', args, options);
   },
  /**
  * 编辑视图分发权限
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.viewId 视图id
  * @param {string} args.worksheetId 工作表id
  * @param {array} args.changeRoles 角色
  * @param {array} args.removeRoleIds 删除的角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editViewRoles: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditViewRoles', args, options);
   },
  /**
  * 编辑应用下成员是否可见角色列表
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {} args.status 1=可见 2=关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateMemberStatus: function (args, options = {}) {
     
     return $.api('AppManagement', 'UpdateMemberStatus', args, options);
   },
  /**
  * 更新 应用角色通知
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用 Id
  * @param {boolean} args.notify 通知
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppRoleNotify: function (args, options = {}) {
     
     return $.api('AppManagement', 'UpdateAppRoleNotify', args, options);
   },
  /**
  * 复制角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {string} args.roleName 新角色名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'CopyRole', args, options);
   },
  /**
  * 复制角色到外部门户
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色Id
  * @param {string} args.roleName 角色名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyRoleToExternalPortal: function (args, options = {}) {
     
     return $.api('AppManagement', 'CopyRoleToExternalPortal', args, options);
   },
  /**
  * 复制外部门户角色到内部
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色Id
  * @param {string} args.roleName 角色名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyExternalRolesToInternal: function (args, options = {}) {
     
     return $.api('AppManagement', 'CopyExternalRolesToInternal', args, options);
   },
  /**
  * 角色排序
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {array} args.roleIds 排序后的角色ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sortRoles: function (args, options = {}) {
     
     return $.api('AppManagement', 'SortRoles', args, options);
   },
  /**
  * 获取 应用角色设置
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppRoleSetting: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppRoleSetting', args, options);
   },
  /**
  * 获取应用下所用角色基本信息（不含具体权限）
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRolesWithUsers: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetRolesWithUsers', args, options);
   },
  /**
  * 分页获取 全部成员
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {integer} args.pageIndex 分页面码 = 默认1
  * @param {integer} args.pageSize 分页 页大小
  * @param {string} args.keywords 查询 关键词（现仅 支持 成员名称）
  * @param {integer} args.searchMemberType 搜索 成员类型（默认=0、用户/人员=10、部门=20，组织角色=30，职位=40）
  * @param {array} args.sort 排序参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTotalMember: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetTotalMember', args, options);
   },
  /**
  * 分页获取 外协成员
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {integer} args.pageIndex 分页面码 = 默认1
  * @param {integer} args.pageSize 分页 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOutsourcingMembers: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetOutsourcingMembers', args, options);
   },
  /**
  * 获取 角色列表（包含 我加入的角色标识）
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {boolean} args.allJoinRoles 查看所有加入的角色
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppRoleSummary: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppRoleSummary', args, options);
   },
  /**
  * 根据角色 分页获取 角色下的用户集
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {string} args.roleId 角色Id
  * @param {integer} args.pageIndex 分页面码 = 默认1
  * @param {integer} args.pageSize 分页 页大小
  * @param {string} args.keywords 查询 关键词（现仅 支持 成员名称）
  * @param {integer} args.searchMemberType 搜索 成员类型（默认=0、用户/人员=10、部门=20，组织角色=30，职位=40）
  * @param {array} args.sort 排序参数  （其中 FieldType值为： 默认[时间] = 0、时间 = 10、类型 = 20）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMembersByRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetMembersByRole', args, options);
   },
  /**
  * 批量编辑用户角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {array} args.dstRoleIds 目标角色Ids
  * @param {} args.selectMember 选中的角色成员
  * @param {boolean} args.selectAll 是否全选
  * @param {boolean} args.isOutsourcing 是否全选外协
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchEditMemberRole: function (args, options = {}) {
     
     return $.api('AppManagement', 'BatchEditMemberRole', args, options);
   },
  /**
  * 批量成员退出应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {} args.selectMember 选中的角色成员
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchMemberQuitApp: function (args, options = {}) {
     
     return $.api('AppManagement', 'BatchMemberQuitApp', args, options);
   },
  /**
  * 获取应用下某个角色的具体权限信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRoleDetail: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetRoleDetail', args, options);
   },
  /**
  * 获取应用下所有工作表信息生成添加角色模板
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAddRoleTemplate: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAddRoleTemplate', args, options);
   },
  /**
  * 获取网络下用户为应用管理员的应用信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {} args.type 应用分组下实体类型（0=工作表，1=自定义页面）
  * @param {boolean} args.containsLinks 是否包含链接类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppForManager: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppForManager', args, options);
   },
  /**
  * 网络下用户为管理员的应用集合
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.containsLinks 是否包含链接类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getManagerApps: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetManagerApps', args, options);
   },
  /**
  * 获取视图已分发角色
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.viewId 视图id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRolesByViewId: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetRolesByViewId', args, options);
   },
  /**
  * 获取网络下应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 应用状态  0=关闭 1=启用  可空
  * @param {} args.order 排序 0=默认 ，1=表数量降序，2=表数量升序，3=创建时间降序，4=创建时间升序
  * @param {integer} args.pageIndex 页数（从1开始）
  * @param {integer} args.pageSize 每页显示数
  * @param {string} args.keyword 搜索关键字（支持名称和拥有者名称）
  * @param {integer} args.sourceType 来源 默认0=全部，2=过滤分发平台
  * @param {} args.filterType 过滤类型（1 = 过滤加锁的,0 or 不传 = 默认）
  * @param {boolean} args.containsLinks 是否包含链接类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppsForProject: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppsForProject', args, options);
   },
  /**
  * 分页获取网络下应用信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 应用状态  0=关闭 1=启用  可空
  * @param {} args.order 排序 0=默认 ，1=表数量降序，2=表数量升序，3=创建时间降序，4=创建时间升序
  * @param {integer} args.pageIndex 页数（从1开始）
  * @param {integer} args.pageSize 每页显示数
  * @param {string} args.keyword 搜索关键字（支持名称和拥有者名称）
  * @param {integer} args.sourceType 来源 默认0=全部，2=过滤分发平台
  * @param {} args.filterType 过滤类型（1 = 过滤加锁的,0 or 不传 = 默认）
  * @param {boolean} args.containsLinks 是否包含链接类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppsByProject: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppsByProject', args, options);
   },
  /**
  * 获取应用信息（批量）
  * @param {Object} args 请求参数
  * @param {array} args.appIds
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApps: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetApps', args, options);
   },
  /**
  * 根据工作表id批量获取所属应用
  * @param {Object} args 请求参数
  * @param {array} args.sheetIds SheetId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppForSheetIds: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppForSheetIds', args, options);
   },
  /**
  * 获取导出相关功能模块token
  * @param {Object} args 请求参数
  * @param {} args.tokenType 功能模块 token枚举，3 = 导出excel，4 = 导入excel生成表，5= word打印,6 =导入创建应用，7=子表导入
  * @param {string} args.worksheetId
  * @param {string} args.viewId
  * @param {string} args.projectId 网络id ，TokenType = 4或6时，这个必穿
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getToken: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetToken', args, options);
   },
  /**
  * 更新应用状态
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id（原应用包id）
  * @param {integer} args.status 状态  0=关闭 1=启用 2=删除
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppStatus: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditAppStatus', args, options);
   },
  /**
  * 检测是否是网络后台应用管理员
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkIsAppAdmin: function (args, options = {}) {
     
     return $.api('AppManagement', 'CheckIsAppAdmin', args, options);
   },
  /**
  * 验证用户是否在应用管理员中
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkAppAdminForUser: function (args, options = {}) {
     
     return $.api('AppManagement', 'CheckAppAdminForUser', args, options);
   },
  /**
  * 把自己加入应用管理员(后台)
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRoleMemberForAppAdmin: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddRoleMemberForAppAdmin', args, options);
   },
  /**
  * 移动分组下项到另外一个分组（如果是同一应用下应用id相同即可）
  * @param {Object} args 请求参数
  * @param {string} args.sourceAppId 来源应用id
  * @param {string} args.resultAppId 目标应用id
  * @param {string} args.sourceAppSectionId 来源应用分组id
  * @param {string} args.resultAppSectionId 目标应用分组id
  * @param {array} args.workSheetsInfo 基础信息集合
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeWorkSheetAscription: function (args, options = {}) {
     
     return $.api('AppManagement', 'RemoveWorkSheetAscription', args, options);
   },
  /**
  * 删除应用分组下项(工作表，自定义页面)
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 组织id
  * @param {string} args.appSectionId 应用分组id
  * @param {string} args.workSheetId id
  * @param {integer} args.type 类型 0=工作表，1=自定义页面
  * @param {boolean} args.isPermanentlyDelete 是否永久删除 true-表示永久删除 false-表示到回收站
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeWorkSheetForApp: function (args, options = {}) {
     
     return $.api('AppManagement', 'RemoveWorkSheetForApp', args, options);
   },
  /**
  * 分页获取应用项回收站列表
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用id
  * @param {string} args.keyword 关键字搜索
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppItemRecoveryList: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppItemRecoveryList', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {string} args.id 应用项回收站记录id
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appItemRecovery: function (args, options = {}) {
     
     return $.api('AppManagement', 'AppItemRecovery', args, options);
   },
  /**
  * 修改分组下实体名称和图标
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId 应用分组id
  * @param {string} args.workSheetId id
  * @param {string} args.workSheetName 名称
  * @param {string} args.icon 图标
  * @param {integer} args.type 类型
  * @param {string} args.urlTemplate 链接
  * @param {object} args.configuration 链接配置
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWorkSheetInfoForApp: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditWorkSheetInfoForApp', args, options);
   },
  /**
  * 变更应用拥有者
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.memberId 新的应用拥有者
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppOwner: function (args, options = {}) {
     
     return $.api('AppManagement', 'UpdateAppOwner', args, options);
   },
  /**
  * 应用分组下新增项
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId SectionId
  * @param {string} args.name 名称
  * @param {string} args.icon Logo
  * @param {integer} args.type 类型 0=工作表 1=自定义页面
  * @param {integer} args.createType 创建类型（创建自定义页面得时候需要传）0-表示普通 1-表示外部链接
  * @param {string} args.urlTemplate 链接
  * @param {object} args.configuration 链接配置
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorkSheet: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddWorkSheet', args, options);
   },
  /**
  * 新增工作表（级联数据源及子表）
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 原始工作表id
  * @param {string} args.name
  * @param {integer} args.worksheetType 1：普通表 2：子表
  * @param {boolean} args.createLayer 直接创建层级视图
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addSheet: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddSheet', args, options);
   },
  /**
  * 转换工作表
  * @param {Object} args 请求参数
  * @param {string} args.sourceWorksheetId 来源工作表id
  * @param {string} args.worksheetId 子表id
  * @param {string} args.name 子表名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   changeSheet: function (args, options = {}) {
     
     return $.api('AppManagement', 'ChangeSheet', args, options);
   },
  /**
  * 复制自定义页面
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId SectionId
  * @param {string} args.name 名称
  * @param {string} args.id 自定义页面id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyCustomPage: function (args, options = {}) {
     
     return $.api('AppManagement', 'CopyCustomPage', args, options);
   },
  /**
  * 新增应用授权
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {integer} args.type 权限范围类型 1=全部，2=只读
  * @param {boolean} args.viewNull 不传视图id不返回数据配置
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAuthorize: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddAuthorize', args, options);
   },
  /**
  * 获取应用授权
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAuthorizes: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAuthorizes', args, options);
   },
  /**
  * 编辑应用授权类型
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appKey 应用key
  * @param {integer} args.type 权限范围类型 1=全部，2=只读
  * @param {boolean} args.viewNull 不传视图id不返回数据配置
  * @param {integer} args.status 授权状态 1-开启 2-关闭 3-删除
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAuthorizeStatus: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditAuthorizeStatus', args, options);
   },
  /**
  * 删除应用授权类型
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appKey 应用key
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteAuthorizeStatus: function (args, options = {}) {
     
     return $.api('AppManagement', 'DeleteAuthorizeStatus', args, options);
   },
  /**
  * 编辑备注
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.appKey
  * @param {string} args.remark 备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAuthorizeRemark: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditAuthorizeRemark', args, options);
   },
  /**
  * 获取当前应用的的申请信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.size 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppApplyInfo: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppApplyInfo', args, options);
   },
  /**
  * 申请加入应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.remark 申请说明
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAppApply: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddAppApply', args, options);
   },
  /**
  * 更新应用申请状态
  * @param {Object} args 请求参数
  * @param {array} args.ids 申请信息的id
  * @param {string} args.appId 应用id
  * @param {integer} args.status 状态 2=通过，3=拒绝
  * @param {string} args.roleId 角色id（拒绝时可空）
  * @param {string} args.remark 备注，拒绝理由
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppApplyStatus: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditAppApplyStatus', args, options);
   },
  /**
  * 获取icon（包含系统和自定义）
  * @param {Object} args 请求参数
  * @param {array} args.fileNames 自定义图标名称
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
  * @param {boolean} args.iconType 图标类型 true-表示系统图标 false-自定义图标
  * @param {array} args.categories 分类数组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getIcon: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetIcon', args, options);
   },
  /**
  * 添加自定义图标
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.data icon数据
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addCustomIcon: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddCustomIcon', args, options);
   },
  /**
  * 删除自定义图标
  * @param {Object} args 请求参数
  * @param {array} args.fileNames 自定义图标名称
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
  * @param {boolean} args.iconType 图标类型 true-表示系统图标 false-自定义图标
  * @param {array} args.categories 分类数组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteCustomIcon: function (args, options = {}) {
     
     return $.api('AppManagement', 'DeleteCustomIcon', args, options);
   },
  /**
  * 获取自定义图标
  * @param {Object} args 请求参数
  * @param {array} args.fileNames 自定义图标名称
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
  * @param {boolean} args.iconType 图标类型 true-表示系统图标 false-自定义图标
  * @param {array} args.categories 分类数组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCustomIconByProject: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetCustomIconByProject', args, options);
   },
  /**
  * 获取分类和首页信息
  * @param {Object} args 请求参数
  * @param {boolean} args.isCategory 是否只加载分类信息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppsCategoryInfo: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppsCategoryInfo', args, options);
   },
  /**
  * 获取分类下应用库模板列表
  * @param {Object} args 请求参数
  * @param {string} args.categoryId 分类id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppsLibraryInfo: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppsLibraryInfo', args, options);
   },
  /**
  * 安装应用
  * @param {Object} args 请求参数
  * @param {string} args.libraryId 应用库id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   installApp: function (args, options = {}) {
     
     return $.api('AppManagement', 'InstallApp', args, options);
   },
  /**
  * 根据关键字搜索已上架的应用库模板
  * @param {Object} args 请求参数
  * @param {string} args.keyword 关键词
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchAppLibrary: function (args, options = {}) {
     
     return $.api('AppManagement', 'SearchAppLibrary', args, options);
   },
  /**
  * 获取单个应用库模板详情
  * @param {Object} args 请求参数
  * @param {string} args.libraryId 应用库id
  * @param {string} args.projectId 网络ud
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppLibraryDetail: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetAppLibraryDetail', args, options);
   },
  /**
  * 获取应用库FileUrl Token
  * @param {Object} args 请求参数
  * @param {string} args.libraryId
  * @param {string} args.projectId 安装目标网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLibraryToken: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetLibraryToken', args, options);
   },
  /**
  * 获取日志
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.keyword 搜索关键字
  * @param {integer} args.handleType 操作类型 1=创建 2=开启 3=关闭 4=删除 5=导出 6=导入
  * @param {string} args.start 开始时间
  * @param {string} args.end 结束时间
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLogs: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetLogs', args, options);
   },
  /**
  * 获取导出记录
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.keyword 搜索关键字
  * @param {integer} args.handleType 操作类型 1=创建 2=开启 3=关闭 4=删除 5=导出 6=导入
  * @param {string} args.start 开始时间
  * @param {string} args.end 结束时间
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExports: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetExports', args, options);
   },
  /**
  * 创建工作流CSM
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorkflow: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddWorkflow', args, options);
   },
  /**
  * 获取应用实体分享信息
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 分享来源id （页面id，图标id等）
  * @param {integer} args.sourceType 分享类型  21 =自定义页面，31 = 图表
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getEntityShare: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetEntityShare', args, options);
   },
  /**
  * 修改应用实体分享信息
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 分享来源id （页面id，图标id等）
  * @param {integer} args.sourceType 分享类型  21 =自定义页面，31 = 图表
  * @param {integer} args.status 状态  0 = 关闭，1 =启用
  * @param {string} args.password 密码
  * @param {string} args.validTime 有效时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editEntityShareStatus: function (args, options = {}) {
     
     return $.api('AppManagement', 'EditEntityShareStatus', args, options);
   },
  /**
  * 获取分享基础信息
  * @param {Object} args 请求参数
  * @param {string} args.id 分享id
  * @param {string} args.password 密码
  * @param {string} args.clientId 客户端id
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getEntityShareById: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetEntityShareById', args, options);
   },
  /**
  * 删除应用备份文件
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.appId 应用id
  * @param {string} args.id 应用备份操作日志Id
  * @param {string} args.fileName 应用备份的文件名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteBackupFile: function (args, options = {}) {
     
     return $.api('AppManagement', 'DeleteBackupFile', args, options);
   },
  /**
  * 分页获取应用备份还原操作日志
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用Id
  * @param {boolean} args.isBackup 是否为获取备份文件列表，true表示获取备份文件列表，false表示获取操作日志列表
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pageGetBackupRestoreOperationLog: function (args, options = {}) {
     
     return $.api('AppManagement', 'PageGetBackupRestoreOperationLog', args, options);
   },
  /**
  * 重命名应用备份文件
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.appId 应用id
  * @param {string} args.id 应用备份操作日志Id
  * @param {string} args.fileName 备份新名称
  * @param {string} args.fileOldName 备份新名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   renameBackupFileName: function (args, options = {}) {
     
     return $.api('AppManagement', 'RenameBackupFileName', args, options);
   },
  /**
  * 获取有效备份文件信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getValidBackupFileInfo: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetValidBackupFileInfo', args, options);
   },
  /**
  * 还原应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用id
  * @param {string} args.id 备份还原操作日志id
  * @param {boolean} args.autoEndMaintain 是否自动结束应用维护状态
  * @param {boolean} args.backupCurrentVersion 备份当前版本
  * @param {boolean} args.isRestoreNew 是否还原为新应用
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   restore: function (args, options = {}) {
     
     return $.api('AppManagement', 'Restore', args, options);
   },
  /**
  * 使用情况统计分析
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.departmentId 部门id
  * @param {boolean} args.depFlag true表示仅当强部门，false表示部门树
  * @param {string} args.appId 应用id
  * @param {integer} args.dayRange 天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
  * @param {string} args.dateDemension &#34;1h&#34;:1小时 &#34;1d&#34;:1天 &#34;1w&#34;:1周 &#34;1M&#34;:1月 &#34;1q&#34;:1季度 &#34;1y&#34;:1年
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   allUsageOverviewStatistics: function (args, options = {}) {
     
     return $.api('AppManagement', 'AllUsageOverviewStatistics', args, options);
   },
  /**
  * 应用汇总概览
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.keyWord 关键字搜索
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {string} args.sortFiled 排序字段
  * @param {boolean} args.sorted 排序方式 true--asc false--desc
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appUsageOverviewStatistics: function (args, options = {}) {
     
     return $.api('AppManagement', 'AppUsageOverviewStatistics', args, options);
   },
  /**
  * 不同维度使用情况统计(按应用，按成员)
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {integer} args.dayRange 天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.dimension 维度 1-应用 2-用户
  * @param {string} args.sortFiled 排序字段（返回结果的列名，例如:appAccess）
  * @param {boolean} args.sorted 排序方式
  * @param {string} args.keyword 关键词查询
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   usageStatisticsForDimension: function (args, options = {}) {
     
     return $.api('AppManagement', 'UsageStatisticsForDimension', args, options);
   },
  /**
  * 获取应用日志
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {} args.queryType 应用日志查询类型,默认不传查询所有
  * @param {array} args.operators 操作人id数组
  * @param {array} args.appIds 应用id数组
  * @param {array} args.worksheetIds 工作表id数组
  * @param {array} args.modules 所属日志模块
  * @param {array} args.operationTypes 操作类型
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {array} args.columnNames 列名称
  * @param {string} args.menuName 菜单名称
  * @param {string} args.startDateTime 开始时间
  * @param {string} args.endDateTime 结束时间
  * @param {boolean} args.confirmExport 是否确认导出(超量的情况下传)
  * @param {boolean} args.isSingle 是否是单个应用
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGlobalLogs: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetGlobalLogs', args, options);
   },
  /**
  * 获取应用下工作表信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {array} args.appIds 应用ids
  * @param {boolean} args.isFilterCustomPage 是否过滤自定义页面
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetsUnderTheApp: function (args, options = {}) {
     
     return $.api('AppManagement', 'GetWorksheetsUnderTheApp', args, options);
   },
  /**
  * 开启密码锁
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.password
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addLock: function (args, options = {}) {
     
     return $.api('AppManagement', 'AddLock', args, options);
   },
};
