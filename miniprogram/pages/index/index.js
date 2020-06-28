//index.js
const app = getApp()

Page({
  data: {

  },

  onLoad: function () {

  },

  payment() {
    console.log('点击支付')
    // 支付一分钱
    wx.cloud.callFunction({
      name: 'payment',
      data: { body: 'body', attach: 'attach', total_fee: parseFloat(0.01).toFixed(2) * 100 },
      success: res => {
        console.log(res)
        if (!res.result.appId) return
        wx.requestPayment({
          ...res.result,
          success: res => {
            console.log(res)
          }
        })
      }, fail: console.error
    })
  },

  livestreaming() {
    console.log('进入直播')
  }

})