//logs.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/http.js');
Page({
  data: {},
  onLoad: function () {

    // var that = this
    // api.http('users/info', 'POST', {}, function (res) {
    //   console.log(res)
    //   that.setData({
    //     user: res.data,
    //     mobilestate:res.data.mobile_state,
    //     subscribe_msg: wx.getStorageSync("subscribe_msg")
    //   })

    // })
  },
  // 授权登入
  authorLogin: function (e) {
    wx.showLoading({title: "正在登录", mask: true});
    var that = this
    wx.getUserInfo({
      success: res => {
        console.log(res)
        // 可以将 res 发送给后台解码出 unionId
       var userInfo = res.userInfo;
        // 执行微信登录
        wx.login({
          success: function (res) {
            api.httphos('user/accredit', 'POST', {
              code:res.code,
              avatarUrl:userInfo.avatarUrl,
              city:userInfo.city,
              country:userInfo.country,
              language:userInfo.language,
              nickName:userInfo.nickName,
              province:userInfo.province,
            },function (res) {
              if(res.code ==  200){
                wx.setStorageSync('token', res.data)
               api.showWarningText(res.msg)
              }
              wx.navigateBack();
              wx.hideLoading();
            })
          }
        });
      }
    })
  }
})