var id;
var checkTimeFlag = true;
var checkInventoryFlag = false;

function triggerMouseEvent(a,c) {
  var b = document.createEvent("MouseEvents");
  b.initEvent(c,!0,!0);
  a.dispatchEvent(b);
}

// http://stackoverflow.com/questions/12395722/can-the-window-object-be-modified-from-a-chrome-extension
// The window object the content script sees is not the same window object that the page sees.
function injectFunc() {
  var elt = document.createElement('script');
  elt.innerHTML = 'window.setMdskipA=function(v){window.postMessage({type:"FROM_PAGE",value: v},"*")};';
  document.head.appendChild(elt);
}

function getInitItemDetail(d){
  try{
    var url='//mdskip.taobao.com/core/initItemDetail.htm?isAreaSell=false&showShopProm=false&sellerPreview=false&household=false&isUseInventoryCenter=false&progressiveSupport=false&queryMemberRight=true&isRegionLevel=false&cartEnable=false&isApparel=false&service3C=false&isSecKill=false&tryBeforeBuy=false&addressLevel=2&offlineShop=false&isForbidBuyItem=false&tmallBuySupport=true';
    // 修改了 callback 的函数为自己注入的函数
    var arr=['itemId='+id, 'callback=setMdskipA','timestamp='+(+new Date()),'cachedTimestamp='+(+new Date())];
    var reg=/[?&^](ip|campaignId|key|abt|cat_id|q|u_channel|areaId)=([^&]+)/g;
    var params=location.search;
    while(r=reg.exec(params)){arr.push(r[1]+"="+r[2]);}
    d.referrer && (arr.push("ref="+encodeURIComponent(d.referrer)));
    try {
        var head=d.head || d.getElementsByTagName("head")[0];
        var script=d.createElement("script");
        head.insertBefore(script,head.firstChild);
        script.src=url+'&'+arr.join("&");
    }
    catch(err){
        d.write('<script src="'+url+'&'+arr.join("&")+'" async="async"></'+'script>');
    }
  }catch(e){
    setTimeout(function(){throw err;},0);
  }
}

// 获得 page 传过来的 initItemDetail
window.addEventListener("message", function(event) {
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    var v = event.data.value;
    if (checkTimeFlag && v.defaultModel && v.defaultModel.tradeResult && v.defaultModel.tradeResult.startTime) {
      // 获取开卖时间
      checkTime(v.defaultModel.tradeResult.startTime);
    } else {
      console.log('获取开卖时间失败');
      location.reload();
    }
    if (checkInventoryFlag && v.defaultModel && v.defaultModel.inventoryDO && v.defaultModel.inventoryDO.icTotalQuantity) {
      checkInventory(v.defaultModel.inventoryDO.icTotalQuantity);
    } else {
      console.log('获取库存失败');
      location.reload();
    }
  }
}, false);

function sleep(sleepTime) {
  for(var start = Date.now(); Date.now() - start <= sleepTime;) { }
}

function checkTime(t) {
  while(t - (+new Date()) >= 750) {  // 提前重新加载
    console.log(t - (+new Date()));
    sleep(300);
  }

  if (t - (+new Date()) >= -5000) {
    // 5秒之内开枪
    location.reload();
  } else {
    // 查库存
    getInventory();
  }
}

function getInventory() {
  checkInventoryFlag = true;
  checkTimeFlag = false;
  console.log('getInventory');
  getInitItemDetail(document);
}

function checkInventory(v) {
  while (v <= 0) {
    sleep(500);
    getInventory();
  }
  location.reload();
}

function buy() {
  if (document.getElementById('J_LinkBuy')) {
    document.getElementById('J_LinkBuy').click();
  }
}

var href = window.location.href;
if (href.search('world.tmall.com/item/') >= 0 || href.search('detail.tmall.com/item') >= 0 || href.search('detail.tmall.hk/hk/item') >= 0) {
  // 先尝试直接购买
  buy();

  // 先获取商品 id
  if (document.getElementById('LineZing')) {
    id = document.getElementById('LineZing').getAttribute('itemid');
  } else {
    console.log('获取商品 ID 失败');
    location.reload();
  }

  if (!id) {
    console.log('获取商品 ID 失败');
    location.reload();
  }

  setTimeout(function () {
    injectFunc();
    getInitItemDetail(document, id);
  }, 1000);
}

if (href.search('buy.tmall.com') >= 0 || href.search('buy.tmall.hk') >= 0) {
  var timer1 = setInterval(function() {
    if (document.getElementById('J_AgreePrePay')) {
      document.getElementById('J_AgreePrePay').click();
      clearInterval(timer1);
      if (document.getElementById('J_Go')) {
        var a = document.getElementById('J_Go');
        triggerMouseEvent(a,"mouseover");
        triggerMouseEvent(a,"mousedown");
        triggerMouseEvent(a,"mouseup");
        triggerMouseEvent(a,"click");
      }
      if (document.querySelector('[id^=checkCode_]')) {
        var codeIpt = document.querySelector('[id^=checkCode_]');
        codeIpt.focus();
        setTimeout(function () {
          codeIpt.scrollIntoView();
        }, 800);
      }
    }

  }, 400);
}