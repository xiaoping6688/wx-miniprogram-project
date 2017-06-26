//app.js
import service from './utils/service'

App({
  onLaunch: function () {
    // FIXME 演示版注释掉登录功能
    
    // 预登录
    // let that = this
    // this.doLogin(function (data) {
    //   that.globalData.userInfo = data
    // }, function () {
    //   console.log('login error')
    // })
  },

  doLogin: function (onSuccess, onFail) {
    wx.checkSession({
      success: function () { // wx session_key 未过期
        // 从本地缓存中获取 sys session
        try {
          let value = wx.getStorageSync('sysSession')
          if (value) { // system login
            service.getUserInfo(value, onSuccess, onFail)
          } else { // weixin login
            service.login(onSuccess, onFail)
          }
        } catch (e) { // weixin login
          service.login(onSuccess, onFail)
        }
      },
      fail: function () { // 登录态过期，需重新登录
        service.login(onSuccess, onFail)
      }
    })
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function (onSuccess, onFail) {
    if (this.globalData.userInfo) {
      typeof onSuccess == "function" && onSuccess(this.globalData.userInfo)
    } else {
      let that = this
      this.doLogin(function (data) {
        that.globalData.userInfo = data
        onSuccess(data)
      }, function () {
        console.log('login error')
        typeof onFail == "function" && onFail()
      })
    }
  },

  /**
   * 全局数据
   */
  globalData: {
    userInfo: null, // 用户信息
    currentCourse: null // 当前课程数据
  }
})
