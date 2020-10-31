// pages/order/order.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 0,
    scrollLeft: 0,
    listod: [{
        id: 1,
        name: '全部',
      },
      {
        id: 2,
        name: '已付款',
      },
      {
        id: 3,
        name: '已取消',
      },
      {
        id: 4,
        name: '已完成',
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取全部的订单列表
    api.http('order/userorderlist', 'POST', {
    }, function (res) {
      console.log(res)
      if (res.code == 200) {
        that.setData({

        })
      }
    })
  },
  // 操作条事件
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})