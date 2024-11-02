import { createButton, injectCommentButton } from "@/bilibili-comment-search/components";
import { emptyButtonClickFunction } from "@/bilibili-comment-search/core";
import { getOid, fetchComments, fetchAllComments } from "@/bilibili-comment-search/bilibili";

export default defineContentScript({
  matches: ['*://*.bilibili.com/video/*'],
  main() {
    injectCommentButton([
      {
        button: createButton('笔记'),
        click: emptyButtonClickFunction
      },
      {
        button: createButton('搜索'),
        click: emptyButtonClickFunction
      },
    ]);
  },
});
