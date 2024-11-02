import { createButton, injectCommentButton } from "@/bilibili-comment-search/components";

export default defineContentScript({
  matches: ['*://*.bilibili.com/video/*'],
  main() {
    injectCommentButton([
      createButton('笔记', () => {}),
      createButton('搜索', () => {})
    ]);
  },
});
