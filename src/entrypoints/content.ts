import { injectCommentButton } from "@/bilibili-comment-search/core";
import { noteBundle } from "@/bilibili-comment-search/note";
import { searchBundle } from "@/bilibili-comment-search/search";

export default defineContentScript({
  matches: ['*://*.bilibili.com/video/*'],
  main() {
    injectCommentButton([noteBundle, searchBundle]);
  },
});
