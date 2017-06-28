/**
 * 数据服务类
 */

// 接口配置
const BASE_URI = 'api'
const LOGIN_API = BASE_URI + '/querySessionkKey'
const GET_USERINFO_API = BASE_URI + '/queryUnionId'
const ADD_COURSE_API = BASE_URI + '/saveClass'
const EDIT_COURSE_API = BASE_URI + '/updateClass'
const DEL_COURSE_API = BASE_URI + '/deleteClass'
const GET_COURSE_DETAIL_API = BASE_URI + '/queryClassDetail'
const GET_COURSE_RESULT_API = BASE_URI + '/queryCurriculumnFeedback'
const GET_COURSE_QUIZ_API = BASE_URI + '/queryQuestion'
const GET_WEEKINFO_LIST_API = BASE_URI + '/queryCalendarList'
const GET_COURSEINFO_LIST_API = BASE_URI + '/queryClassList'
const DO_FEEDBACK_API = BASE_URI + '/saveFeedBack'

/**
 * 服务对象
 */
let service = {
  /**
   * 通过 wx code 登录，返回 userInfo
   */
  login: function (onSuccess, onError) {
    wx.login({
      success: function (res) {
        if (res.code) {
          let args = {
            code: res.code
          }
          http.get(LOGIN_API, args, function (res) {
            if (res.ret === true) {
              if (res.data && res.data.sessionKey) {
                let session = res.data.sessionKey
                wx.setStorage({
                  key: "sysSession",
                  data: session
                })
                service.getUserInfo(session, onSuccess, onError)
              } else {
                console.log('getUserInfo数据异常')
                if (typeof (onError) === 'function') {
                  onError()
                }
              }
            } else {
              wx.showModal({
                title: '错误',
                content: res.msg,
                showCancel: false
              })
              if (typeof (onError) === 'function') {
                onError()
              }
            }
          }, onError)
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },

  /**
   * 根据系统Session获取用户信息（前提是后台已经获取到wx session_key）
   */
  getUserInfo: function (session, onSuccess, onError) {
    wx.getUserInfo({
      withCredentials: true,
      success: function (ret) {
        let args = {
          sessionKey: session,
          encryptData: ret.encryptedData,
          iv: ret.iv
        }

        http.post(GET_USERINFO_API, args, function (res) {
          if (res.ret === true) {
            let userInfo = ret.userInfo
            userInfo.unionId = res.data
            onSuccess(userInfo)
          } else {
            wx.showModal({
              title: '错误',
              content: res.msg,
              showCancel: false
            })
            if (typeof (onError) === 'function') {
              onError()
            }
          }
        }, onError)
      }
    })
  },

  /**
   * 新建课程
   */
  addCourse: function (args, onSuccess, onError) {
    http.post(ADD_COURSE_API, args, function (res) {
      if (res.ret === true) {
        onSuccess(res.data)
      } else {
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
        if (typeof (onError) === 'function') {
          onError()
        }
      }
    }, onError)
  },

  /**
   * 获取周信息列表
   */
  getWeekInfoList: function (onSuccess, onError) {
    http.get(GET_WEEKINFO_LIST_API, null, function (res) {
      if (res.ret === true) {
        onSuccess(res.data)
      } else {
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
        if (typeof (onError) === 'function') {
          onError()
        }
      }
    }, onError)
  },

  /**
   * 获取课程信息列表
   */
  getCourseInfoList: function (unionId, curDate, onSuccess, onError) {
    let args = {
      uinionId: unionId,
      curDate: curDate
    }

    http.post(GET_COURSEINFO_LIST_API, args, function (res) {
      if (res.ret === true) {
        onSuccess(res.data)
      } else {
        wx.showModal({
          title: '错误',
          content: res.msg,
          showCancel: false
        })
        if (typeof (onError) === 'function') {
          onError()
        }
      }
    }, onError)
  },
}

export default service

/**
 * http请求封装
 */
export let http = {
  logger: null, // 外部log函数，默认console
  maxRetryTimes: 1, // 最大重试次数
  requestsCache: {},

  /**
   * 发送GET请求
   * @param {String} api 接口URL
   * @param {Object} args 参数
   * @param {Function} onSuccess 成功回调函数
   * @param {Function} onError 失败回调函数
   */
  get: function (api, args, onSuccess, onError) {
    if (this.requestsCache[api]) {
      delete this.requestsCache[api]
    }

    this.call(api, args, 'GET', onSuccess, onError)
    this.requestsCache[api] = {
      curRetryTimes: 0,
      method: 'GET',
      args: args,
      onSuccess: onSuccess,
      onError: onError
    }
  },

  /**
   * 发送POST请求
   * @param {String} api
   * @param {Object} args
   * @param {Function} onSuccess
   * @param {Function} onError
   */
  post: function (api, args, onSuccess, onError) {
    if (this.requestsCache[api]) {
      delete this.requestsCache[api]
    }

    this.call(api, args, 'POST', onSuccess, onError);
    this.requestsCache[api] = {
      curRetryTimes: 0,
      method: 'POST',
      args: args,
      onSuccess: onSuccess,
      onError: onError
    }
  },

  call: function (api, args, method, onSuccess, onError) {
    http.trace('[Request] ' + api + ' method: ' + method + ' args: ' + JSON.stringify(args))

    wx.request({
      url: api,
      method: method,
      data: args || {},
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        delete http.requestsCache[api]
        http.trace('[Response] ' + res.statusCode + ' ' + api + "\n" + JSON.stringify(res.data))

        if (res.statusCode < 400 && typeof onSuccess === 'function') {
          try {
            onSuccess(res.data)
          } catch (err) {
            http.trace(err, 'error');
          }
        }
      },
      fail: function () {
        let request = http.requestsCache[api]
        if (request && request.curRetryTimes++ < http.maxRetryTimes) {
          http.trace('[Error] ' + api + ' Begin Retry... ' + request.curRetryTimes)
          http.call(api, request.args, request.method, request.onSuccess, request.onError)
        } else {
          delete http.requestsCache[api]
          http.trace('[Error] ' + api)

          if (typeof (onError) === 'function') {
            onError()
          }
        }
      }
    })
  },

  trace: function (log, level) {
    if (level == undefined) level = 'log'

    if (typeof this.logger === 'function') {
      this.logger(log)
    } else {
      console[level](log)
    }
  }
}
