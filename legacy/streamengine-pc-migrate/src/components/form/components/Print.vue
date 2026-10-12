<template>
  <div id="printFrom">
    <!--催办申请-->
    <template v-if="businessType === 'OFFICIAL_URGENT_WORK'">
      <div class="box-outer box">
        <div class="head">催办申请</div>
        <table>
          <tr>
            <td width="200px">催办事项</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">工作要求</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">办理时限</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">完成状态</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">下一步工作措施描述</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">办理情况反馈</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">未完成原因或需要协同解决的问题</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">承办负责人意见</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">承办部门分管领导意见</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!--来文处理-->
    <template v-if="businessType === 'OFFICIAL_DOCUMENT_RECEIVED'">
      <div class="box-outer box">
        <div class="head">来文处理</div>
        <table>
          <tr>
            <td width="200px">来文单位</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">来文字号</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">收文时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">收文编号</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">行政中心拟办意见</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">董事长意见</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">总经理意见</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">分管领导意见</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">承办部门处理意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">承办部门分管领导意见</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!--文件传阅-->
    <template v-if="businessType === 'OFFICIAL_DOCUMENT_CIRCULATION'">
      <div class="box-outer box">
        <div class="head">文件传阅</div>
        <table>
          <tr>
            <td width="200px">来文单位</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">发文好</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">来文时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">文件名称</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!--部门工作重点-->
    <template v-if="businessType === 'OFFICIAL_KEY_WORK'">
      <div class="box-outer box">
        <div class="head">部门工作重点</div>
        <table>
          <tr>
            <td width="200px">填报部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">工作事项</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">工作目标</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">时间进度安排</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">责任人</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">完成情况说明</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">部门责任人</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">分管领导</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!-- 制度意见征求 -->
    <template v-if="businessType === 'OFFICIAL_REGULATION'">
      <div class="box-outer box">
        <div class="head">制度意见征求</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">文件标题</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">起草部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">征求时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">反馈时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">文件标题</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">文件标题</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">文件标题</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">文件标题</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!-- 印章使用审批 -->
    <template v-if="businessType === 'OFFICIAL_SEAL'">
      <div class="box-outer box">
        <div class="head">用印申请</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">文件名称</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">份数</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">用章事由</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">印章类别</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">用章部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">用章时间</td>
            <td></td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: left">
              本人已详尽阅读并遵守《公司印章管理制度》的规定，并保证本《表单名称》表单所填内容真实、资料准确无误，附件与盖章内容一致。
              <span>发起人签名</span>
            </td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">文件附件</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!-- 领导班子会议议题预报 -->
    <template v-if="businessType === 'OFFICIAL_TOPIC'">
      <div class="box-outer box">
        <div class="head">领导班子会议议题预报</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">提议部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">预报时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">议题名称</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">意见</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!-- 督办通知 -->
    <template v-if="businessType === 'OFFICIAL_FOCUS_WORK'">
      <div class="box-outer box">
        <div class="head">督办通知</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">督办事项</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">督办依据</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">责任部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">第一责任人</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">第二责任人</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">工作要求</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">完成时限</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">行政中心意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">行政分管领导意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">总经理</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">董事长</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!-- 督办事项完成进度 -->
    <template v-if="businessType === 'OFFICIAL_FOCUS_WORK_REPLY'">
      <div class="box-outer box">
        <div class="head">督办事项完成进度</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">督办事项</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">完成时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">工作进度</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">完成状态</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">下一步工作措施描述</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">未完成原因</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">需要协同解决的问题作措施</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">责任人意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">分管领导意见</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!-- 督办事项工作目标及计划调整申请 -->
    <template v-if="businessType === 'OFFICIAL_FOCUS_WORK_UPDATE'">
      <div class="box-outer box">
        <div class="head">督办事项工作目标及计划调整申请</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">申请部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">督办事项</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">原工作要求</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">调整原因描述</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">调整后的工作目标、计划</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">完成时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">部门负责人意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">分管领导意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">总经理</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">董事长</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
	<!-- =========人事管理============ -->
    <!-- 招聘申请表 -->
    <template v-if="businessType === 'PERSONNEL_RECRUIT'">
      <div class="box-outer box">
        <div class="head">招聘申请表</div>
        <div class="head_sub">申请部门：代入发起人部门</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">职位名称</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">岗位名称</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">增补人数</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">到岗时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">招聘原因</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">岗位主要职责</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">岗位任职要求</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">性别</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">年龄</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">学历</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">专业</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">职称或资格要求</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">工作年限</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">其他要求</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!-- 入职审批表 -->
    <template v-if="businessType === 'PERSONNEL_INDUCTION'">
      <div class="box-outer box">
        <div class="head">入职审批表（实习）</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">实习部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">实习岗位</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">实习期限</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">实习补助</td>
            <td></td>
          </tr>
        </table>
      </div>
	  <div class="box-outer box">
        <div class="head">入职审批表（试用）</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">试用部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">试用岗位</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">试用期限</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">试用工资</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
	<!-- 试用期员工月度跟踪考核表 -->
    <template v-if="businessType === 'PERSONNEL_PROBATION_ASSESS'">
      <div class="box-outer box">
        <div class="head">试用期员工月度跟踪考核表</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">姓名</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">入职时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">试用岗位</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">学历</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">毕业院校</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">专业</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">考核期</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">病假</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">事假</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">迟到</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">早退</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">矿工</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">考核结果</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
	<!-- 转正申请表 -->
    <template v-if="businessType === 'PERSONNEL_REGULAR_WORKER'">
      <div class="box-outer box">
        <div class="head">转正申请表</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">姓名</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">性别</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">出生日期</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">学历</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">政治面貌</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">入职时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">试用部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">试用岗位</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
	<!-- 轮岗审批表 -->
    <template v-if="businessType === 'PERSONNEL_ROTATION_POST'">
      <div class="box-outer box">
        <div class="head">轮岗审批表</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">姓名</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">性别</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">出生日期</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">民族</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">学历</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">专业</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">政治面貌</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">入职时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">现所在部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">拟轮岗部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">轮岗时间</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
	<!-- 员工离职申请表 -->
    <template v-if="businessType === 'PERSONNEL_LEAVE_OFFICE'">
      <div class="box-outer box">
        <div class="head">员工离职申请表</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">姓名</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">性别</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">工作年限</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">岗位</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">上报班截止时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">离职类别</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">离职原因</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
    <!-- 员工离职通知书 -->
    <template v-if="businessType === 'PERSONNEL_LEAVE_OFFICE_PROCEDURES'">
      <div class="box-outer box">
        <div class="head">员工离职通知书</div>
        <div class="head_info">
			<div class="head_info_tit">公司有关部门：</div>
			<div class="head_info_desc">张三同志原在我公司安保部工作，经研究，同意该同志离开我公司，现前来你处办理有关手续，请予接洽办理</div>
			<div class="head_info_foot">（公章）</div>
			<div class="head_info_foot">2022年3月15日</div>
		</div>
		
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">办理项目</td>
            <td>移交工作、工具、劳保用品、有关业务资料及书籍等</td>
          </tr>
          <tr>
            <td width="200px">签字</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">办理项目</td>
            <td>转移养老保险关系、住房公积金、人事代理关系、工会会员证</td>
          </tr>
          <tr>
            <td width="200px">签字</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">办理项目</td>
            <td>工牌工装</td>
          </tr>
          <tr>
            <td width="200px">签字</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">办理项目</td>
            <td>1.结清欠款、差旅费等   2.员工停车卡</td>
          </tr>
          <tr>
            <td width="200px">签字</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">办理项目</td>
            <td>结算人员操作账号、成农批管理平台账号</td>
          </tr>
          <tr>
            <td width="200px">签字</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
	<!-- 培训需求申请表 -->
    <template v-if="businessType === 'PERSONNEL_TRAIN'">
      <div class="box-outer box">
        <div class="head">培训需求申请表</div>
        <table align="center" cellpadding="0" cellspacing="1">
          <tr>
            <td width="200px">申请人</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">申请时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">培训理由</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">培训内容</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">培训方式</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">培训时间</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">培训人员</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">费用预算</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import Printjs from "print-js";
