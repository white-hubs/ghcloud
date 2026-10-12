const BASE = '/resource/v1/wholesaler-migrate/icons/icon'
const iconNames = [
  'close',
  'control',
  'data',
  'down',
  'location',
  'message',
  'up',
]
export default iconNames.map(name => ({
  name,
  src: `${BASE}/${name}.png`,
  type: 'png',
}))
