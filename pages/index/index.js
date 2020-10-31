//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/http.js');
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    order: [],
    list: [],
    shoppingheight: 100,
    load: true,
    shoppingtype: false, //是否显示购物车
    isShowShoppingBox: false, //是否打开购物车盒子
    img: "http://www.bianlidian.com/",
    userorderlist: false,
  },
  onLoad: function () {
    var that = this
    //获取商品的一级分类
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    api.httphos('order/orderone', 'POST', {}, function (res) {
      console.log(res)
      wx.hideLoading();
      if (res.code == 200) {
        //去获取商品的二级分类
        that.orderlist(res.data[0].id)
        that.setData({
          orderlist: res.data,
          orderid: res.data[0].id
        })
      }
    })
  },
  orderlist: function (id) {
    var that = this
    api.httphos('order/orderlist', 'POST', {
      id: id,
    }, function (res) {
      console.log(res)
      if (res.code == 200) {
        var shopcat = wx.getStorageSync('shopcat')
        if (shopcat == '' || shopcat == undefined) {
          that.setData({
            shoppingheight: 100,
            order: res.data,
          })
        } else {
          for (var j = 0; j < res.data.length; j++) {
            for (var i = 0; i < shopcat.length; i++) {
              if (shopcat[i].goodsid == res.data[j].id) {
                res.data[j].num = shopcat[i].count
              }
            }
          }
          that.shoppingstatus() //计算购物车
          that.setData({
            shoppingheight: 91,
            order: res.data,
            shoppingtype: true,
          })
        }
      } else {
        that.setData({
          order: res.data,
        })
      }
    })
  },
  //加的购物车
  add: function (e) {
    console.log(e)
    var that = this
    var index = e.currentTarget.dataset.index
    var num = e.currentTarget.dataset.num + 1
    var orderid = e.currentTarget.dataset.orderid
    var repertory = e.currentTarget.dataset.repertory //真实库存
    var buypay = e.currentTarget.dataset.buypay //购买上线,
    var price = e.currentTarget.dataset.price //商品价格
    var isShowShoppingBox = e.currentTarget.dataset.isshowshoppingbox //是否打开购物盒子
    let order = that.data.order
    order[index].num = num
    //监测库存
    if (api.repertory(num - 1, repertory, buypay)) {
      api.joinShopCar(orderid, num, price)
      that.setData({
        order: order,
        shoppingheight: 91,
        shoppingtype: true
      })
    } else {
      order[index].num = --num
    }

    that.shoppingstatus() //重新计算购物车
  },
  //减的购物车
  subtract: function (e) {
    var that = this
    var num = e.currentTarget.dataset.num - 1
    var index = e.currentTarget.dataset.index
    var orderid = e.currentTarget.dataset.orderid
    var classid = e.currentTarget.dataset.classid
    var price = e.currentTarget.dataset.price //商品价格
    let order = that.data.order
    var isShowShoppingBox = e.currentTarget.dataset.isshowshoppingbox //是否打开购物盒子
    order[index].num = num
    api.joinShopCar(orderid, num, price)
    if (wx.getStorageSync("shopcat").length == 0) {
      that.setData({
        shoppingheight: 100,
        shoppingtype: false, //是否显示购物车
        isShowShoppingBox: false,
      })
      that.orderlist(classid)
    }
    that.setData({
      order: order
    })
    that.shoppingstatus() //重新计算购物车
  },
  onReady() {
    wx.hideLoading()
  },

  //计算主页购物车的价格以及数量和商品显示
  shoppingstatus: function () {
    var that = this
    var shopcat = wx.getStorageSync("shopcat") //购物车总数量
    var countshop = api.shopCarGetMoney(shopcat)

    that.setData({
      money: countshop[0], //总价
      county: countshop[1], //长度
    })
  },
  //打开购物盒子
  showShoppingBox: function () {
    var that = this
    that.setData({
      isShowShoppingBox: true,
    })
    //显示购物车内容
    that.showshop()
  },
  //请求购物车内容
  showshop: function () {
    var that = this
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
        order: res.data
      })
    })
  },
  //隐藏购物盒子
  hideShoppingBox: function (e) {
    var that = this
    that.orderlist(e.currentTarget.dataset.orderid)
    setTimeout(function () {
      that.setData({
        isShowShoppingBox: false,
      })
    }, 100)
  },
  //清空购物车
  showDialog: function (e) {
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: '是否清空购物车',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('shopcat')
          that.setData({
            isShowShoppingBox: false,
            shoppingheight: 100,
            shoppingtype: false, //是否显示购物车
          })
          that.orderlist(e.currentTarget.dataset.orderid)
        }
      }
    })
  },
  //购物车诸葛清空
  deleteshop: function (e) {
    var that = this
    var shopcat = wx.getStorageSync('shopcat') //获取购物车
    var order = that.data.order //页面数据
    var id = e.currentTarget.dataset.id
    for (var i = 0; i < shopcat.length; i++) {
      if (shopcat[i].goodsid == id) {
        shopcat.splice(i, 1)
      }
    }
    for (var j = 0; j < order.length; j++) {
      if (order[j].id == id) {
        order.splice(j, 1)
      }
    }
    if (order.length == 0) {
      that.setData({
        county: order.length,
        isShowShoppingBox: false,
        shoppingheight: 100,
        shoppingtype: false, //是否显示购物车
      })
    } else {
      that.setData({
        county: order.length
      })
    }
    that.orderlist(e.currentTarget.dataset.orderid)
    wx.setStorageSync('shopcat', shopcat)
  },
  //提交订单
  submitOrder: function (e) {
    console.log(e)
    // 验证用户登入
    var token = wx.getStorageSync('token')
    if (token == '' || token == undefined) {
      wx.navigateTo({
        url: '../logs/logs',
      })
    } else {
      var county = e.currentTarget.dataset.county //数量
      var deliverypay = e.currentTarget.dataset.deliverypay //配送费
      var distribution = e.currentTarget.dataset.distribution //满多少配送
      var money = e.currentTarget.dataset.money //商品的总价 不包括配送费
      wx.navigateTo({
        url: "../submitOrder/submitOrder?county=" + county + '&deliverypay=' + deliverypay + '&distribution=' + distribution + '&money=' + money
      });
    }

  },
  onShow: function () {
    var that = this
    that.monitorlist() //监测订单状态
    // 请求购物配置项
    api.httphos('order/configuration', 'POST', {}, function (res) {
      console.log(res)
      if (res.code == 200) {
        //去获取商品的二级分类
        that.setData({
          configuration: res.data
        })
      } else {
        that.setData({
          configuration: ''
        })
      }
    })
    if (wx.getStorageSync('status') == 1) {
      api.httphos('order/orderone', 'POST', {}, function (res) {
        if (res.code == 200) {
          //去获取商品的二级分类
          wx.setStorageSync('isLock', 1) //开启监测订单
          that.orderlist(res.data[0].id)
          that.setData({
            shoppingtype: false, //是否显示购物车
            orderlist: res.data,
            index: 0,
            userorderlist: true,
            TabCur: 0,
            orderid: res.data[0].id
          })
        }
      })
      setTimeout(function () {
        wx.removeStorageSync('status')
      }, 3000)
    }
  },
  //监测订单状态
  monitorlist: function () {
    var that = this
    if (wx.getStorageSync('isLock') != undefined || wx.getStorageSync('isLock') == 1) {
      let timer = setInterval(() => {
        if (wx.getStorageSync('isLock') != 1) {
          clearInterval(timer)
          that.setData({
            userorderlist: false
          })
        } else {
          api.httphos('order/monitorlist', 'POST', {
            id:wx.getStorageSync('orderid')
          }, function (res) {
            // console.log(res)
            that.setData({
                  ordercode:res.code,
                  userorderlist: true
              })
          })
          // that.setData({
           
          // })
        }
      }, 2000)
    }

  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },
  tabSelect(e) {
    var that = this
    that.orderlist(e.currentTarget.dataset.orderid)
    that.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      orderid: e.currentTarget.dataset.orderid,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  //商品详情的弹窗
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      imgurl: e.currentTarget.dataset.imgurl,
      ordername: e.currentTarget.dataset.ordername,
      cspecification: e.currentTarget.dataset.cspecification,
      commodityname: e.currentTarget.dataset.commodityname
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
})