# Read-only policy report

- gateway: https://api-gateway.osinfra.cn
- community: openeuler
- generated: 2026-10-18T04:01:42.774Z

## pkgcontrib (13)

| operation                            | method | read | reason        | summary                |
| ------------------------------------ | ------ | ---- | ------------- | ---------------------- |
| `listSigs`                           | GET    | ✅   | safe-method   | 获取 SIG 列表          |
| `listSoftwarePackages`               | GET    | ✅   | safe-method   | 获取软件包列表         |
| `applyNewSoftwarePackage`            | POST   | ⛔   | write-keyword | 提交软件包申请         |
| `getSoftwarePackage`                 | GET    | ✅   | safe-method   | 获取软件包详情         |
| `updateSoftwarePackageApplication`   | PUT    | ⛔   | write-keyword | 更新软件包申请         |
| `closeSoftwarePackage`               | PUT    | ⛔   | write-keyword | 关闭软件包申请         |
| `getSoftwarePackageApplyInfo`        | GET    | ✅   | safe-method   | 获取软件包申请统计信息 |
| `checkSoftwarePackageCommitters`     | POST   | ✅   | read-keyword  | 检查 Committer 权限    |
| `rerunSoftwarePackageCi`             | PUT    | ⛔   | ambiguous     | 重新运行 CI 检查       |
| `getSoftwarePackageUserReview`       | GET    | ✅   | safe-method   | 获取当前用户的评审信息 |
| `reviewSoftwarePackage`              | POST   | ✅   | read-keyword  | 提交评审意见           |
| `listSoftwarePackageReviewComments`  | GET    | ✅   | safe-method   | 获取评审评论列表       |
| `createSoftwarePackageReviewComment` | POST   | ⛔   | write-keyword | 发表评审评论           |

## search (7)

| operation                 | method | read | reason       | summary          |
| ------------------------- | ------ | ---- | ------------ | ---------------- |
| `searchSoftwareByKeyword` | POST   | ✅   | read-keyword | 软件包搜索       |
| `searchAllByKeyword`      | POST   | ✅   | read-keyword | 软件包全量搜索   |
| `searchSigByKeyword`      | POST   | ✅   | read-keyword | SIG 文档搜索     |
| `multisearchDocByKeyword` | POST   | ✅   | read-keyword | 文档多路召回搜索 |
| `searchDocByKeyword`      | POST   | ✅   | read-keyword | 文档全文搜索     |
| `searchSigName`           | GET    | ✅   | safe-method  | 查询 SIG 名称    |
| `searchAllSoftwareData`   | GET    | ✅   | safe-method  | 查询全部数据     |

## cve (37)

| operation                                      | method | read | reason       | summary                            |
| ---------------------------------------------- | ------ | ---- | ------------ | ---------------------------------- |
| `findAllCVEDatabase`                           | POST   | ✅   | read-keyword | 查询CVE数据库列表                  |
| `getCVEDatabaseByCveId`                        | GET    | ✅   | safe-method  | 根据CVE ID查询CVE信息              |
| `getCVEDatabaseByCveIdAndPackageName`          | GET    | ✅   | safe-method  | 根据CVE ID和包名查询CVE信息        |
| `getKernelCVEList`                             | GET    | ✅   | safe-method  | 查询内核CVE列表                    |
| `getCVEProductPackageList`                     | GET    | ✅   | safe-method  | 查询CVE产品包列表                  |
| `getCVEProductPackageListByDate`               | GET    | ✅   | safe-method  | 根据日期查询CVE产品包列表          |
| `getPackageListByCveId`                        | GET    | ✅   | safe-method  | 根据CVE ID查询产品包列表           |
| `downloadUnfixedCVEList`                       | GET    | ✅   | safe-method  | 下载未修复CVE列表                  |
| `getHotPatchList`                              | GET    | ✅   | safe-method  | 查询热补丁列表                     |
| `findAllDriverCompatibility`                   | POST   | ✅   | read-keyword | 查询驱动兼容性列表                 |
| `getDriverCompatibilityArchitectureList`       | GET    | ✅   | safe-method  | 获取驱动兼容性架构列表             |
| `getDriverCompatibilityOSList`                 | GET    | ✅   | safe-method  | 获取驱动兼容性操作系统列表         |
| `getDriverTypeList`                            | GET    | ✅   | safe-method  | 获取驱动类型列表                   |
| `findAllHardwareCompatibility`                 | POST   | ✅   | read-keyword | 查询硬件兼容性列表                 |
| `getHardwareAdapterList`                       | GET    | ✅   | safe-method  | 根据硬件ID查询适配器列表           |
| `getHardwareCompatibilityArchitectureList`     | GET    | ✅   | safe-method  | 获取硬件兼容性架构列表             |
| `getHardwareCompatibilityCPUList`              | GET    | ✅   | safe-method  | 获取CPU列表                        |
| `getHardwareCompatibilityOSList`               | GET    | ✅   | safe-method  | 获取硬件兼容性操作系统列表         |
| `getHardwareCompatibilityById`                 | GET    | ✅   | safe-method  | 根据ID查询硬件兼容性信息           |
| `findAllOSVCertification`                      | POST   | ✅   | read-keyword | 查询OSV认证列表                    |
| `getOSVCertificationById`                      | GET    | ✅   | safe-method  | 根据ID查询OSV认证信息              |
| `getOSVNameList`                               | GET    | ✅   | safe-method  | 获取OSV名称列表                    |
| `getOSVTypeList`                               | GET    | ✅   | safe-method  | 获取OSV类型列表                    |
| `getSecurityNoticeByCveIdAndAffectedComponent` | GET    | ✅   | safe-method  | 根据CVE ID和受影响组件查询安全公告 |
| `findAllSecurityNotice`                        | POST   | ✅   | read-keyword | 查询安全公告列表                   |
| `getAffectedComponentList`                     | GET    | ✅   | safe-method  | 获取受影响组件列表                 |
| `getAffectedProductList`                       | GET    | ✅   | safe-method  | 获取受影响产品列表                 |
| `getSecurityNoticeByCveId`                     | GET    | ✅   | safe-method  | 根据CVE ID查询安全公告             |
| `getSecurityNoticeByNoticeNo`                  | GET    | ✅   | safe-method  | 根据安全公告编号查询安全公告       |
| `getMaxHotPatchId`                             | GET    | ✅   | safe-method  | 获取最大热补丁ID                   |
| `getMaxSecurityNoticeId`                       | GET    | ✅   | safe-method  | 获取最大安全公告ID                 |
| `getSecurityNoticePackageLink`                 | POST   | ✅   | read-keyword | 根据包名查询安全公告包信息         |
| `getPublishedBugList`                          | GET    | ✅   | safe-method  | 获取已发布的Bug列表                |
| `findAllSolutionCompatibility`                 | POST   | ✅   | read-keyword | 查询解决方案兼容性列表             |
| `getSolutionCertificationTypeList`             | GET    | ✅   | safe-method  | 获取认证类型列表                   |
| `getSolutionCompatibilityById`                 | GET    | ✅   | safe-method  | 根据ID查询解决方案兼容性信息       |
| `getSolutionList`                              | GET    | ✅   | safe-method  | 获取解决方案列表                   |

