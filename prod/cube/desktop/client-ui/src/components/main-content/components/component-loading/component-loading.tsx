import styles from './component-loading.module.less'

export const ComponentLoading = (): JSX.Element => {
  return (
    <div class={styles['client-loading']}>
      <div class={`${styles['sk-cube']} ${styles['sk-cube1']}`}></div>
      <div class={`${styles['sk-cube']} ${styles['sk-cube2']}`}></div>
      <div class={`${styles['sk-cube']} ${styles['sk-cube3']}`}></div>
      <div class={`${styles['sk-cube']} ${styles['sk-cube4']}`}></div>
      <div class={`${styles['sk-cube']} ${styles['sk-cube5']}`}></div>
      <div class={`${styles['sk-cube']} ${styles['sk-cube6']}`}></div>
      <div class={`${styles['sk-cube']} ${styles['sk-cube7']}`}></div>
      <div class={`${styles['sk-cube']} ${styles['sk-cube8']}`}></div>
      <div class={`${styles['sk-cube']} ${styles['sk-cube9']}`}></div>
    </div>
  );
};