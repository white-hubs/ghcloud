export class GeometryUtil {
  static distanceOfLine(points) {
    // const points = [...LnglatPoints].map(item => {
    //   return L.latLng(item[1], item[0]);
    // });
    const R = 6371000;

    // 累加总距离
    let totalDistance = 0;

    // 遍历所有点，计算每段的距离
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = points[i];
      const point2 = points[i + 1];
      // 将经纬度转换为弧度
      const lat1 = (Number(point1.lat) * Math.PI) / 180;
      const lon1 = (Number(point1.lng) * Math.PI) / 180;
      const lat2 = (Number(point2.lat) * Math.PI) / 180;
      const lon2 = (Number(point2.lng) * Math.PI) / 180;
      // 计算经纬度差值
      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      // Haversine 公式
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      // 计算每段的距离
      const segmentDistance = R * c;
      totalDistance += segmentDistance;
    }
    return totalDistance;
  }
}
