import { injectCommentButton, noteClick, searchClick } from "@/bilibili-comment-search/core";
import { createCommentButton } from "@/bilibili-comment-search/components";
import { fetchAllComments, getOid } from "@/bilibili-comment-search/bilibili";

export default defineContentScript({
  matches: ['*://*.bilibili.com/video/*'],
  main() {
    injectCommentButton([
      {
        button: createCommentButton('笔记'),
        click: noteClick
      },
      {
        button: createCommentButton('搜索'),
        click: searchClick
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
