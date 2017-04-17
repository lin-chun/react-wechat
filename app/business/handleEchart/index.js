export function getQrnhSevth(data) {
	let arr = {
	  xList: [],
	  yList: []
	};
	for (let i = 0; i < data.length; i++) {
	  const item = data[i];
	  item.qrnhDate = item.qrnhDate.replace(/^(.{6})(.*)$/,"$1-$2");
	  if (item.qrnhDate.substr(4, 1) == '0') {
	    arr.xList.push(item.qrnhDate.substring(5, item.length));
	  } else {
	    arr.xList.push(item.qrnhDate.substring(4, item.length));
	  }
	  arr.yList.push(item.qrnh);
	};
	return arr;
};
export function usualSevth(data) {
	let arr = {
	  xList: [],
	  yList: []
	};
	for (let i = 0; i < data.length; i++) {
	  const item = data[i];
	  if (item.qrnhDate.substr(4, 1) == '0') {
	    arr.xList.push(item.qrnhDate.substring(5, item.length));
	  } else {
	    arr.xList.push(item.qrnhDate.substring(4, item.length));
	  }
	  arr.yList.push(item.qrnh);
	};
	return arr;
};
export function getMillSevth(data) {
	let arr = {
	  xList: [],
	  yList: []
	};
	for (let i = 0; i < data.length; i++) {
	  const item = data[i];
	  item.wfsyDate = item.wfsyDate.replace(/^(.{6})(.*)$/,"$1-$2");
	  if (item.wfsyDate.substr(4, 1) == '0') {
	    arr.xList.push(item.wfsyDate.substring(5, item.length));
	  } else {
	    arr.xList.push(item.wfsyDate.substring(4, item.length));
	  }
	  arr.yList.push(item.wfsy);
	};
	return arr;
};