## meeting (14)

| operation             | method | read | reason        | summary                   |
| --------------------- | ------ | ---- | ------------- | ------------------------- |
| `listWebMeetings`     | GET    | ✅   | safe-method   | 会议列表                  |
| `createWebMeeting`    | POST   | ⛔   | write-keyword | 预定会议                  |
| `getWebMeeting`       | GET    | ✅   | safe-method   | 查询单个会议              |
| `updateWebMeeting`    | PUT    | ⛔   | write-keyword | 修改会议                  |
| `deleteWebMeeting`    | DELETE | ⛔   | write-keyword | 删除会议                  |
| `listWebPlatforms`    | GET    | ✅   | safe-method   | 获取会议平台              |
| `getWebGroupInfo`     | GET    | ✅   | safe-method   | 获取会议群组信息          |
| `listWebGroupNames`   | GET    | ✅   | safe-method   | 获取会议群组名称          |
| `updateWebSubMeeting` | PUT    | ⛔   | write-keyword | 修改周期子会议            |
| `deleteWebSubMeeting` | DELETE | ⛔   | write-keyword | 删除周期子会议            |
| `getMeetingDate`      | GET    | ✅   | safe-method   | 获取会议日期（官网）      |
| `listMeetings`        | GET    | ✅   | safe-method   | 获取会议数据（官网）      |
| `listSigMeetings`     | GET    | ✅   | safe-method   | 分页 SIG 会议数据（官网） |
| `listGroupNames`      | GET    | ✅   | safe-method   | 获取会议群组名称          |

## forum (40)

