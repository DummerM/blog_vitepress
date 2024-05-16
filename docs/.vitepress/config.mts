import { defineConfig } from "vitepress";
import { set_sidebar, set_nav } from './utils.js'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "xinfangfang",
  description: "bolg",
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    logo: "/imgs/avatar.png",
    siteTitle: "心方方",
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: "首页",
        link: "/",
      },
      {
        text: "前端",
        link: '/front/index'
        // items: [
        //   {
        //     text: "JS",
        //     link: "/js/index",
        //   },
        //   {
        //     text: "前端工程化",
        //     link: "/engineering/index",
        //   },
        //   {
        //     text: "踩坑记录",
        //     link: "/bugTrackingJournal/index",
        //   },
        //   {
        //     text: "杂谈",
        //     link: "/others/index",
        //   },
        // ],
      },
    ],

    sidebar: {
      // '/js': set_sidebar('js'),
      // '/engineering': set_sidebar('engineering'),
      '/front': set_sidebar('front'),
    },

    socialLinks: [{ icon: "github", link: "https://github.com/DummerM" }],
  },
});
