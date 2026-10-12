安全监管
  - 安全分析H5
  - 安全监管 web 子应用 （应当包含总部和二级市场）
      - 二级市场总共是两个路由 
        /auth ---> /src/views/market-auth/market-auth.tsx
        /monthly-report ---> /src/views/market-auth/market-auth.tsx

        这里需要注意一下 router.ts 里面关于/monthly-report路由的骚操作