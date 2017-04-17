/** 
 * 阻止默认事件
 * @author zhongzhuhua
 */
export default function(e) {
  e.preventDefault();
  e.stopPropagation();
};
