/**
 * @param {raduis} Number|Array 全部|[上左, 上右, 下右, 下左]
 */
export const createRoundRectPath = ({ width, height, raduis }) => {
  if (typeof raduis === 'number') {
    raduis = [raduis, raduis, raduis, raduis];
  }
  const [ulr = 0, urr = 0, drr = 0, dlr = 0] = raduis;
  let path = `
    M ${ulr} 0 L ${width - urr} 0 
    C ${width - urr} 0 ${width} 0 ${width} ${urr}
    L ${width} ${height - drr} 
    C ${width} ${height - drr} ${width} ${height} ${width - drr} ${height} 
    L ${dlr} ${height}
    C ${dlr} ${height} 0 ${height} 0 ${height - dlr} 
    L 0 ${ulr} 
    C 0 ${ulr} 0 0 ${ulr} 0 
    Z
  `;
  return path;
};
