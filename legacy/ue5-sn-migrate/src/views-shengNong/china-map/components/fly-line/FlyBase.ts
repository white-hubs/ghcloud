import * as THREE from 'three';

interface flyLineBegin2End {
  begin: number[];
  end: number[];
  height: number;
}

export default abstract class FlyBase {
  // 必须声明的属性
  abstract scene: THREE.Scene // 场景
  abstract data: Array<flyLineBegin2End>; // 传入的数据
  abstract ThreeGroup: THREE.Group; // 存放实体

  // 实现的方法
  abstract _draw() : THREE.Group; // 添加场景
  abstract _remove() : void; // 移除实体
  abstract _animate() : void; // 开启动画
}