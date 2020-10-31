// pages/usermessage/usermessage.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: false, //登入状态效果
    jiazai: false, //懒加载
    imgList: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      jiazai: true,
    })
    that.setData({
      msgList: [
       { url: "url", title: "公告：多地首套房贷利率上浮 热点城市渐迎零折扣时代" },
       { url: "url", title: "公告：悦如公寓三周年生日趴邀你免费吃喝欢唱" },
       { url: "url", title: "公告：你想和一群有志青年一起过生日嘛？" }]
     });
    api.http('user/userupdate', 'GET', {}, function (res) {
      console.log(res)
      if (res.code == 200) {
        that.setData({
          userdata: res.data,
          jiazai: false
        })
      };
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //头像选择
  goimg: function (e) {
    var that = this
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        that.setData({
          imgList: tempFilePaths,
          imgurl: res.tempFilePaths[0]
        })
      }
    });
  },
  //表单提交
  formSubmit: function (e) {
    console.log(e)
    var that = this
    var baseUrl = app.globalData.staticUrl //获得基本ur
    var ImgUrldata = app.globalData.ImgUrl //获得基本ur
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (e.detail.value.username == '') {
      api.showWarningText('姓名不能为空')
      return false
    }
    if (e.detail.value.phone == '') {
      api.showWarningText(
        '手机号不能为空'
      )
      return false
    }
    if (e.detail.value.mailbox == '') {
      api.showWarningText(
        '邮箱不能为空'
      )
      return false
    }
    if(e.detail.value.phone.length > 11){
      api.showWarningText(
        '手机号长度有误'
      )
      return false
    }
    if(!myreg.test(e.detail.value.phone)){
      api.showWarningText(
        '手机号格式错误'
      )
      return false
    }
    
    that.setData({
      type: true
    })
    // 处理图片上传
    if (e.detail.value.imgurl == '') {
      api.http('user/userupdate', 'POST', {
        username: e.detail.value.username,
        phone: e.detail.value.phone,
        mailbox: e.detail.value.mailbox,
        avatarUrl: e.detail.value.avatarUrl
      }, function (res) {
        console.log(res)
        if (res.code == 200) {
          api.showWarningText(res.msg)
          that.setData({
            type: false
          })
        };
      })
    } else {
      wx.uploadFile({
        url: baseUrl + '/Common/upload', //仅为示例，非真实的接口地址
        filePath: e.detail.value.imgurl,
        name: 'file',
        header: {
          "content-type": "multipart/form-data"
        },
        success: function (res) {
          let data = res.data
          let dataNew = JSON.parse(data)
          if (dataNew.code == 1) {
            api.http('user/userupdate', 'POST', {
              username: e.detail.value.username,
              phone: e.detail.value.phone,
              mailbox: e.detail.value.mailbox,
              imgUrl: ImgUrldata + dataNew.data.url,
              avatarUrl: e.detail.value.avatarUrl
            }, function (res) {
              console.log(res)
              if (res.code == 200) {
                api.showWarningText(res.msg)
                that.setData({
                  type: false
                })
              };
            })
          }
        }
      })
    }
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