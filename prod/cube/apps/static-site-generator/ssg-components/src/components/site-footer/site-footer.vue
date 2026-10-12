<template>
  <footer class="w-full bg-[#091c37] text-white">
    <div class="px-[4.533vw] lg:px-[15.625vw] pt-[6.1333vw] lg:pt-[2.34375vw] pb-[4vw] lg:pb-[2.34375vw] relative">
      <!-- 顶部 Logo + Slogan -->
      <div class="flex justify-between items-center gap-fluid-4 mb-[5.8666vw] lg:mb-fluid-4">
        <img
          v-if="logo"
          :src="logo"
          :alt="copyrightCompany || 'Logo'"
          class="w-[32.2666vw] lg:w-[12.96875vw] h-[6.87vw] lg:h-[2.6042vw] object-contain block"
        />
        <span v-if="slogan" class="text-[4vw] lg:text-fluid-2xl font-medium whitespace-nowrap">{{ slogan }}</span>
      </div>

      <div class="h-px bg-white/20 mb-[5.8666vw] lg:mb-fluid-6 w-full"></div>

      <!-- 中部：联系信息 -->
      <div class="lg:hidden mb-[5.8666vw]">
        <div class="text-[3.5vw] text-white mb-[3.2vw]">{{ contactTitle }}</div>
        <div class="text-[3.2vw] text-[#8e96a4] space-y-[1.6vw]">
          <div v-for="(item, idx) in contactList" :key="idx" class="flex items-start">
            <span class="min-w-[16vw]">{{ item.label }}{{ item.label ? "：" : "" }}</span>
            <span :class="item.href ? 'text-[#8e96a4]' : 'text-white'">
              <a v-if="item.href" :href="item.href">{{ item.value }}</a>
              <span v-else>{{ item.value }}</span>
            </span>
          </div>
        </div>
        <div v-if="friendLinks && friendLinks.length" class="flex flex-wrap items-center gap-[2vw] mt-[3.2vw]">
          <span class="text-[3.2vw] text-white whitespace-nowrap">{{ friendLinkTitle }}：</span>
          <a
            v-for="(link, idx) in friendLinks"
            :key="idx"
            :href="link.url"
            target="_blank"
            rel="nofollow"
            class="text-[3.2vw] text-[#97a3af] hover:text-white transition-colors"
            >{{ link.name }}</a
          >
        </div>
      </div>

      <!-- PC端：导航/联系 + 二维码 -->
      <div class="hidden lg:flex justify-between items-start gap-[4vw] lg:gap-[5.2083vw] mb-[5.8666vw] lg:mb-fluid-6">
        <!-- 左侧内容 -->
        <div class="flex-1 min-w-0">
          <div class="site-footer-nav-grid grid grid-cols-2 lg:flex lg:justify-between gap-[4vw] lg:gap-[5.2083vw]">
            <!-- 导航分组 -->
            <div v-for="(group, gIdx) in navGroups || []" :key="gIdx" class="min-w-0">
              <h3 class="text-[3.5vw] lg:text-fluid-lg font-medium text-white mb-[3.2vw] lg:mb-fluid-4 whitespace-nowrap">
                {{ group.title }}
              </h3>
              <ul class="space-y-[1.6vw] lg:space-y-fluid-2">
                <li v-for="(link, lIdx) in group.links" :key="lIdx" :class="[link.mrs ? 'lg:ml-[3.6458vw]' : '']">
                  <a
                    :href="link.url"
                    class="text-[3.2vw] lg:text-[0.8333vw] text-[#97a3af] hover:text-white transition-colors whitespace-nowrap"
                    >{{ link.name }}</a
                  >
                </li>
              </ul>
            </div>

            <!-- 联系方式 -->
            <div v-if="contactList && contactList.length" class="min-w-0">
              <h3 class="text-[3.5vw] lg:text-fluid-lg font-medium text-white mb-[3.2vw] lg:mb-fluid-4">{{ contactTitle }}</h3>
              <ul class="space-y-[1.6vw] lg:space-y-fluid-2">
                <li v-for="(item, idx) in contactList" :key="idx" :class="[item.indent ? 'lg:ml-[4.158vw]' : '']">
                  <a
                    v-if="item.href"
                    :href="item.href"
                    class="text-[3.2vw] lg:text-[0.8333vw] text-[#97a3af] hover:text-white transition-colors whitespace-nowrap"
                  >
                    {{ item.label ? item.label + "：" : "" }}{{ item.value }}
                  </a>
                  <span v-else class="text-[3.2vw] lg:text-[0.8333vw] text-[#97a3af]">
                    {{ item.label ? item.label + "：" : "" }}{{ item.value }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 右侧二维码 -->
        <div class="flex flex-row items-start self-center lg:self-start gap-[8vw] lg:gap-[2.5vw]">
          <div v-for="(qr, idx) in (qrCodes || []).slice(0, 2)" :key="idx" class="flex flex-col items-center">
            <img :src="qr.image" :alt="qr.label || 'QR'" class="w-[19.2vw] lg:w-[5vw] h-[19.2vw] lg:h-[5vw] object-contain block" />
            <span
              v-if="qr.label"
              class="text-[3.2vw] lg:text-fluid-xs text-white text-center mt-[1.6vw] lg:mt-fluid-2 whitespace-pre-line leading-tight"
              >{{ qr.label }}</span
            >
          </div>
        </div>
      </div>

      <!-- 移动端二维码 - 绝对定位 -->
      <div v-if="qrCodes?.[0]" class="lg:hidden absolute right-[6.4vw] top-1/2 -translate-y-1/2 flex flex-col items-center">
        <img :src="qrCodes[0].image" :alt="qrCodes[0].label || 'QR'" class="w-[19.2vw] h-[19.2vw] object-contain block" />
        <span v-if="qrCodes[0].label" class="text-[3.2vw] text-white text-center mt-[1.6vw] whitespace-pre-line leading-tight">{{
          qrCodes[0].label
        }}</span>
      </div>

      <div class="h-px bg-white/20 mb-[4vw] lg:mb-fluid-6 w-full"></div>

      <!-- 底部：友情链接 + 社交图标 -->
      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-[3.2vw] lg:gap-fluid-4 mb-[4vw] lg:mb-fluid-6">
        <div v-if="friendLinks && friendLinks.length" class="hidden lg:flex flex-wrap items-center gap-[2vw] lg:gap-[0.78125vw]">
          <span class="text-[3.2vw] lg:text-fluid-sm text-white">{{ friendLinkTitle }}：</span>
          <a
            v-for="(link, idx) in friendLinks"
            :key="idx"
            :href="link.url"
            target="_blank"
            rel="nofollow"
            class="text-[3.2vw] lg:text-fluid-sm text-[#97a3af] hover:text-white transition-colors"
            >{{ link.name }}</a
          >
        </div>
        <div class="flex gap-[2.1333vw] lg:gap-[0.8333vw]">
          <a
            v-for="(link, idx) in (socialLinks || []).slice(0, 4)"
            :key="idx"
            :href="link.url"
            target="_blank"
            rel="nofollow"
            :title="link.name"
            class="relative w-[8.5333vw] h-[8.5333vw] lg:w-[2.1875vw] lg:h-[2.1875vw] rounded-full bg-[#22334b] border border-[#22334b] hover:bg-white hover:border-white flex items-center justify-center transition-colors overflow-hidden group shadow-[0px_4px_10px_rgba(0,0,0,0.06)]"
          >
            <img
              v-if="link.icon"
              :src="link.icon"
              :alt="link.name"
              class="w-[60%] h-[60%] object-contain absolute transition-opacity duration-200 opacity-100 group-hover:opacity-0"
            />
            <img
              v-if="link.hoverIcon"
              :src="link.hoverIcon"
              :alt="link.name"
              class="w-[60%] h-[60%] object-contain absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100"
            />
          </a>
        </div>
      </div>

      <!-- 版权 -->
      <div class="text-center">
        <span class="text-[2.8vw] lg:text-fluid-xs text-[#97a3af] leading-normal">
          © Copyright {{ copyrightYear || "2017" }} - {{ new Date().getFullYear() }}
          {{ copyrightCompany || "成都古河云科技有限公司" }} 版权所有
          <span v-if="icp">
            |
            <a :href="icpLink || 'https://beian.miit.gov.cn/'" target="_blank" rel="nofollow" class="text-[#97a3af] hover:text-white">{{
              icp
            }}</a>
          </span>
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface NavLink {
  name: string;
  url: string;
  mrs?: boolean;
}

interface NavGroup {
  title: string;
  links: NavLink[];
}

interface SocialLink {
  name: string;
  url: string;
  icon?: string;
  hoverIcon?: string;
}

interface FriendLink {
  name: string;
  url: string;
}

interface QrCodeItem {
  image: string;
  label?: string;
}

interface ContactItem {
  label: string;
  value: string;
  href?: string;
  indent?: boolean;
}

interface Office {
  label: string;
  contact: string;
}

interface Props {
  logo?: string;
  slogan?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  managerPhone?: string;
  companyAddress?: string;
  copyrightYear?: string;
  copyrightCompany?: string;
  icp?: string;
  icpLink?: string;
  qrCodes?: QrCodeItem[];
  socialLinks?: SocialLink[];
  navGroups?: NavGroup[];
  friendLinks?: FriendLink[];
  contacts?: ContactItem[];
  contactTitle?: string;
  friendLinkTitle?: string;
  offices?: Office[];
}

const props = withDefaults(defineProps<Props>(), {
  slogan: "看见不可见，守护未发生！",
  navGroups: () => [],
  socialLinks: () => [],
  friendLinks: () => [],
  contacts: () => [],
  contactTitle: "联系我们",
  friendLinkTitle: "友情链接",
  offices: () => [],
});

const contactList = computed<ContactItem[]>(() => {
  if (props.contacts && props.contacts.length) {
    return props.contacts;
  }
  const list: ContactItem[] = [];
  if (props.phone) {
    list.push({ label: "咨询热线", value: props.phone, href: `tel:${props.phone.replace(/-/g, "")}` });
  }
  if (props.email) {
    list.push({ label: "公司邮箱", value: props.email, href: `mailto:${props.email}` });
  }
  if (props.offices && props.offices.length) {
    props.offices.forEach((o) => {
      list.push({ label: o.label, value: o.contact });
    });
  }
  return list;
});
</script>
