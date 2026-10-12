/*地图水波扩散特效 Start*/
let requestAnimationFrame =
  window.requestAnimationFrame || window.webkitRequestAnimationFrame;
let cancelAnimationFrame =
  window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
/**
 * sos告警圆形范围绘制(只有存在map对象时才可以使用)
 * @param radius 半径
 * @param level 层数
 * @param point BMap.Point对象，圆的中心点
 * @param color  颜色对象，包含{fillColor,fillOpacity}
 * @constructor
 */

export function TCircleShow(map, radius, level = 4, point, color, icon) {
  if (!map || !L || !L.Circle) {
    return undefined;
  }
  if(map.mapInstance){
    map = map.mapInstance;
  }

  this.radius = radius;
  this.level = Number(level);
  this.latlng = point;
  this.color = color;

  if (Number.isNaN(this.level)) {
    this.level = 1; // 至少 1 层
  }

  if (!this.color || !this.color.fillColor) {
    this.color = {
      fillColor: "blue", // 默认蓝色
      fillOpacity: 0.5 // 默认初始透明度 0.5
    };
  }

  // 计算平均每段扩展距离的透明度
  this.endOpacity = 0.1; // 终止透明度设置为 0.1
  this.speedOpacity = (this.color.fillOpacity - this.endOpacity) / this.radius; // 每米的透明度变化
  // 先加一层白色的覆盖物，表示覆盖范围
  this.circle0 = L.circle(this.latlng, {
    radius: this.radius,
    fillColor: "rgba(255, 147, 20, 0)",
    fillOpacity: this.color.fillOpacity,
    color: "rgba(255, 147, 20, 0)",
    opacity: this.color.fillOpacity,
    weight: 1,
    fill: true
  }).addTo(map);
  // 按层数循环构造覆盖物
  this.circles = [];
  for (let i = 1; i < this.level; i++) {
    let circle = L.circle(this.latlng, {
      radius: 0,
      fillColor: this.color.fillColor,
      fillOpacity: this.color.fillOpacity,
      color: this.color.fillColor,
      opacity: this.color.fillOpacity,
      weight: 1,
      fill: true
    }).addTo(map);
    this.circles.push(circle);
  }

  this.clock = new Array(this.level);
}

/**
 * 动画启动
 * @param distance 波纹间隔时间（单位 ms）
 * @param t0 扩散一次所需的时间
 */
TCircleShow.prototype.start = function (distance, t0) {
  let _self = this;

  /**
   * 定义动画函数
   * @param startTime 启动的初始时间
   * @param circle 圆形覆盖物对象
   * @param index 序号
   */
  function animateStart(startTime, circle, index) {
    // 计算时间差
    let time = new Date().getTime() - startTime;
    if (time < 0) {
      circle.setRadius(0); // 半径
      circle.setStyle({
        fillOpacity: _self.color.fillOpacity,
        opacity: _self.color.fillOpacity
      });
      // 如果未达到执行时间则直接等待
      _self.clock[index] = requestAnimationFrame(animateStart.bind(null, startTime, circle, index));
      return;
    }

    // 计算当前半径
    // 匀减速运动下，每隔 t 时间，应该扩散的半径:
    // r = r0 * (2 * t / t0 - t * t / t0^2)
    // 其中，r0 为最终的扩散半径，即 this.radius
    let r = Math.floor(_self.radius * (2 * time / t0 - time * time / t0 / t0));
    let opacity = 0;

    if (time >= t0) {
      // 达到运行时间之后
      // 设置圆形覆盖物的样式
      circle.setRadius(_self.radius); // 半径
      circle.setStyle({
        fillOpacity: _self.endOpacity,
        opacity: _self.endOpacity
      });

      startTime = new Date().getTime() + distance; // 起始时间设置为当前时间加上 1 倍的时间间隔
      _self.clock[index] = requestAnimationFrame(animateStart.bind(null, startTime, circle, index));
    } else {
      // 计算透明度
      opacity = _self.color.fillOpacity - Number((_self.speedOpacity * r).toFixed(5)); // 四舍五入小数点后 5 位

      // 设置圆形覆盖物的样式
      circle.setRadius(r); // 半径
      circle.setStyle({
        fillOpacity: opacity,
        opacity: opacity
      });

      _self.clock[index] = requestAnimationFrame(animateStart.bind(null, startTime, circle, index));
    }
  }

  // 循环每一层执行动画
  for (let [index, circle] of this.circles.entries()) {
    animateStart(new Date().getTime() + index * distance, circle, index);
  }
};

/**
* 停止动画
*/
TCircleShow.prototype.stop = function () {
  for (let caf of this.clock) {
    cancelAnimationFrame(caf);
  }

  // 重置覆盖物样式
  for (let circle of this.circles) {
    circle.setRadius(0); // 半径
    circle.setStyle({
      fillOpacity: this.color.fillOpacity,
      opacity: this.color.fillOpacity
    });
  }

  this.clock = null;
};

/**
* 移除覆盖物
*/
TCircleShow.prototype.remove = function (map) {
  // 停止动画
  for (let caf of this.clock) {
    cancelAnimationFrame(caf);
  }

  map.mapInstance.removeLayer(this.circle0);
  for (let circle of this.circles) {
    map.mapInstance.removeLayer(circle);
  }
};