| operation                          | method | read | reason        | summary                                               |
| ---------------------------------- | ------ | ---- | ------------- | ----------------------------------------------------- |
| `listEvents`                       | GET    | ✅   | safe-method   | List calendar events                                  |
| `exportEventsICS`                  | GET    | ✅   | safe-method   | Export calendar events in iCalendar format            |
| `listCategories`                   | GET    | ✅   | safe-method   | Retrieves a list of categories                        |
| `listCategoryTopics`               | GET    | ✅   | safe-method   | List topics                                           |
| `getCategory`                      | GET    | ✅   | safe-method   | Show category                                         |
| `getGroup`                         | GET    | ✅   | safe-method   | Get a group                                           |
| `getGroupById`                     | GET    | ✅   | safe-method   | Get a group by id                                     |
| `listGroupMembers`                 | GET    | ✅   | safe-method   | List group members                                    |
| `listGroups`                       | GET    | ✅   | safe-method   | List groups                                           |
| `getNotifications`                 | GET    | ✅   | safe-method   | Get the notifications that belong to the current user |
| `markNotificationsAsRead`          | PUT    | ⛔   | write-keyword | Mark notifications as read                            |
| `listPosts`                        | GET    | ✅   | safe-method   | List latest posts across topics                       |
| `createTopicPostPM`                | POST   | ⛔   | write-keyword | Creates a new topic, a new post, or a private message |
| `getPost`                          | GET    | ✅   | safe-method   | Retrieve a single post                                |
| `updatePost`                       | PUT    | ⛔   | write-keyword | Update a single post                                  |
| `postReplies`                      | GET    | ✅   | safe-method   | List replies to a post                                |
| `performPostAction`                | POST   | ⛔   | ambiguous     | Like a post and other actions                         |
| `listUserPrivateMessages`          | GET    | ✅   | safe-method   | Get a list of private messages for a user             |
| `getUserSentPrivateMessages`       | GET    | ✅   | safe-method   | Get a list of private messages sent for a user        |
| `search`                           | GET    | ✅   | safe-method   | Search for a term                                     |
| `getSite`                          | GET    | ✅   | safe-method   | Get site info                                         |
| `getSiteBasicInfo`                 | GET    | ✅   | safe-method   | Get site basic info                                   |
| `listTagGroups`                    | GET    | ✅   | safe-method   | Get a list of tag groups                              |
| `getTagGroup`                      | GET    | ✅   | safe-method   | Get a single tag group                                |
| `listTags`                         | GET    | ✅   | safe-method   | Get a list of tags                                    |
| `getTag`                           | GET    | ✅   | safe-method   | Get a specific tag                                    |
| `getSpecificPostsFromTopic`        | GET    | ✅   | safe-method   | Get specific posts from a topic                       |
| `getTopic`                         | GET    | ✅   | safe-method   | Get a single topic                                    |
| `bookmarkTopic`                    | PUT    | ⛔   | write-keyword | Bookmark topic                                        |
| `listLatestTopics`                 | GET    | ✅   | safe-method   | Get the latest topics                                 |
| `listTopTopics`                    | GET    | ✅   | safe-method   | Get the top topics filtered by period                 |
| `setNotificationLevel`             | POST   | ⛔   | ambiguous     | Set notification level                                |
| `getTopicByExternalId`             | GET    | ✅   | safe-method   | Get topic by external_id                              |
| `getUser`                          | GET    | ✅   | safe-method   | Get a single user by username                         |
| `getUserExternalId`                | GET    | ✅   | safe-method   | Get a user by external_id                             |
| `getUserIdentiyProviderExternalId` | GET    | ✅   | safe-method   | Get a user by identity provider external ID           |
| `updateAvatar`                     | PUT    | ⛔   | write-keyword | Update avatar                                         |
| `updateEmail`                      | PUT    | ⛔   | write-keyword | Update email                                          |
| `updateUsername`                   | PUT    | ⛔   | write-keyword | Update username                                       |
| `listUsersPublic`                  | GET    | ✅   | safe-method   | Get a public list of users                            |

## mailman (11)

| operation                  | method | read | reason      | summary                  |
| -------------------------- | ------ | ---- | ----------- | ------------------------ |
| `retrieveMailinglist`      | GET    | ✅   | safe-method | 查询单个邮件列表         |
| `retrieveEmail`            | GET    | ✅   | safe-method | 查询单封邮件             |
| `listEmails`               | GET    | ✅   | safe-method | 查询邮件列表中的邮件     |
| `retrieveThread`           | GET    | ✅   | safe-method | 查询单个讨论线程         |
| `listThreadEmails`         | GET    | ✅   | safe-method | 查询讨论线程中的邮件     |
| `listThreads`              | GET    | ✅   | safe-method | 查询邮件列表中的讨论线程 |
| `listMailinglists`         | GET    | ✅   | safe-method | 查询邮件列表             |
| `listEmailsBySender`       | GET    | ✅   | safe-method | 按发送者查询邮件         |
| `getHeldMessage`           | GET    | ✅   | safe-method | 获取待审邮件             |
| `getHeldMessageAttachment` | GET    | ✅   | safe-method | 获取待审邮件附件         |
| `getTemplate`              | GET    | ✅   | safe-method | 获取邮件模板             |

## etherpad (26)

| operation                | method | read | reason       | summary                         |
| ------------------------ | ------ | ---- | ------------ | ------------------------------- |
| `listPads`               | GET    | ✅   | safe-method  | 列出组中的所有 pad              |
| `listPadsOfAuthor`       | GET    | ✅   | safe-method  | listPadsOfAuthor                |
| `getSessionInfo`         | GET    | ✅   | safe-method  | getSessionInfo                  |
| `listSessionsOfGroup`    | GET    | ✅   | safe-method  | 列出组中的所有会话              |
| `getText`                | GET    | ✅   | safe-method  | getText                         |
| `getHTML`                | GET    | ✅   | safe-method  | 获取 pad 的 HTML                |
| `getRevisionsCount`      | GET    | ✅   | safe-method  | 获取 pad 的修订次数             |
| `getLastEdited`          | GET    | ✅   | safe-method  | 获取 pad 最近一次修订的时间戳   |
| `getReadOnlyID`          | GET    | ✅   | safe-method  | 获取 pad 的只读 id              |
| `getPublicStatus`        | GET    | ✅   | safe-method  | 获取 pad 的公开状态             |
| `listAuthorsOfPad`       | GET    | ✅   | safe-method  | 获取 pad 的作者                 |
| `padUsersCount`          | GET    | ✅   | safe-method  | 获取当前正在编辑 pad 的用户数量 |
| `getAuthorName`          | GET    | ✅   | safe-method  | 获取作者名称                    |
| `padUsers`               | GET    | ✅   | safe-method  | 获取当前正在编辑 pad 的用户     |
| `listAllGroups`          | GET    | ✅   | safe-method  | 列出所有组                      |
| `listAllPads`            | GET    | ✅   | safe-method  | 列出所有 pad                    |
| `getChatHistory`         | GET    | ✅   | safe-method  | 获取 pad 的聊天历史             |
| `getChatHead`            | GET    | ✅   | safe-method  | 获取 pad 的 chatHead            |
| `getAttributePool`       | GET    | ✅   | safe-method  | 获取 pad 的属性池               |
| `getRevisionChangeset`   | GET    | ✅   | safe-method  | 获取 pad 某次修订的 changeset   |
| `listSavedRevisions`     | GET    | ✅   | safe-method  | 列出 pad 的所有已保存修订       |
| `getSavedRevisionsCount` | GET    | ✅   | safe-method  | 获取 pad 的已保存修订数量       |
| `getStats`               | GET    | ✅   | safe-method  | 获取统计信息                    |
| `sendClientsMessage`     | POST   | ⛔   | ambiguous    | 向 pad 的所有客户端发送消息     |
| `getPadID`               | POST   | ✅   | read-keyword | 获取 pad 的 id                  |
| `appendChatMessage`      | PATCH  | ⛔   | ambiguous    | 向 pad 追加聊天消息             |

