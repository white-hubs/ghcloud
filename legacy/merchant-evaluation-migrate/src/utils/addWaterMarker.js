/**
 * 添加水印 nmy
 */

const addWaterMarker = (imgUrl, waterMarkers) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const { width, height } = image;

      // 创建canvas画布
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      // 加入body中
      // document.body.append(canvas);
      // canvas.style.position = 'fixed';
      // canvas.style.top = '0';
      // canvas.style.zIndex = 1000;
      // 绘制底图
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);

      // 绘制水印
      // 1. 先绘制边框
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, height - 30 - 20 * waterMarkers.length, width - 20, 100);
      // ctx.fillRect();
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.font = '12px sans-serif';
      // ctx.fillText('巡检时间: 2021-08-30 12:12:24', 20, height - 85);
      // ctx.fillText('巡检人员: 总部管理员', 20, height - 65);
      // ctx.fillText('所属区域: 园区/1F', 20, height - 45);
      // ctx.fillText('详细地址: 园区/1F收到回复开始的', 20, height - 25);
      waterMarkers.forEach((text, index) => {
        ctx.fillText(
          text,
          25,
          height - 20 * waterMarkers.length - 5 + 20 * index,
        );
      });
      resolve(canvas.toDataURL());
    };

    // load 图片
    image.src = imgUrl;
  });
};

export default addWaterMarker;

/**
 *
 * @param { Blob } file
 * @param { String[] } waterMarkers
 * @returns Blob
 */
const addWaterMarkerByFile = (file, waterMarkers) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const { width, height } = image;

      // 创建canvas画布
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      // 加入body中
      // document.body.append(canvas);
      // canvas.style.position = 'fixed';
      // canvas.style.top = '0';
      // canvas.style.zIndex = 1000;
      // 绘制底图
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);

      // 绘制水印
      // 1. 先绘制边框
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(
        10,
        height - 30 - 20 * waterMarkers.length,
        width - 20,
        20 * waterMarkers.length,
      );
      // ctx.fillRect();
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.font = '12px sans-serif';
      // ctx.fillText('巡检时间: 2021-08-30 12:12:24', 20, height - 85);
      // ctx.fillText('巡检人员: 总部管理员', 20, height - 65);
      // ctx.fillText('所属区域: 园区/1F', 20, height - 45);
      // ctx.fillText('详细地址: 园区/1F收到回复开始的', 20, height - 25);
      waterMarkers.forEach((text, index) => {
        ctx.fillText(
          text,
          25,
          height - 20 * waterMarkers.length - 5 + 20 * index,
        );
      });
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    };
    // 读取文件
    const reader = new FileReader();
    reader.onload = () => {
      // load 图片
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

export { addWaterMarkerByFile };
