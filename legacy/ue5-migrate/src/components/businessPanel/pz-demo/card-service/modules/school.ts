import { PZBaseCardService } from '../base-card-service'
interface StatInfoVo {
  name: string;
  number: number;
}
interface CourseInfoBVo {
  courseName: string;
  courseNumber: number;
}
interface CourseSelectionVo {
  time: string;
  count: number;
}
interface StatAnalysisVo {
  time: string;
  count: number;
  isPeak: boolean;
  isLow: boolean;
}
export class PZSchoolCardService extends PZBaseCardService {
  /**
   * @description 课程分析-课程信息总览
   */
  public async getCourseOverview (params: {
    period: string;
    type: string;
  }): Promise<CourseInfoBVo[]> {
    return this.get('/api/pengzhou/area-course-info', params)
  }
  /**
   * @description 课程分析-选课趋势走向
   */
  public async getCourseTrendAnalysis (
    params: {
      period: string;
      type: string;
    }
  ): Promise<CourseSelectionVo[]> {
    return this.get('/api/pengzhou/area-course-selection', params)
  }
  /**
   * @description 课程分析-选课类别分析
   */
  public async getCourseTypeAnalysis (params: {
    period: string;
    type: string;
  }): Promise<CourseInfoBVo[]> {
    return this.get('/api/pengzhou/area-course-info-type', params)
  }
  /**
   * @description 课程分析-退课时间分析
   */
  public async getCourseWithdrawalTimeAnalysis (params: {
    type: string;
    period: string;
  }): Promise<StatAnalysisVo[]> {
    return this.get('/api/pengzhou/course-drop-time-analysis', params)
  }
  /**
   * @description 课程分析-退课趋势走向
   */
  public async getCourseWithdrawalTrendAnalysis (params: {
    type: string;
    period: string;
  }): Promise<StatAnalysisVo[]> {
    return this.get('/api/pengzhou/course-drop-time-analysis', params)
  }

  /**
   * @description 学生信息-个人信息
   */
  public async getStudentPersonalInformation (params: {
    period: string;
    type: string;
  }): Promise<StatInfoVo[]> {
    return this.get('/api/pengzhou/area-student-gerder', params)
  }
  /**
   * @description 学生信息-学籍信息
   */
  public async getStudentEnrollmentInformation (params: {
    period: string;
    type: string;
  }): Promise<StatInfoVo[]> {
    return this.get('/api/pengzhou/area-student-status', params)
  }
  /**
   * @description 学生信息-课程成绩统计
   */
  public async getStudentCourseScoreStatistics (params: {
    period: string;
    type: string;
  }): Promise<StatInfoVo[]> {
    return this.get('/api/pengzhou/area-course-score', params)
  }
  /**
   * @description 学生信息-考勤统计
   */
  public async getStudentAttendanceStatistics (
    params: {
      period: string;
      type: string;
    }
  ): Promise<{
      time: string;
      full: number;
      beLate: number;
      playTruant: number;
    }[]> {
    return this.get('/api/pengzhou/attendance-status', params)

  }

  /**
   * @description 教学资源分析-课件总览
   */
  public async getCoursewareOverview (params: {
    period: string;
    type: string;
  }): Promise<StatAnalysisVo[]> {
    return this.get('/api/pengzhou/courseware-overview', params)
  }
  /**
   * @description 教学资源分析-课件趋势走向
   */
  public async getCoursewareTrendAnalysis (params: {
    period: string;
    type: string;
  }): Promise<StatAnalysisVo[]> {
    return this.get('/api/pengzhou/courseware-trend', params)
  }
  /**
   * @description 教学资源分析-教材总览
   */
  public async getTextbookOverview (params: {
    period: string;
    type: string;
  }): Promise<StatInfoVo[]> {
    return this.get('/api/pengzhou/textbook-overview', params)
  }
  /**
   * @description 教学资源分析-多媒体资料分析
   */
  public async getMultimediaResourcesAnalysis (params: {
    period: string;
    type: string;
  }): Promise<StatInfoVo[]> {
    return this.get('/api/pengzhou/media-analysis', params)
  }

  /**
   * @description 校园活动-活动总览
   */
  public async getActivityOverview (params: {
    period: string;
    type: string;
  }): Promise<StatInfoVo[]> {
    return this.get('/api/pengzhou/area-activity', params)
  }
  /**
   * @description 校园活动-活动趋势走向
   */
  public async getActivityTrendAnalysis (params: {
    period: string;
    type: string;
  }): Promise<StatAnalysisVo[]> {
    return this.get('/api/pengzhou/area-activity-trend', params)
  }
  /**
   * @description 校园活动-活动群体年龄
   */
  public async getActivityGroupAge (params: {
    period: string;
    type: string;
  }): Promise<{
      name: string;
      twenty: number;
      twentyTwo: number;
      twentyFour: number;
      other: number;
    }[]> {
    return this.get('/api/pengzhou/area-activity-age', params)
  }
  /**
   * @description 校园活动-活动群体性别
   */
  public async getActivityGroupGender (params: {
    period: string;
    type: string;
  }): Promise<{
      name: string;
      maleNumber: number;
      femaleNumber: number;
    }[]> {
    return this.get('/api/pengzhou/area-activity-gender', params)
  }
  /**
   * @description 校园活动-活动群体年龄分布
   */
  public async getActivityGroupAgeDistribution (): Promise<Record<string, unknown>> {
    return this.get('/api/school/activityGroupAgeDistribution')
  }
}