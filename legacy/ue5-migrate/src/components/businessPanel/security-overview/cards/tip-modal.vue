<template>
  <div class="tip-modal">
    <div class="title h1">
      风险指数说明
    </div>
    <div class="name">
      通过安全报警数据、报警响应数据、风险隐患数据、隐患响应数据、危险源建档数据等数据指标综合评估各市场的安全风险值
    </div>
    <div class="title  h1">
      得分说明  
    </div>
    <div class="name">
      总分100分
    </div>
    <div class="name"><div class="title">【0分-60分属于高风险】</div>，需要重点关注</div>
    <div class="name"><div class="title">【61分-80分属于中等风险】</div>，可选择性关注</div>
    <div class="name"><div class="title">【81分-100分属于运行良好】</div></div>
    <div class="title h1">指标解释</div>
    <div class="title-sub"> 1、分析维度：</div>
    <div class="name">
      通过以下5大类指标数据，分别设置权重、计算公式计算得出指数，指标及指标数据权重占比如下：
    </div>
    <div class="name" style="margin: 5px 0;">
      （1）安全报警数据（2）报警响应数据（3）风险隐患数据（4）隐患响应数据（5）风险源建档数据
    </div>
    <!-- <div class="name mt-10px"> 指标数据权重占比如下：</div> -->
    <div class="table-wrap">
      <div class='wrap'>
        <div class="name mt-10px">报警数据</div>
        <div class="table">
          <div class="cell title">
            <div class="item">指标项</div>
            <div class="item">权重占比</div>
          </div>
          <div class="cell">
            <div class="item">一级报警</div>
            <div class="item">200%</div>
          </div>
          <div class="cell">
            <div class="item">二级报警</div>
            <div class="item">50%</div>
          </div>
          <div class="cell">
            <div class="item">三/四级报警</div>
            <div class="item">20%</div>
          </div>
          <div class="cell">
            <div class="item"></div>
            <div class="item"></div>
          </div>
          <div class="cell">
            <div class="item"></div>
            <div class="item"></div>
          </div>
        </div>
      </div>
      <div class='wrap'>
        <div class="name mt-10px">报警响应</div>
        <div class="table">
          <div class="cell title">
            <div class="item">指标项</div>
            <div class="item">权重占比</div>
          </div>
          <div class="cell">
            <div class="item">一级报警</div>
            <div class="item">200%</div>
          </div>
          <div class="cell">
            <div class="item">二级报警</div>
            <div class="item">50%</div>
          </div>
          <div class="cell">
            <div class="item">三/四级报警</div>
            <div class="item">20%</div>
          </div>
          <div class="cell">
            <div class="item">隐患数量</div>
            <div class="item">50%</div>
          </div>
          <div class="cell">
            <div class="item">隐患响应情况</div>
            <div class="item">80%</div>
          </div>
        </div>
      </div>
    </div>
    <div class="title-sub"> 2、整体计算步骤：</div>
    <div class="name" style="margin: 5px 0;">（1）按既定公式分别计算上述5类指标的指数值，计算公式如下：
    <div class="name">安全报警数据：<div class="title">安全报警数量*报警权重/报警设备数</div>（根据实际报警数据，分别计算一级、二级、三级、四级报警数据的指数值）</div>
    <div class="name">报警响应数据：<div class="title">报警未响应率*报警响应权重</div>（根据实际报警数据，分别计算一级、二级、三级、四级报警响应数据的指数值）</div>
    <div class="name">风险隐患数据：<div class="title">隐患数量*隐患权重/市场面积</div></div>
    <div class="name">隐患响应数据：<div class="title">隐患未处理率*隐患响应权重</div></div>
    <div class="name">风险源建档：<div class="title">查询建档情况，若未建档则赋分值</div></div>
    <div class="name" style="margin: 5px 0 10px 0;">（2）根据实际数据量测算，分别设置指标值对应的得分区间，指标值的得分区间如下：</div>
    <div class="table-wrap">
      <div class='wrap'>
        <div class="name mt-10px">安全报警数量，总分值30分</div>
        <div class="table">
          <div class="cell title">
            <div class="item">区间值</div>
            <div class="item">分数</div>
          </div>
          <div class="cell">
            <div class="item">0.13以上</div>
            <div class="item">30</div>
          </div>
          <div class="cell">
            <div class="item">0.08-0.13</div>
            <div class="item">20-30</div>
          </div>
          <div class="cell">
            <div class="item">0.03-0.08</div>
            <div class="item">10-20</div>
          </div>
          <div class="cell">
            <div class="item">0.01-0.03</div>
            <div class="item">5-10</div>
          </div>
          <div class="cell">
            <div class="item">0-0.01</div>
            <div class="item">0-5</div>
          </div>
        </div>
      </div>
      <div class='wrap'>
        <div class="name mt-10px">报警响应数据，总分值30分</div>
        <div class="table">
          <div class="cell title">
            <div class="item">区间值</div>
            <div class="item">分数</div>
          </div>
          <div class="cell">
            <div class="item">1.6-2</div>
            <div class="item">30</div>
          </div>
          <div class="cell">
            <div class="item">1-1.6</div>
            <div class="item">20-30</div>
          </div>
          <div class="cell">
            <div class="item">0.5-1</div>
            <div class="item">10-20</div>
          </div>
          <div class="cell">
            <div class="item">0.1-0.5</div>
            <div class="item">5-10</div>
          </div>
          <div class="cell">
            <div class="item">0-0.1</div>
            <div class="item">0-5</div>
          </div>
        </div>
      </div>
      <div class='wrap'>
        <div class="name mt-10px">风险隐患数据，总分值10分</div>
        <div class="table">
          <div class="cell title">
            <div class="item">区间值</div>
            <div class="item">分数</div>
          </div>
          <div class="cell">
            <div class="item">5以上</div>
            <div class="item">10</div>
          </div>
          <div class="cell">
            <div class="item">2.5-5</div>
            <div class="item">3-5</div>
          </div>
          <div class="cell">
            <div class="item">2-2.5</div>
            <div class="item">1-3</div>
          </div>
          <div class="cell">
            <div class="item">0-2</div>
            <div class="item">0-1</div>
          </div>
          <div class="cell">
            <div class="item"></div>
            <div class="item"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="table-wrap">
      <div class='wrap'>
        <div class="name mt-10px">隐患响应数量，总分值10分</div>
        <div class="table">
          <div class="cell title">
            <div class="item">区间值</div>
            <div class="item">分数</div>
          </div>
          <div class="cell">
            <div class="item">0.64-0.8</div>
            <div class="item">5-10</div>
          </div>
          <div class="cell">
            <div class="item">0.4-0.64</div>
            <div class="item">2-5</div>
          </div>
          <div class="cell">
            <div class="item">0.16-0.4</div>
            <div class="item">1-2</div>
          </div>
          <div class="cell">
            <div class="item">0-0.16</div>
            <div class="item">0-1</div>
          </div>
        </div>
      </div>
      <div class='wrap'>
        <div class="name mt-10px">风险源建档数据，总分值20分</div>
        <div class="table">
          <div class="cell title">
            <div class="item">区间值</div>
            <div class="item">分数</div>
          </div>
          <div class="cell">
            <div class="item">易燃设备未建档</div>
            <div class="item">5</div>
          </div>
          <div class="cell">
            <div class="item">消防设备未建档</div>
            <div class="item">10</div>
          </div>
          <div class="cell">
            <div class="item">电动车未建档</div>
            <div class="item">5</div>
          </div>
          <div class="cell">
            <div class="item"></div>
            <div class="item"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="name">（3）根据实际数据的指数值区间以及既定的分数区间，应用斜率公式计算最终得分</div>
    <div class="name" style="margin: 5px 0;">（4）汇总5类指标的得分，最终得出安全风险分数，取反值</div>
  </div>
  </div>ß
