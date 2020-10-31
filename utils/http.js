const app = getApp();
// const api = require('../utils/http.js');
//====================== 封装的请求接口=========================
function http(url, method, data, callBack) {
  var session_key = wx.getStorageSync("token")
  data['token'] = session_key
  var header = "";
  if (session_key == "" || session_key == undefined) {
    wx.navigateTo({
      url: '../logs/logs',
    })
    return false;
  }
  method == 'POST' ? header = "application/x-www-form-urlencoded" : header = 'application/json';
  wx.request({
    url: app.globalData.staticUrl + url,
    data: data,
    method: method,
    header: {
      'content-type': header
    }, //设置请求头g
    success: function (res) {
      //token 失效 跳转登入
      if (res.data.code == 0 && res.data.msg == "no login") {
        wx.clearStorage()
        wx.navigateTo({
          url: '../logs/logs',
        })
        return false
      }
      callBack(res.data);
    },
    fail: function () {
      wx.hideLoading();
      wx.showToast({
        title: '网络错误，请稍后重试,',
        icon: 'none',
        duration: 2000
      })
    },
    complete: function () {

    }
  })
}

//====================== 封装的请求接口=========================

//====================== 封装的请求接口=========================
function httphos(url, method, data, callBack) {
  var header = "";
  method == 'POST' ? header = "application/x-www-form-urlencoded" : header = 'application/json';
  wx.request({
    url: app.globalData.staticUrl + url,
    data: data,
    method: method,
    header: {
      'content-type': header
    }, //设置请求头g
    success: function (res) {
      callBack(res.data);
    },
    fail: function () {
      wx.hideLoading();
      wx.showToast({
        title: '网络错误，请稍后重试,',
        icon: 'none',
        duration: 2000
      })
    },
    complete: function () {

    }
  })
}

// ==================判断用户是否已经登录==========

function isloginStatus() {

  var isloginStatus = wx.getStorageSync("isloginStatus");
  var userid = wx.getStorageSync("userid");
  var userInfomation = wx.getStorageSync("userInfomation");
  if (!isloginStatus || isloginStatus == "undefinded" || isloginStatus == null || isloginStatus == "" || isloginStatus.length <= 0 || userid == "" || !userid) {
    return {
      isloginStatus: false,
      userid: "",
      userInfomation: {}
    };
  } else {
    return {
      isloginStatus: true,
      userid: userid,
      userInfomation: userInfomation
    };
  }
}

// ===================判断用户是否已经登录=================






// ====================== 警告提示=========================

function showWarning(msg) {
  wx.showToast({
    title: msg,
    icon: "none",
    image: "../images/jg.png",
    duration: 1500,
    mask: true
  })
}
// ====================== 警告提示=========================
// ====================== 警告提示(纯文本)=========================

function showWarningText(msg) {
  wx.showToast({
    title: msg,
    icon: "none",
    duration: 1500,
    mask: true
  })
}
// ====================== 警告提示(纯文本)=========================
// ====================== 成功提示=========================

function showSuccess(msg) {

  wx.showToast({
    title: msg,
    icon: "success",
    duration: 1500,
    mask: true
  })


}

// ====================== 成功提示=========================



// ======================加入到购物车=====================

function joinShopCar(goodsid, count,price) {
  var self = this;
  var goodsid = goodsid;
  var count = count;
  if (!goodsid) {
    showWarningText('数据繁忙,请稍后!')
    return false;
  }
  // wx.showLoading({
  //   title: '添加中...',
  //   mask: true
  // })

  var shopcat = wx.getStorageSync('shopcat')
  if (shopcat == '') {
    shopcat = new Array
    shopcat.push({
      goodsid: goodsid,
      count: count,
      price:price
    })
  } else {
      if (!js_in_array(goodsid,shopcat)) {
        shopcat.push({
          goodsid: goodsid,
          count: count,
          price:price
        })
      } else {
        for(var i = 0; i < shopcat.length;i++){
          if(shopcat[i].goodsid == goodsid){
              shopcat[i].count = count
              if(count == 0){
                shopcat.splice(i,1)
              }
          }
        }
        
      }
  }
  wx.setStorageSync('shopcat', shopcat)
     function js_in_array (needle, arr) {
      var has = false;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].goodsid == needle) {
          return true;
        }
      }
      return has;
    }
}

//封装的in_array函数


// ======================加入到购物车====================



//=========================== 购物车计算总价格==========================

function shopCarGetMoney(card) {
  var allMoeny = 0;
  for (var i = 0; i < card.length; i++) {
        allMoeny += card[i].price * card[i].count
  }
  return [allMoeny.toFixed(2),card.length];
}

//=========================== 购物车计算总价格==========================

//=========================== 购物监测库存==========================

function repertory (num,repertory,buypay){
 //mun 购买数量,repertory // 真实库存 buypay //购买上线
 if(num > repertory &&  num > buypay){
  wx.showToast({
    title: "库存不足",
    icon: "none",
    duration: 1500,
    mask: true
  })
  return false;
 }else if(num > buypay){
  wx.showToast({
    title: "数量较大请联系客服",
    icon: "none",
    duration: 1500,
    mask: true
  })
  return false;
 }
 return true;
}
module.exports = {
  http: http,
  httphos: httphos,
  showWarning: showWarning,
  showSuccess: showSuccess,
  isloginStatus: isloginStatus,
  showWarningText: showWarningText,
  joinShopCar: joinShopCar,
  shopCarGetMoney: shopCarGetMoney,
  repertory:repertory
}