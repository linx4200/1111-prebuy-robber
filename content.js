function triggerMouseEvent(a,c) {
  var b = document.createEvent("MouseEvents");
  b.initEvent(c,!0,!0);
  a.dispatchEvent(b);
}

function injectFunc() {
  var elt = document.createElement('script');
  elt.innerHTML = 'window.setMdskipA=function(v){window.postMessage({type:"FROM_PAGE",value: v},"*")};';
  document.head.appendChild(elt);
}

function checkInventory(w,d){
  try{
    var url='//mdskip.taobao.com/core/initItemDetail.htm?isAreaSell=false&showShopProm=false&sellerPreview=false&household=false&isUseInventoryCenter=false&progressiveSupport=false&queryMemberRight=true&itemId=523046582651&isRegionLevel=false&cachedTimestamp=1445665953249&cartEnable=false&isApparel=false&service3C=false&isSecKill=false&tryBeforeBuy=false&addressLevel=2&offlineShop=false&startSellTime=1445666400000&isForbidBuyItem=false&tmallBuySupport=true';
    if(!url){return;}
    var arr=['callback=setMdskipA','timestamp='+(+new Date())];
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

function buy() {
  if (document.getElementById('J_LinkBuy')) {
    document.getElementById('J_LinkBuy').click();
  }
}

window.addEventListener("message", function(event) {
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    // 没有可用库存
    var v = event.data.value;
    // 检查时间
    if (!v.defaultModel || !v.defaultModel.tradeResult || v.defaultModel.tradeResult.startTime - (+new Date()) > 0) {
      // checkInventory(window, document);
      checkTime(v.defaultModel.tradeResult.startTime);
    } else {
      // buy();
      // location.reload();
    }
  }
}, false);

function checkTime (t) {
  alert(t - (+new Date()));
  if (t - (+new Date()) <= 0) {
    location.reload();
  } else {
    checkTime(t);
  }
}

var href = window.location.href;
if (href.search('world.tmall.com/item/') >= 0 || href.search('detail.tmall.com/item') >= 0 || href.search('detail.tmall.hk/hk/item') >= 0) {
    buy();
    checkTime(1445691600000);  // 2015-10-24 21:00:00
}

if (href.search('buy.tmall.com') >= 0 || href.search('buy.tmall.hk')) {
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
    }
  }, 400);
}