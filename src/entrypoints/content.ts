import { injectCommentButton, emptyButtonClickFunction } from "@/bilibili-comment-search/core";
import { createButton } from "@/bilibili-comment-search/components";
import { fetchAllComments, getOid } from "@/bilibili-comment-search/bilibili";

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
    fetchAllComments({
      oid: getOid()!,
      type: 1,
      sort: 2,
      pn: 1,
      ps: 20,
    }).then(resp => {
      console.log(resp);
    });
  },
});
