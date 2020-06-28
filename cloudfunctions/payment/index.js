// 云函数入口文件
const key = "cUq3cGXAMfeTisWvOjDHtYARTMoI8kYW"//商户的key，32位。
const mch_id = "0123456789" //商户号

// 将以上的两个参数换成你的，然后以下可以不用改一个字照抄
const cloud = require('wx-server-sdk')
const rp = require('request-promise')
const crypto = require('crypto')
cloud.init()

function getSign(args) {
  let sa = []
  for (let k in args) sa.push(k + '=' + args[k])
  sa.push('key=' + key)
  return crypto.createHash('md5').update(sa.join('&'), 'utf8').digest('hex').toUpperCase()
}

function getXml(args) {
  let sa = []
  for (let k in args) sa.push('<' + k + '>' + args[k] + '</' + k + '>')
  sa.push('<sign>' + getSign(args) + '</sign>')
  return '<xml>' + sa.join('') + '</xml>'
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const appId = appid = wxContext.APPID
  const openid = wxContext.OPENID
  const attach = event.attach
  const body = event.body
  const total_fee = event.total_fee
  const notify_url = 'http://www.weixin.qq.com/wxpay/pay.php'
  const spbill_create_ip = '127.0.0.1'
  const nonceStr = nonce_str = Math.random().toString(36).substr(2, 15)
  const timeStamp = parseInt(Date.now() / 1000) + ''
  const out_trade_no = 'otn' + nonce_str + timeStamp
  const trade_type = 'JSAPI'
  const xmlArgs = {
    appid,
    attach,
    body,
    mch_id,
    nonce_str,
    notify_url,
    openid,
    out_trade_no,
    spbill_create_ip,
    total_fee,
    trade_type
  }
  let xml = (await rp({
    url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    method: 'POST',
    body: getXml(xmlArgs)
  })).toString("utf-8")
  if (xml.indexOf('prepay_id') < 0) return xml
  let prepay_id = xml.split("<prepay_id>")[1].split("</prepay_id>")[0].split('[')[2].split(']')[0]
  let payArgs = {
    appId,
    nonceStr,
    package: ('prepay_id=' + prepay_id),
    signType: 'MD5',
    timeStamp
  }
  return {
    ...payArgs,
    paySign: getSign(payArgs)
  }
}