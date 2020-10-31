// pages/submitOrder/submitOrder.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: 2, //默认是自取
    img: "http://www.bianlidian.com/",
    listrest: '',
    type: true,
    paytype: 3,
    jiazai:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //请求购物商品列表
    var that = this
    that.setData({
      options: options,
      moneys: options.money
    })
    that.showshop() //商品列表
    that.addres() //地址列表
    that.phoneuser()
  },
  //收货地址列表
  jumpAddress: function () {
    wx.navigateTo({
      url: '../addressList/addressList',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //获取自取的联系方式
  phoneuser: function (params) {
    var that = this
    api.http('user/phoneuser', 'POST', {}, function (res) {
      if (res.code == 200) {
        console.log(res.data)
        that.setData({
          phoneuser: res.data
        })
      }
    })
  },
  showshop: function () {
    var that = this
    that.setData({
      jiazai:true,
    })
    var goodsid = new Array
    var shopcat = wx.getStorageSync('shopcat')
    for (var i = 0; i < shopcat.length; i++) {
      goodsid.push(
        shopcat[i].goodsid
      );
    }
    api.httphos('order/showshop', 'POST', {
      goodsid: goodsid
    }, function (res) {
      console.log(res)
      for (var i = 0; i < res.data.length; i++) {
        for (var j = 0; j < shopcat.length; j++) {
          if (shopcat[j].goodsid == res.data[i].id) {
            res.data[i].num = shopcat[j].count
          }
        }
      }
      that.setData({
        jiazai:false,
        order: res.data
      })
    })
  },
  //地址列表
  addres: function () {
    var that = this
    api.http('user/useraddres', 'POST', {}, function (res) {
      if (res.code == 200) {
        if (res.data == null) {
          that.setData({
            codes: ''
          })
        } else {
          that.setData({
            codes: res.data,
            city: res.data.city,
            content: res.data.content, //详情地址
            phone: res.data.phone, //手机号
            username: res.data.username, //用户名称
            addresid: res.data.id
          })
        }
      }
    })
  },
  //选择配送方式
  radioChange: function (e) {
    var that = this
    var money = e.currentTarget.dataset.money //总价
    var type = e.detail.value //状态值
    var deliverypay = e.currentTarget.dataset.deliverypay // 配送费用
    var counter = parseFloat(money) + parseFloat(deliverypay)
    that.setData({
      value: e.detail.value,
      moneys: type == '1' ? counter.toFixed(2) : money,
    })
  },
  paymoney: function (e) {
    var that = this
    that.setData({
      paytype: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (value) {
    var that = this
    var data = that.data.listrest
    that.setData({
      value: data.type, //状态 
      city: data.city, //城市
      content: data.content, //详情地址
      phone: data.phone, //手机号
      username: data.username, //用户名称
      addresid: data.id //地址id
    })
    //验证购物库存库存
    that.verificationinventory()
  },
  //提交订单
  formSubmit: function (e) {
    console.log(e)
    var that = this
    wx.showModal({
      title: '确认订单提示',
      content: '是否生成订单?',
      cancelText: "否", //默认是“取消”
      confirmText: "是", //默认是“确定”
      success: function (res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          //验证订单状态
          if (!e.detail.value.type) {
            api.showWarningText(e.detail.value.msg)
            return false;
          }
          if (e.detail.value.orderstatus == 2) { //判断订单的配送状态  2自取 1 配送
            if (e.detail.value.phone == '') { //验证联系方式
              api.showWarningText('请填写联系方式')
              return;
            } else if (e.detail.value.phone.length != 11) {
              api.showWarningText('输入手机号有误')
              return;
            } else if (e.detail.value.phone != '' && e.detail.value.phone.length == 11) {
              var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
              if (!myreg.test(e.detail.value.phone)) {
                api.showWarningText('手机号格式不正确')
                return false;
              }
            }
          } else {
            if (e.detail.value.citycontent == '' || e.detail.value.namephone == '' || e.detail.value.username == '' || addresid == '') { //判断收货地址
              api.showWarningText('请填写收货地址')
              return false;
            }
          }
          if (e.detail.value.orderstatus == 2) { //2自取
            //提交
            api.http('order/ordersubmit', 'POST', {
              moneys: e.detail.value.moneys, //总价格
              phone: e.detail.value.phone,
              remark: e.detail.value.remark,
              orderstatus: e.detail.value.orderstatus,
              goods: JSON.stringify(wx.getStorageSync('shopcat')),
              paytype: e.detail.value.paytype
            }, function (res) {
              if (res.code == 200) {
                console.log(res.data)
                wx.removeStorageSync('shopcat') //订单生成以后清楚本地缓存
                api.showWarningText('订单生成成功!即将跳转首页')
                wx.setStorageSync('status', 1)
                wx.setStorageSync('orderid', res.data)
                setTimeout(function () {
                  wx.switchTab({
                    url: '../index/index',
                  })
                }, 1000)
              }
            })
          } else {
            //提交
            var addresid = e.detail.value.addresid;
            api.http('order/ordersubmit', 'POST', { //配送
              moneys: e.detail.value.moneys, //总价格
              addresid: addresid, //地址id
              orderstatus: e.detail.value.orderstatus, //订单方式
              deliverypay: e.detail.value.deliverypay, //配送价格
              remark: e.detail.value.remark,
              paytype: e.detail.value.paytype,
              goods: JSON.stringify(wx.getStorageSync('shopcat')),
            }, function (res) {
              if (res.code == 200) {
                console.log(res.data)
                wx.removeStorageSync('shopcat') //订单生成以后清楚本地缓存
                api.showWarningText('订单生成成功!即将跳转首页')
                wx.setStorageSync('status', 1)
                wx.setStorageSync('orderid', res.data)
                setTimeout(function () {
                  wx.switchTab({
                    url: '../index/index',
                  })
                }, 1000)
              }
            })
          }
        }
      },
    })
  },
  //验证库存
  verificationinventory() {
    var that = this
    api.http('order/verificationinventory', 'POST', {
      goods: JSON.stringify(wx.getStorageSync('shopcat'))
    }, function (res) {
      if (res.code != 200) {
        console.log(res)
        that.setData({
          msg: res.msg,
          type: false,
        })
      }
    })
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