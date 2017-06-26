// pages/splash/splash.js
/**
 * 启动页
 */

// let sys = wx.getSystemInfoSync()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    launchImg: '../../images/launch@2x.jpg',
    // imgWidth: sys.windowWidth,
    // imgHeight: sys.windowHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    setTimeout(function(){
      wx.redirectTo({
        url: '../schedule/schedule',
      })
    }, 2000)
  }
})