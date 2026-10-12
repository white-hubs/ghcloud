import { useEffect, useState } from 'react'

interface Props {
  active: boolean;
}

export const AllIcon = ({ active }: Props): JSX.Element => {

  const [color, setColor] = useState<string>('#808AA0')
  useEffect(() => {
    setColor(active ? '#1578FF' : '#808AA0')
  }, [active])


  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 14 14" version="1.1">
      <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="AI待办" transform="translate(-74, -81)" stroke={color}>
          <g id="编组-2" transform="translate(0, 50)">
            <g id="编组备份" transform="translate(74, 31)">
              <path d="M12,0.525 C12.40731,0.525 12.77606,0.690094998 13.0429825,0.957017498 C13.309905,1.22394 13.475,1.59269 13.475,2 L13.475,8 C13.475,9.5118795 12.8621898,10.8806295 11.8714096,11.8714096 C10.8806295,12.8621898 9.5118795,13.475 8,13.475 L2,13.475 C1.59269,13.475 1.22394,13.309905 0.957017498,13.0429825 C0.690094998,12.77606 0.525,12.40731 0.525,12 L0.525,2 C0.525,1.59269 0.690094998,1.22394 0.957017498,0.957017498 C1.22394,0.690094998 1.59269,0.525 2,0.525 Z" id="形状" strokeWidth="1.05" fillRule="nonzero" />
              <rect id="矩形" fill="#D8D8D8" x="3" y="4.5" width="6" height="1" rx="0.5" />
              <rect id="矩形备份-7" fill="#D8D8D8" x="3" y="7.5" width="3" height="1" rx="0.5" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}