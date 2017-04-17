/*
 *@description 注册、登录、找回密码中用到的公共方法
 *@author yuxiaoli 2017-03-27
 */

import Configs from 'api/configs';
import {
  setItem
} from 'business/Cache';

/*
 *跳转到获取code码页面的链接
 *@params realLink 真正需要跳转的链接，比如需要跳转到inputpwd页面，则realLink='#/inputpwd'
 */
export function getWxCondeLink(realLink){
  if(!!realLink){
  	let link='',
        ua=window.navigator.userAgent.toLowerCase();
    if(ua.includes('micromessenger')){
      link=Configs.wxLink+'?appid='+Configs.openId+'&redirect_uri='+encodeURIComponent(Configs.h5Prd+realLink)+Configs.wxParams;
      console.log(link);
      window.location.href=link;
    }else{
      location.hash=realLink;
    };
  }
};

/*
 *设置需要回退的页面
 */
export function setGobackPage(state) {
  let {
    gobackPage,
    userInfoForLogin
  } = state;
  if (!!userInfoForLogin) {
    userInfoForLogin.gobackPage = gobackPage - 1;
    setItem('userInfoForLogin', userInfoForLogin);
  }
};

