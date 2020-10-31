// pages/user/user.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //去请求用户信息
    if (wx.getStorageSync('token') == '' || wx.getStorageSync('token') == undefined) {
      wx.navigateTo({
        url: '../logs/logs.js',
      })
      return false;
    }
    var that = this
    that.userdata();

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
    //更新用户信息
    var that = this
    that.userdata();
  },
  //获取用户信息
  userdata: function () {
    var that = this
    api.http('user/userdata', 'POST', {}, function (res) {
      console.log(res)
      if (res.code == 200) {
        that.setData({
          userdata: res.data
        })
      };
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  //个人信息管理
  usermessage:function(){
    wx.navigateTo({
      url: '../usermessage/usermessage',
    })
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