</template>

<style lang="less" scoped>
:deep(.ant-modal-content) {
  background: rgba(7,20,52,0.90) !important;
}
:deep(.ant-modal-content .ant-modal-header .ant-modal-title){
    font-size: 20px;
    font-family: "YouSheBiaoTiHei";
    font-weight: 400;
    color: #fff;
}
:deep(.ant-modal .ant-modal-content .ant-modal-header){
  background: url("/resource/v1/ue5-migrate/assets/images/sn/nav-bg.png") no-repeat;
  background-size: 100% 100%;
}
:deep(.ant-modal .ant-modal-content .ant-modal-body){
  box-shadow: 0px -10px 40px #2f76ff inset;
}
.tip-modal {
  max-height: 628px;
  overflow-y: scroll;
  .name{
    font-size: 14px;
    font-family: Source Han Sans CN, Source Han Sans CN-Regular;
    font-weight: Medium;
    color: #C8DBFF;
    line-height: 24px;
    display: block;
    .title{
      font-size: 14px;
      font-family: Source Han Sans CN, Source Han Sans CN-Regular;
      font-weight: 700;
      color: #fff;
      display: inline-block;
    }
  }
  .title{
    font-size: 16px;
    font-family: Source Han Sans CN, Source Han Sans CN-Medium;
    font-weight: Medium;
    color: #fff;
    line-height: 28px;
    display: block;
  }
  .h1{
    font-size: 17px;
    font-family: Source Han Sans CN, Source Han Sans CN-Medium;
    font-weight: bold;
    margin: 6px 0;
  }
  .title-sub{
    font-size: 14px;
    line-height: 28px;
    font-family: Source Han Sans CN, Source Han Sans CN-Medium;
    font-weight: Medium;
    color: #fff;
  }
  .table-wrap{
    display: flex;
    .wrap{
      margin-left: 20px;
      margin-bottom: 15px;
    }
    .name{
      line-height: 14px;
    }
    .table{
      width: 272px;
      background: rgba(54,93,174,0.05);
      border: 1px solid rgba(54,93,174,0.50);
      border-radius: 2px;
      .cell{
        display: flex;
        align-items: center;
        font-size: 13px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Medium;
        color: #fff;
        line-height: 13px;
        border-bottom: 1px solid rgba(54,93,174,0.45);
        &:last-child{
          border-bottom: none;
        }
        .item{
          flex:1;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 32px;
          border-right: 1px solid rgba(54,93,174,0.45);
          &:last-child{
            border-right: none;
          }

        }
        &.title{
          background: rgba(54,93,174,0.20);
          font-size: 14px;
          font-family: Source Han Sans CN, Source Han Sans CN-Medium;
          font-weight: Medium;
          color: #fff;
        }
      }
    }
  }
  .mt-10px{
    margin-bottom: 10px;
  }
}
</style>
