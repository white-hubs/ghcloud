import { defineComponent, ref } from 'vue';
import { Layout } from '@ghcloud/generic-component';
import { Button, Form, FormItem } from '@ghcloud/cube-ui';
import { usePageName } from '@ghcloud/cube-utils';
import styles from './index.module.less';
import { Usage } from './components/usage/usage';
import { Vacancy } from './components/vacancy/vacancy';
import { PeriodAnalysis } from './components/period-analysis/period-analysis';
import { TimeRadioGroup } from '@/components/time-radio-group/time-radio-group';

export const ReservationStatistics = defineComponent({
  setup () {
    const { pageTitle } = usePageName();
    const TimeRadioGroupRef = ref<{ getDateTime: (key: string) => void; }>();
    const UsageRef = ref<{ query: () => void; }>();
    const VacancyRef = ref<{ query: () => void; }>();
    const PeriodAnalysisRef = ref<{ query: () => void; }>();
    const period = ref('');
    const timeFlag = ref('TODAY');

    const changeDate = (value: string): void => {
      timeFlag.value = value;
    };

    const handleQuery = (): void => {
      UsageRef.value?.query();
      VacancyRef.value?.query();
      PeriodAnalysisRef.value?.query();
    };

    const layoutSlots = {
      'layout-header': (): JSX.Element => (
        <Form layout="inline" style="margin-top:10px;">
          <FormItem class={styles['search-item']}>
            <TimeRadioGroup
              v-model:value={period.value}
              ref={TimeRadioGroupRef}
              onChange={changeDate}
            />
          </FormItem>
          <FormItem label="" class={styles['search-item']}>
            <Button type="primary" onClick={handleQuery}>查询</Button>
            <Button style={{ marginLeft: '10px' }} onClick={() => TimeRadioGroupRef.value?.getDateTime('TODAY')}>重置</Button>
          </FormItem>
        </Form>
      ),
      'layout-content': (): JSX.Element => (
        <div class={styles['meet-info']}>
          <div class={styles['meet-info-up']}>
            <Usage
              period={period.value}
              ref={UsageRef}
              timeFlag={timeFlag.value}
            />
            <Vacancy
              period={period.value}
              ref={VacancyRef}
              timeFlag={timeFlag.value}
            />
          </div>
          <div class={styles['meet-info-down']}>
            <PeriodAnalysis
              period={period.value}
              ref={PeriodAnalysisRef}
              timeFlag={timeFlag.value}
            />
          </div>
        </div>
      ),
    };

    return (): JSX.Element => (
      <div style={{ height: '100%' }}>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </div>
    );
  },
});