import { inject, nextTick } from "vue";
const businessType = inject("businessType") as string;

//打印相关
const print = () => {
  // showPrintNode.value = true;
  nextTick(() => {
    Printjs({
      printable: "printFrom", // 要打印内容的id
      type: "html",
      targetStyles: ["*"],
      style: style, // 打印的内容是没有css样式的，此处需要string类型的css样式
      // style: `@page{size:auto;margin: 0cm;}`, // 打印的内容是没有css样式的，此处需要string类型的css样式
      scanStyles: false,
      // onLoadingEnd() {
      // 	showPrintNode.value = false;
      // },
    });
  });
};

const style = `
@page{size:auto;margin: 0cm;}
.box {
		box-sizing: border-box;
	}
	.box-outer {
		padding-bottom: 40px;
    width:90%;
    margin: 0 auto;
		min-height: 100px;
	}
	.head {
		font-size: 32px;
		font-weight: bold;
		text-align: center;
		margin: 40px auto;
	}
	.head_sub{
		margin: 0 40px 20px ;
	}

	.head_info{
		border: 1px solid black;
		margin: 40px auto;
		width: 90%;
		padding: 20px 20px 10px;
	}
	.head_info_desc{
		margin: 10px 0;
	}
	.head_info_foot{
		text-align: right;
		margin-bottom: 10px;
		
	}
	table {
		width: 90%;
		font-size: 14px;
	}
	table,
	td,
	th {
		text-align: center;
		border: 0.5px solid #000;
		border-collapse: collapse;
	}

	table td {
		padding: 10px 30px;
	}
`;

defineExpose({
  print,
});
</script>
<style scoped lang="less">
#printFrom {
  .box {
    box-sizing: border-box;
    padding-bottom: 40px;
  }
  .box-outer {
    width: 100%;
    min-height: 100px;
  }
  .head {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    margin: 40px auto;
  }
  .head_sub{
    margin: 0 40px 20px ;
  }
  .head_info{
    border: 1px solid black;
    margin: 40px auto;
    width: 90%;
    padding: 20px 20px 10px;
  }
  .head_info_desc{
	margin: 10px 0;
  }
  .head_info_foot{
	text-align: right;
    margin-bottom: 10px;
	
  }

  table {
    width: 90%;
    font-size: 14px;
  }
  table,
  td,
  th {
    text-align: center;
    border: 1px solid #000;
    border-collapse: collapse;
  }

  table td {
    padding: 10px 30px;
  }
}
</style>
