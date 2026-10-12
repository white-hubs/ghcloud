import { hasPermission } from '@/services/CommonService';
import { GETTER_USER } from '@store/account';
export default {
  name: 'AppSecurity',
  props: {
    codes: String,
  },
  functional: true,
  render: function (h, context) {
    const { props } = context;
    const user = window.__app__.$store.getters[GETTER_USER];
    const defaultSlot = context.slots().default;
    let codes = props.codes;
    if (codes) {
      if (hasPermission(user, codes.split(','))) {
        return defaultSlot;
      }
      return null;
    }
    return defaultSlot;
  },
};
