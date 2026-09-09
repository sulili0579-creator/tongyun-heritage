# redesign v2 · 现代极简版前端

铜运古道非遗数字档案的第二版前端实验，位于独立子文件夹 `redesign/`，
**不修改原站任何文件**；内容与媒体仍以原站为单一来源。

## 与原站的关系

- 文案数据：直接引用 `../js/data.js`（`window.SITE_DATA`）与 `../js/library-data.js`（`window.LIBRARY`），本目录不复制内容
- 媒体文件：通过相对路径引用 `../assets/`（照片、PDF、封面），未移动、未复制
- 部署：随原仓库一起发布即可，无需构建；`redesign/index.html` 为入口

## 设计语言

- **主题**：乌铜为底、斑金为光、铜绿点睛——配色取自斑铜（"妙在有斑"）与铜绿，而非通用模板色
- **字体**：展示 ZCOOL XiaoWei（碑刻感）· 正文 Noto Serif SC · 编号/台账 IBM Plex Mono
- **签名元素**：首页竖排大标题 + 斑铜金斑点画布（缓慢明灭）；左侧「古道脊线」把滚动进度变成"沿道而行"，四个栏目即沿途刻度
- **纸面对比**：全站唯一的浅色区留给调研报告（档案实物），其余保持深色
- **动效**：入场编排一次、滚动显现、口述史名册交叉淡化；尊重 `prefers-reduced-motion`

## 页面结构

| 文件 | 说明 |
|------|------|
| `index.html` | 首页（四大栏目单页） |
| `report.html` | 调研报告 PDF 在线阅读 |
| `oral.html?id=…` | 口述史详情（一人一页，支持一人多份访谈 PDF 切换） |
| `watch.html` | 实践纪录片（B 站嵌入） |
| `library.html` | 影像资料库台账（分类 + 检索，已过滤原数据中的内嵌表头行） |

## 本地预览

```bash
cd tongyun-heritage
python3 -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080/redesign/
```