## eur (52)

| operation                     | method | read | reason        | summary                             |
| ----------------------------- | ------ | ---- | ------------- | ----------------------------------- |
| `getBuild`                    | GET    | ✅   | safe-method   | 查询构建详情                        |
| `getPackage`                  | GET    | ✅   | safe-method   | 查询包详情                          |
| `createPackage`               | POST   | ⛔   | write-keyword | 创建包                              |
| `editPackage`                 | POST   | ⛔   | write-keyword | 编辑包（来源类型由 query 参数指定） |
| `editPackageBySourceType`     | POST   | ⛔   | write-keyword | 编辑包（来源类型由路径参数指定）    |
| `getProjectChroot`            | GET    | ✅   | safe-method   | 查询项目 chroot 设置                |
| `getBuildConfig`              | GET    | ✅   | safe-method   | 获取构建配置                        |
| `getBuildChroot`              | GET    | ✅   | safe-method   | 查询构建 chroot 详情                |
| `getBuildChrootConfig`        | GET    | ✅   | safe-method   | 获取构建 chroot 配置                |
| `getBuildChrootConfigByPath`  | GET    | ✅   | safe-method   | 获取构建 chroot 配置                |
| `getBuildChrootBuiltPackages` | GET    | ✅   | safe-method   | 获取构建 chroot 已构建包列表        |
| `listBuildChroots`            | GET    | ✅   | safe-method   | 列出构建 chroot                     |
| `listBuildChrootsByBuildId`   | GET    | ✅   | safe-method   | 列出构建 chroot                     |
| `getBuildChrootByPath`        | GET    | ✅   | safe-method   | 查询构建 chroot 详情                |
| `getBuildBuiltPackages`       | GET    | ✅   | safe-method   | 获取构建已产出包列表                |
| `cancelBuild`                 | PUT    | ⛔   | write-keyword | 取消构建                            |
| `checkBeforeBuild`            | POST   | ⛔   | write-keyword | 提交构建前预检                      |
| `createBuildFromCustom`       | POST   | ⛔   | write-keyword | 通过自定义脚本提交构建              |
| `createBuildFromDistgit`      | POST   | ⛔   | write-keyword | 通过 dist-git 提交构建              |
| `createBuildFromPypi`         | POST   | ⛔   | write-keyword | 通过 PyPI 提交构建                  |
| `createBuildFromRubygems`     | POST   | ⛔   | write-keyword | 通过 RubyGems 提交构建              |
| `createBuildFromScm`          | POST   | ⛔   | write-keyword | 通过 SCM 提交构建                   |
| `createBuildFromUpload`       | POST   | ⛔   | write-keyword | 通过上传 SRPM 提交构建              |
| `createBuildFromUrl`          | POST   | ⛔   | write-keyword | 通过 URL 提交构建                   |
| `deleteBuilds`                | POST   | ⛔   | write-keyword | 批量删除构建                        |
| `deleteBuild`                 | DELETE | ⛔   | write-keyword | 删除构建                            |
| `listBuilds`                  | GET    | ✅   | safe-method   | 列出项目构建记录                    |
| `getBuildSourceConfig`        | GET    | ✅   | safe-method   | 获取 source chroot 构建配置         |
| `getBuildSourceChroot`        | GET    | ✅   | safe-method   | 获取 source chroot 详情             |
| `listMockChroots`             | GET    | ✅   | safe-method   | 列出可用 mock chroot                |
| `buildModule`                 | POST   | ⛔   | write-keyword | 构建模块                            |
| `monitorPackages`             | GET    | ✅   | safe-method   | 监控项目包构建状态                  |
| `buildPackage`                | POST   | ⛔   | write-keyword | 对指定包发起构建                    |
| `deletePackage`               | DELETE | ⛔   | write-keyword | 删除软件包                          |
| `listPackages`                | GET    | ✅   | safe-method   | 列出项目软件包                      |
| `resetPackage`                | PUT    | ⛔   | write-keyword | 重置包来源配置                      |
| `getProject`                  | GET    | ✅   | safe-method   | 查询项目详情                        |
| `editProjectChroot`           | PUT    | ⛔   | write-keyword | 编辑项目 chroot 设置                |
| `deleteProject`               | DELETE | ⛔   | write-keyword | 删除项目                            |
| `editProject`                 | PUT    | ⛔   | write-keyword | 编辑项目设置                        |
| `forkProject`                 | PUT    | ⛔   | write-keyword | Fork 项目                           |
| `listProjects`                | GET    | ✅   | safe-method   | 列出项目                            |
| `checkBuildPermission`        | GET    | ✅   | safe-method   | 查询用户构建权限                    |
| `getProjectPermissions`       | GET    | ✅   | safe-method   | 获取项目权限列表                    |
| `requestProjectPermission`    | PUT    | ⛔   | ambiguous     | 申请项目构建权限                    |
| `setProjectPermissions`       | PUT    | ⛔   | ambiguous     | 设置项目用户权限                    |
| `regenerateProjectRepos`      | PUT    | ⛔   | ambiguous     | 重新生成项目仓库元数据              |
| `searchProjects`              | GET    | ✅   | safe-method   | 搜索项目                            |
| `getRpmrepoMetadata`          | GET    | ✅   | safe-method   | 获取 RPM 仓库元数据                 |
| `generateWebhookSecret`       | POST   | ⛔   | ambiguous     | 生成 webhook secret                 |
| `addOpeneulerPackageByGroup`  | GET    | ✅   | safe-method   | 引包到 openEuler 社区（组项目）     |
| `addOpeneulerPackage`         | GET    | ✅   | safe-method   | 引包到 openEuler 社区（用户项目）   |

