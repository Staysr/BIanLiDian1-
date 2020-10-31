// pages/addressList/addressList.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiazai:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var  that = this 
    let select = 'false';
        if(options.select == 'true'){
            select = 'true';
        }
        that.setData({
            select: select,
            delAddress:options.delAddress
        });
    that.listrest()//请求用户地址列表

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
  //新建收货地址
  jumpAddressEdit:function () {
    // wx.navigateTo({url: "../addressEdit/addressEdit"});
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
  //请求地址列表
  listrest:function () {
    var that = this
    that.setData({
      jiazai:true,
    })
    api.http('user/listrest', 'POST', {}, function (res) {
      if (res.code == 200) {
        that.setData({
          jiazai:false,
          address:res.data,
          addresslength:res.data.length
        })
      }else{
        that.setData({
          addresslength:0
        })
      }
    })
  },
  //添加收货地址
  address() {
    var that = this
    wx.getSetting({
      success(res) {
        console.log("vres.authSetting['scope.address']：",res.authSetting['scope.address'])
        if (res.authSetting['scope.address']) {
          wx.chooseAddress({
            success(res) {
              api.http('user/address', 'POST', {
                userName:res.userName,
                postalCode:res.postalCode,
                provinceName:res.provinceName,
                cityName:res.cityName,
                detailInfo:res.detailInfo,
                nationalCode:res.nationalCode,
                telNumber:res.telNumber
              }, function (res) {
                if(res.code == 200){
                  api.showWarningText(res.msg)
                  that.setData({
                    address:res.data,
                    addresslength:res.data.length
                  })
                }else{
                  that.setData({
                    addresslength:0
                  })
                }
                console.log(res)
              })
            }
          })
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问  
        } else {
          if (res.authSetting['scope.address'] == false) {
            wx.openSetting({
              success(res) {
                console.log(res.authSetting)
              }
            })
          } else {
            wx.chooseAddress({
              success(res) {
                console.log(res.userName)
                console.log(res.postalCode)
                console.log(res.provinceName)
                console.log(res.cityName)
                console.log(res.countyName)
                console.log(res.detailInfo)
                console.log(res.nationalCode)
                console.log(res.telNumber)
              }
            })
          }
        }
      }
    })
  },
  //设置默认的收货地址
  setDefault:function (e) {
    var that = this 
    var id = e.currentTarget.dataset.id
    api.http('user/setDefault', 'POST', {
      id:id
    }, function (res) {
      if (res.code == 200) {
        api.showWarningText("设置成功")
        that.setData({
          address:res.data,
          addresslength:res.data.length
        })
      }
    })
  },
  // 删除地址
  delAddress:function (e) {
     var that = this 
    var id = e.currentTarget.dataset.id
    api.http('user/delAddress', 'POST', {
      id:id
    }, function (res) {
      if (res.code == 200) {
        api.showWarningText("删除成功")
        that.listrest()
      }
    })
  },
// 选择收货地址
  editAddress:function (e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
        listrest: e.currentTarget.dataset,
      })
  wx.navigateBack({})
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