import { injectCommentButton } from "@/bilibili-comment-search/core";
import { noteBundle } from "@/bilibili-comment-search/note";
import { searchBundle } from "@/bilibili-comment-search/search";
import { getOid, fetchAllComments } from "@/bilibili-comment-search/bilibili";

export default defineContentScript({
  matches: ['*://*.bilibili.com/video/*'],
  main() {
    injectCommentButton([noteBundle, searchBundle]);
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