## quickissue (19)

| operation             | method | read | reason        | summary                        |
| --------------------- | ------ | ---- | ------------- | ------------------------------ |
| `listLabelColors`     | GET    | ✅   | safe-method   | 标签颜色查询                   |
| `listIssues`          | GET    | ✅   | safe-method   | Issue 列表查询                 |
| `listIssueAssignees`  | GET    | ✅   | safe-method   | Issue 指派者枚举               |
| `listIssueAuthors`    | GET    | ✅   | safe-method   | Issue 提交者枚举               |
| `listIssueBranches`   | GET    | ✅   | safe-method   | Issue 分支枚举                 |
| `listIssueLabels`     | GET    | ✅   | safe-method   | Issue 标签枚举                 |
| `listIssueMilestones` | GET    | ✅   | safe-method   | Issue 里程碑枚举               |
| `listIssueTypes`      | GET    | ✅   | safe-method   | Issue 类型查询                 |
| `createIssue`         | POST   | ⛔   | write-keyword | 提交新 Issue                   |
| `listPulls`           | GET    | ✅   | safe-method   | Pull Request 列表查询          |
| `listPullAssignees`   | GET    | ✅   | safe-method   | PR 指派者枚举                  |
| `listPullAuthors`     | GET    | ✅   | safe-method   | PR 提交者枚举                  |
| `listPullLabels`      | GET    | ✅   | safe-method   | PR 标签枚举                    |
| `listPullRefs`        | GET    | ✅   | safe-method   | PR 目标分支枚举                |
| `listPullRepos`       | GET    | ✅   | safe-method   | PR 仓库枚举                    |
| `listPullSigs`        | GET    | ✅   | safe-method   | PR SIG 组枚举                  |
| `listRepos`           | GET    | ✅   | safe-method   | 仓库列表查询                   |
| `sendVerifyCode`      | POST   | ⛔   | ambiguous     | 校验图形验证码并发送邮箱验证码 |
| `getCaptcha`          | GET    | ✅   | safe-method   | 获取图形验证码                 |

## easysoftware (15)

| operation                 | method | read | reason      | summary                                |
| ------------------------- | ------ | ---- | ----------- | -------------------------------------- |
| `searchRPMPkg`            | GET    | ✅   | safe-method | 关键字搜索 RPM 软件包                  |
| `queryRpmVersion`         | GET    | ✅   | safe-method | 按类型/OS 分页查询 RPM 版本聚合列表    |
| `queryRpmEulerVersions`   | GET    | ✅   | safe-method | 查询指定 RPM 包支持的 openEuler 版本   |
| `searchOepkg`             | GET    | ✅   | safe-method | 关键字搜索 oepkg 软件包                |
| `queryOepkgEulerVersions` | GET    | ✅   | safe-method | 查询指定 oepkg 包支持的 openEuler 版本 |
| `searchEpkgPkg`           | GET    | ✅   | safe-method | 关键字搜索 EPKG 软件包                 |
| `queryEpkgEulerVersions`  | GET    | ✅   | safe-method | 查询指定 EPKG 包支持的 openEuler 版本  |
| `searchCondaPkg`          | GET    | ✅   | safe-method | 关键字搜索 Conda 软件包                |
| `queryCondaEulerVersions` | GET    | ✅   | safe-method | 查询指定 Conda 包支持的 openEuler 版本 |
| `queryAppPkgDetail`       | GET    | ✅   | safe-method | 根据 pkgId 查询应用软件包详情          |
| `queryAppPkgByTags`       | GET    | ✅   | safe-method | 按标签查询应用软件包                   |
| `queryAppEulerVersions`   | GET    | ✅   | safe-method | 查询指定应用包支持的 openEuler 版本    |
| `queryAppVersion`         | GET    | ✅   | safe-method | 分页查询应用版本列表                   |
| `checkVersionPermission`  | GET    | ✅   | safe-method | 检查当前用户版本模块访问权限           |
| `queryAppVersionColumn`   | GET    | ✅   | safe-method | 查询应用版本列字段去重值               |

