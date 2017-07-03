// pages/schedule/schedule.js
import * as dateUtil from '../../utils/date'
import { getInArray, indexOfArray } from '../../utils/util'
import service from '../../utils/service'

let app = getApp()
let today = new Date()
let curFirstWeekDate // 当前周的第一天
let weekInfoList // 周信息列表
let curWeekIndex // 当前周索引
let weekCourseList // 周课程列表

let formatWeekDate = function (date) {
  return date.getDate() + '日'
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    todayIndex: -1, // 当天索引0-6，-1表示不在当前周
    curMonth: '', // 当前月份
    curWeek: '', // 当前周数
    curTitle: '', // 当前周标题
    courseColors: ['#ffca7f', '#91d7fd', '#96a4f9'], // 0学校课程 1其他课程 2智康课程
    weekLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    weekDates: [], // 周日期列表
    tasklist: [] // 课程列表
  },

  /**
   * 课程详情
   */
  showCardView: function (event) {
    let ele = event.currentTarget
    let type = ele.dataset.type
    let index = ele.dataset.index
    app.globalData.currentCourse = weekCourseList[index]

    if (type == 2) {
      wx.switchTab({
        url: '../queryCourse/queryCourse',
      })
    } else {
      wx.navigateTo({
        url: '../editCourse/editCourse',
      })
    }
  },

  /**
   * 新建课程
   */
  addCourseHandler: function (event) {
    wx.navigateTo({
      url: '../addCourse/addCourse',
    })
  },

  /**
   * 上一周
   */
  prevWeekHandler: function (event) {
    // if (weekInfoList && curWeekIndex - 1 >= 0) {
    //   curWeekIndex--
    //   this.updateWeeks(dateUtil.getDiffDate(curFirstWeekDate, -7))
    // }

    // FIXME for demo
    this.updateWeeks(dateUtil.getDiffDate(curFirstWeekDate, -7))
  },

  /**
   * 下一周
   */
  nextWeekHandler: function (event) {
    // if (weekInfoList && curWeekIndex + 1 < weekInfoList.length) {
    //   curWeekIndex++
    //   this.updateWeeks(dateUtil.getDiffDate(curFirstWeekDate, 7))
    // }

    // FIXME for demo
    this.updateWeeks(dateUtil.getDiffDate(curFirstWeekDate, 7))
  },

  /**
   * 反馈
   */
  feedbackHandler: function (event) {
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  },

  updateWeeks: function (date) {
    wx.showLoading({
      title: '加载中',
    })

    // 判断是否当前天
    let todayIndex = -1
    if (date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && dateUtil.getMonthWeekth(date) == dateUtil.getMonthWeekth(today)) {
      todayIndex = dateUtil.formatWeekOrder(today.getDay())
    }

    // 获取当前周日期
    curFirstWeekDate = dateUtil.getWeekFirstDate(date)
    let curMonth = curFirstWeekDate.getMonth() + 1
    let weekDates = []
    let tmpFirstDate = new Date(curFirstWeekDate)
    for (var i = 0; i < 7; i++) {
      if (i == 0) {
        weekDates.push(formatWeekDate(curFirstWeekDate))
      } else {
        weekDates.push(formatWeekDate(dateUtil.getDiffDate(tmpFirstDate, 1)))
      }
    }

    // 获取当前周参数信息
    // let curWeekInfo = weekInfoList[curWeekIndex]
    // let curTitle = curWeekInfo.quterName
    // let curWeek = curWeekInfo.weekNumName
    // let curFirstWeekDateString = curWeekInfo.curDate

    // FIXME for demo
    let curWeek = '第' + dateUtil.getMonthWeekth(date) + '周'
    let curTitle = '17-18学年春季'

    // 获取当前周课程数据
    // let that = this
    // app.getUserInfo(function (userInfo) {
    //   service.getCourseInfoList(userInfo.unionId, curFirstWeekDateString, function (data) {
    //     weekCourseList = data
    //     let tasklist = []
    //     // 适配接口字段
    //     let idx = 0
    //     for (let item of data) {
    //       tasklist.push({
    //         id: idx++,
    //         type: item.classType,
    //         day: dateUtil.formatWeekOrder(new Date(item.classDate).getDay()),
    //         start: item.sectionStart,
    //         sections: item.sectionEnd - item.sectionStart + 1,
    //         course: item.subjectName,
    //         teacher: item.teacherName,
    //         place: item.deptName
    //       })
    //     }

    //     // 更新数据
    //     that.setData({
    //       todayIndex,
    //       curMonth,
    //       curWeek,
    //       weekDates,
    //       curTitle,
    //       tasklist
    //     })

    //     wx.hideLoading()
    //   }, function () {
    //     wx.hideLoading()
    //   })
    // }, function () {
    //   wx.hideLoading()
    // })

    // FIXME for demo
    let tasklist = weekCourseList = [
      { id: 0, type: 0, day: 0, start: 1, sections: 1, course: "语文", teacher: "刘德华", place: "大钟寺" },
      { id: 1, type: 1, day: 1, start: 5, sections: 2, course: "数学", teacher: "谢霆锋", place: "五道口" },
      { id: 2, type: 2, day: 2, start: 1, sections: 2, course: "英语", teacher: "小明", place: "科贸" }
    ]

    this.setData({
      todayIndex,
      curMonth,
      curWeek,
      weekDates,
      curTitle,
      tasklist
    })

    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('schedule page onLoad')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('schedule page onReady')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('schedule page onShow')

    wx.showLoading({
      title: '加载中',
    })

    // service.getWeekInfoList(data => {
    //   weekInfoList = data
    //   curWeekIndex = indexOfArray('selected', true, weekInfoList)
    //   this.updateWeeks(today)
    // })

    // FIXME for demo
    this.updateWeeks(today)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('schedule page onPullDownRefresh')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log('schedule page onShareAppMessage')
  }
})