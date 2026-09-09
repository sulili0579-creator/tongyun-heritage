/**
 * 站点内容数据 — 后续只需改本文件即可增补成果
 * 图片/音视频请放入 assets 对应目录，并更新下方路径
 */
window.SITE_DATA = {
  /**
   * Hero 顶部大图轮播
   * 把图片放到 assets/images/，文件名与下方 src 一致即可
   * interval: 自动切换间隔（毫秒）
   */
  heroSlides: [
    { src: "assets/images/hero-01.jpg", alt: "铜运古道远眺" },
    { src: "assets/images/hero-02.jpg", alt: "会馆古建" },
    { src: "assets/images/hero-03.jpg", alt: "非遗工序" }
  ],
  heroInterval: 5000,

  // 报告摘要检索语料
  reportText: `
    铜运古道非遗调研报告。文化遗产的流动性。云南省曲靖市会泽县铜运古道。
    8天田野调查。云峰段、石匠房段古道遗存。斑铜制作技艺、洞经音乐、会泽海腔。
    文本细读、半结构化访谈、参与式观察、数字样本采集。
    原料流通、技术传播、人群迁徙。流动的遗产。
    口述史逐字稿、影像档案、分类索引。地方文化部门。文化线路。
  `,

  /**
   * 非遗传承人口述史（主页卡片 + 点击进详情页）
   * img:       主页卡片照片（放 assets/images/oral/）
   * href:      点击跳转的详情页（pages/*.html）
   * desc:      主页卡片下方简介（一句话）
   * 详情页的访谈 PDF 在 assets/pdf/ 下，命名见各页面
   */
  oralPeople: [
    {
      id: "zhangwei",
      name: "张伟",
      role: "张氏斑铜传承人",
      tag: "斑铜制作技艺",
      desc: "张氏斑铜制作技艺传承人，坚守传统工艺数十年……",
      img: "assets/images/oral/zhangwei.jpg",
      href: "pages/oral-zhangwei.html"
    },
    {
      id: "kang",
      name: "康贵友 · 康勇",
      role: "德康斑铜传承人",
      tag: "斑铜制作技艺",
      desc: "德康斑铜传承人康贵友、康勇，深耕铜艺工序……",
      img: "assets/images/oral/kang.jpg",
      href: "pages/oral-kang.html"
    },
    {
      id: "zhaokangping",
      name: "赵康平",
      role: "洞经音乐团副团长",
      tag: "洞经音乐",
      desc: "洞经音乐团副团长，推动地方洞经音乐传承……",
      img: "assets/images/oral/zhaokangping.jpg",
      href: "pages/oral-zhaokangping.html"
    },
    {
      id: "jinyinhuan",
      name: "金银焕",
      role: "海腔音乐传承人",
      tag: "会泽海腔",
      desc: "会泽海腔音乐传承人，传唱乡土之声……",
      img: "assets/images/oral/jinyinhuan.jpg",
      href: "pages/oral-jinyinhuan.html"
    },
    {
      id: "chenzhaocai",
      name: "陈兆彩",
      role: "白雾村“活字典”",
      tag: "云峰古道 · 白雾村",
      desc: "云峰古道白雾村的“活字典”，熟悉古道村落掌故……",
      img: "assets/images/oral/chenzhaocai.jpg",
      href: "pages/oral-chenzhaocai.html"
    }
  ],

  videos: [
    {
      id: "documentary",
      title: "实践纪录片",
      desc: "完整记录铜运古道非遗调研的田野历程，包含古道踏勘、非遗考察与传承人访谈。",
      poster: "assets/images/video-poster.jpg",  // 封面图（B 站封面）
      type: "bilibili",              // B 站嵌入播放
      bvid: "BV1ZxYW6EErH",
      href: "pages/video-documentary.html"
    }
  ]
};