## ag (120)

| operation                             | method | read | reason        | summary                             |
| ------------------------------------- | ------ | ---- | ------------- | ----------------------------------- |
| `createOrgRepo`                       | POST   | ⛔   | write-keyword | 创建仓库                            |
| `getRepoTree`                         | GET    | ✅   | safe-method   | 获取仓库目录Tree                    |
| `getRepoContents`                     | GET    | ✅   | safe-method   | 获取仓库具体路径下的内容            |
| `createRepoFile`                      | POST   | ⛔   | write-keyword | 新建文件                            |
| `updateRepoFile`                      | PUT    | ⛔   | write-keyword | 更新文件                            |
| `deleteRepoFile`                      | DELETE | ⛔   | write-keyword | 删除文件                            |
| `listRepoFiles`                       | GET    | ✅   | safe-method   | 获取文件列表                        |
| `getRepoBlob`                         | GET    | ✅   | safe-method   | 获取文件Blob                        |
| `listRepoLanguages`                   | GET    | ✅   | safe-method   | 获取仓库的语言                      |
| `listRepoContributors`                | GET    | ✅   | safe-method   | 获取仓库贡献者                      |
| `updateRepoModuleSetting`             | PUT    | ⛔   | write-keyword | 设置项目模块                        |
| `updateRepo`                          | PATCH  | ⛔   | write-keyword | 更新仓库设置                        |
| `deleteRepo`                          | DELETE | ⛔   | write-keyword | 删除一个仓库                        |
| `updateRepoReviewerSetting`           | PUT    | ⛔   | write-keyword | 修改项目代码审查设置                |
| `archiveRepo`                         | PUT    | ⛔   | write-keyword | 仓库归档                            |
| `transferOrgRepo`                     | POST   | ⛔   | write-keyword | 转移仓                              |
| `getRepoPermissionMode`               | GET    | ✅   | safe-method   | 获取项目的权限模式                  |
| `updateRepoPermissionMode`            | PUT    | ⛔   | write-keyword | 更新仓库的权限模式                  |
| `updateRepoPushConfig`                | PUT    | ⛔   | write-keyword | 设置项目推送规则                    |
| `getRepoPushConfig`                   | GET    | ✅   | safe-method   | 获取项目推送规则                    |
| `forkRepo`                            | POST   | ⛔   | write-keyword | Fork一个仓库                        |
| `listRepoForks`                       | GET    | ✅   | safe-method   | 查看仓库的Forks                     |
| `uploadRepoImage`                     | POST   | ⛔   | write-keyword | 上传图片                            |
| `uploadRepoFile`                      | POST   | ⛔   | write-keyword | 上传文件                            |
| `listRepoSubscribers`                 | GET    | ✅   | safe-method   | 列出 watch 了仓库的用户             |
| `listRepoStargazers`                  | GET    | ✅   | safe-method   | 列出 star 了仓库的用户              |
| `updateRepoSettings`                  | PUT    | ⛔   | write-keyword | 更新仓库设置                        |
| `getRepoSettings`                     | GET    | ✅   | safe-method   | 获取仓库设置                        |
| `getRepoPullRequestSettings`          | GET    | ✅   | safe-method   | 获取 Pull Request设置               |
| `updateRepoPullRequestSettings`       | PUT    | ⛔   | write-keyword | 更新 Pull Request设置               |
| `updateRepoMemberRole`                | PUT    | ⛔   | write-keyword | 更新项目成员角色                    |
| `transferRepo`                        | POST   | ⛔   | write-keyword | 仓库转移                            |
| `listRepoCustomizedRoles`             | GET    | ✅   | safe-method   | 获取项目自定义角色                  |
| `getRepoDownloadStatistics`           | GET    | ✅   | safe-method   | 下载次数统计                        |
| `getRepoRawFile`                      | GET    | ✅   | safe-method   | 获取 raw 文件                       |
| `getRepoContributorStatistics`        | GET    | ✅   | safe-method   | 获取仓库贡献者统计信息              |
| `listRepoEvents`                      | GET    | ✅   | safe-method   | 获取仓库动态                        |
| `listRepoCommits`                     | GET    | ✅   | safe-method   | 获取仓库所有提交                    |
| `getRepoCommit`                       | GET    | ✅   | safe-method   | 仓库的某个提交                      |
| `compareRepoCommits`                  | GET    | ✅   | safe-method   | Commits对比                         |
| `createCommitComment`                 | POST   | ⛔   | write-keyword | 创建commit评论                      |
| `deleteCommitComment`                 | DELETE | ⛔   | write-keyword | 删除commit评论                      |
| `getCommitComment`                    | GET    | ✅   | safe-method   | 获取仓库的某条Commit评论            |
| `updateCommitComment`                 | PATCH  | ⛔   | write-keyword | 更新Commit评论                      |
| `listRepoCommitComments`              | GET    | ✅   | safe-method   | 获取仓库的Commit评论                |
| `getRepoCommitStatistics`             | GET    | ✅   | safe-method   | 获取代码量贡献                      |
| `listCommitComments`                  | GET    | ✅   | safe-method   | 获取单个commit评论                  |
| `getCommitDiff`                       | GET    | ✅   | safe-method   | 获取commit的diff                    |
| `getCommitPatch`                      | GET    | ✅   | safe-method   | 获取commit的patch                   |
| `createIssue`                         | POST   | ⛔   | write-keyword | 创建Issue                           |
| `updateIssue`                         | PATCH  | ⛔   | write-keyword | 更新Issue                           |
| `getRepoIssue`                        | GET    | ✅   | safe-method   | 获取仓库的某个Issue                 |
| `listRepoIssues`                      | GET    | ✅   | safe-method   | 获取仓库所有 issues                 |
| `listIssueComments`                   | GET    | ✅   | safe-method   | 获取仓库某个Issue所有的评论         |
| `createIssueComment`                  | POST   | ⛔   | write-keyword | 创建Issue评论                       |
| `listRepoIssueComments`               | GET    | ✅   | safe-method   | 获取仓库所有 Issue 评论             |
| `listIssuePullRequests`               | GET    | ✅   | safe-method   | 获取 issue 关联的 pull requests     |
| `addIssueLabels`                      | POST   | ⛔   | ambiguous     | 创建Issue标签                       |
| `deleteIssueLabel`                    | DELETE | ⛔   | write-keyword | 删除Issue标签                       |
| `listIssueOperateLogs`                | GET    | ✅   | safe-method   | 获取某个issue下的操作日志           |
| `listEnterpriseIssues`                | GET    | ✅   | safe-method   | 获取某个企业的所有Issues            |
| `listAuthenticatedUserIssues`         | GET    | ✅   | safe-method   | 获取授权用户的所有Issues            |
| `updateIssueComment`                  | PATCH  | ⛔   | write-keyword | 更新Issue某条评论                   |
| `deleteIssueComment`                  | DELETE | ⛔   | write-keyword | 删除Issue某条评论                   |
| `getIssueComment`                     | GET    | ✅   | safe-method   | 获取仓库Issue某条评论               |
| `listOrgIssues`                       | GET    | ✅   | safe-method   | 获取当前用户某个组织的Issues        |
| `listEnterpriseIssueComments`         | GET    | ✅   | safe-method   | 获取企业某个Issue所有评论           |
| `getEnterpriseIssue`                  | GET    | ✅   | safe-method   | 获取企业的某个Issue                 |
| `listEnterpriseIssueLabels`           | GET    | ✅   | safe-method   | 获取企业某个Issue所有标签           |
| `listEnterpriseIssueStatuses`         | GET    | ✅   | safe-method   | 获取企业issue状态                   |
| `listIssueRelatedBranches`            | GET    | ✅   | safe-method   | 获取issue关联的分支列表             |
| `updateIssueRelatedBranches`          | PUT    | ⛔   | write-keyword | 设置Issue关联的分支                 |
| `listIssueReactions`                  | GET    | ✅   | safe-method   | 获取issue的表态列表                 |
| `listIssueCommentReactions`           | GET    | ✅   | safe-method   | 获取issue评论的表态列表             |
| `listIssueModifyHistory`              | GET    | ✅   | safe-method   | 获取issue的修改历史                 |
| `listIssueCommentModifyHistory`       | GET    | ✅   | safe-method   | 获取issue评论的修改历史             |
| `removePullRequestTesters`            | DELETE | ⛔   | write-keyword | 取消用户测试Pull Request            |
| `resetPullRequestTesters`             | PATCH  | ⛔   | write-keyword | 重置 Pull Request测试 的状态        |
| `assignPullRequestTesters`            | POST   | ⛔   | write-keyword | 指派用户测试 Pull Request           |
| `listRepoPullRequests`                | GET    | ✅   | safe-method   | 获取项目Pull Request列表            |
| `createPullRequest`                   | POST   | ⛔   | write-keyword | 创建Pull Request                    |
| `mergePullRequest`                    | PUT    | ⛔   | write-keyword | 合并Pull Request                    |
| `checkPullRequestMerged`              | GET    | ✅   | safe-method   | 判断Pull Request是否合并            |
| `listPullRequestIssues`               | GET    | ✅   | safe-method   | 获取pr关联的issue                   |
| `linkPullRequestIssue`                | POST   | ⛔   | ambiguous     | Pull Request关联issue               |
| `unlinkPullRequestIssue`              | DELETE | ⛔   | ambiguous     | Pull Request删除关联的issue         |
| `createPullRequestComment`            | POST   | ⛔   | write-keyword | 提交pull request 评论               |
| `listPullRequestComments`             | GET    | ✅   | safe-method   | 获取某个Pull Request的所有评论      |
| `listPullRequestFiles`                | GET    | ✅   | safe-method   | Pull Request Commit文件列表         |
| `updatePullRequest`                   | PATCH  | ⛔   | write-keyword | 更新Pull Request信息                |
| `getPullRequest`                      | GET    | ✅   | safe-method   | 获取单个Pull Request                |
| `listPullRequestCommits`              | GET    | ✅   | safe-method   | 获取某Pull Request的所有Commit信息  |
| `addPullRequestLabels`                | POST   | ⛔   | ambiguous     | 创建 Pull Request标签               |
| `listPullRequestLabels`               | GET    | ✅   | safe-method   | 获取某个 Pull Request的所有标签     |
| `replacePullRequestLabels`            | PUT    | ⛔   | ambiguous     | 替换 Pull Request所有标签           |
| `replyPullRequestComment`             | POST   | ⛔   | write-keyword | 回复Pull Request评论                |
| `deletePullRequestLabel`              | DELETE | ⛔   | write-keyword | 删除 Pull Request标签               |
| `updatePullRequestReviewCommentState` | PUT    | ⛔   | write-keyword | 修改检视意见解决状态                |
| `handlePullRequestTest`               | POST   | ⛔   | ambiguous     | 处理 Pull Request测试               |
| `handlePullRequestReview`             | POST   | ✅   | read-keyword  | 处理 Pull Request审查               |
| `listPullRequestOperateLogs`          | GET    | ✅   | safe-method   | 获取某个Pull Request的操作日志      |
| `assignPullRequestReviewers`          | POST   | ⛔   | write-keyword | 指派用户评审Pull Request            |
| `removePullRequestReviewers`          | DELETE | ⛔   | write-keyword | 取消用户评审Pull Request            |
| `resetPullRequestAssignees`           | PATCH  | ⛔   | write-keyword | 重置 Pull Request审查 的状态        |
| `assignPullRequestAssignees`          | POST   | ⛔   | write-keyword | 指派用户审查 Pull Request           |
| `removePullRequestAssignees`          | DELETE | ⛔   | write-keyword | 取消用户审查 Pull Request           |
| `listPullRequestOptionalReviewers`    | GET    | ✅   | safe-method   | 获取可作为Pull Request评审人列表    |
| `listPullRequestOptionalTesters`      | GET    | ✅   | safe-method   | 获取可作为Pull Request测试人列表    |
| `listPullRequestFileChanges`          | GET    | ✅   | safe-method   | pr提交的文件变更信息                |
| `getPullRequestRawFile`               | GET    | ✅   | safe-method   | 获取文件内容                        |
| `listEnterprisePullRequests`          | GET    | ✅   | safe-method   | 企业 Pull Request列表               |
| `listPullRequestReactions`            | GET    | ✅   | safe-method   | 获取Pull Request的表态列表          |
| `getPullRequestComment`               | GET    | ✅   | safe-method   | 获取Pull Request某条评论            |
| `updatePullRequestComment`            | PATCH  | ⛔   | write-keyword | 编辑评论                            |
| `deletePullRequestComment`            | DELETE | ⛔   | write-keyword | 删除评论                            |
| `listPullRequestCommentReactions`     | GET    | ✅   | safe-method   | 获取Pull Request评论的表态列表      |
| `listPullRequestModifyHistory`        | GET    | ✅   | safe-method   | 获取Pull Request的修改历史          |
| `listPullRequestCommentModifyHistory` | GET    | ✅   | safe-method   | 获取Pull Request评论的修改历史      |
| `listOrgPullRequests`                 | GET    | ✅   | safe-method   | 组织 Pull Request列表               |
| `listEnterpriseIssuePullRequests`     | GET    | ✅   | safe-method   | 获取企业 issue 关联的 Pull Requests |

