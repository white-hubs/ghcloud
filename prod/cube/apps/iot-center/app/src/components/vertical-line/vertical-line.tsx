import type { ReactElement } from 'react'

interface Props {
  title?: string;
}

export const VerticalLine = (props: Props): ReactElement => {
  return (<span className='verticalLine primary-color-before'>{props.title ?? ''}</span>)
}
