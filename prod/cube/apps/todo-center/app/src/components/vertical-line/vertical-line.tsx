import { createStyles } from 'antd-style'
interface Props {
  title?: string;
}

const useStyle = createStyles(({ token, css }) => {
  return {
    verticalLine: css`
      position: relative;
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      color: #000;
      &:before {
        content: "";
        display: inline-block;
        width: 3px;
        height: 18px;
        margin-right: 8px;
        vertical-align: middle;
        background: ${token['colorPrimary']};
      }
    `,
  }
})

export const VerticalLine = (props: Props): JSX.Element => {
  const { styles } = useStyle()

  return (<span className={styles.verticalLine}>{props.title ?? ''}</span>)
}
