import { createStyles } from 'antd-style'
import React from 'react'
const logo = '/resource/v1/ai-assistant/logo.svg'

const useStyle = createStyles(({ token, css }) => {
  return {
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
  }
})
export const Logo: React.FC = () => {
  const { styles } = useStyle()

  return (
    <div className={styles.logo}>
      <img
        src={logo}
        draggable={false}
        alt='logo'
      />
      <span>开河智能体</span>
    </div>
  )
}
