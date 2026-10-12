
function getImageBase64Data(imgSrc) {
  function getBase64(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    //默认png背景透明，添加背景白色
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    var dataURL = canvas.toDataURL('image/png');
    return dataURL;
  }

  var p = new Promise(function (resolve, reject) {
    var image = new Image();
    // 图片服务器需要允许跨域
    image.crossOrigin = 'Anonymous';
    image.src = imgSrc;
    image.onload = function () {
      var imageBase64Data = getBase64(image);
      resolve(imageBase64Data);
    }
  });
  return p;
}
export const copyImage = async (url) => {
  try {
    const res = await getImageBase64Data(url)
    const data = await fetch(res);
    const blob = await data.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
    return true
  } catch (err) {
    return false
  }


}