## CI (1)

| operation     | method | read | reason      | summary                      |
| ------------- | ------ | ---- | ----------- | ---------------------------- |
| `getPRCILogs` | GET    | ✅   | safe-method | 获取对应PR的门禁控制台CI日志 |

## eulermaker (10)

| operation             | method | read | reason        | summary                  |
| --------------------- | ------ | ---- | ------------- | ------------------------ |
| `searchData`          | POST   | ✅   | read-keyword  | 通用数据查询             |
| `createOsProject`     | POST   | ⛔   | write-keyword | 创建 OS 工程             |
| `updateOsProject`     | PUT    | ⛔   | write-keyword | 更新 OS 工程             |
| `createBranchProject` | POST   | ⛔   | write-keyword | 创建分支工程             |
| `createSnapshot`      | POST   | ⛔   | write-keyword | 创建快照                 |
| `buildSingle`         | POST   | ⛔   | write-keyword | 单包构建                 |
| `buildDag`            | POST   | ⛔   | write-keyword | 发起全量/增量/指定包构建 |
| `abortBuild`          | POST   | ⛔   | write-keyword | 取消构建                 |
| `downloadRpm`         | GET    | ✅   | safe-method   | 下载软件包产物           |
| `getJobLog`           | GET    | ✅   | safe-method   | 获取 job 构建日志页面    |

## Totals

- operations: 365
- read: 257
- blocked: 108
