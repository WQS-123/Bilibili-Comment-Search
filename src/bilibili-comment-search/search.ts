import { CommentInfo, CommentSearchParams, fetchComments, getOid, Reply } from '@/bilibili-comment-search/bilibili';
import { createCommentButton, createComment, setProgress } from '@/bilibili-comment-search/components';
import { BiliCommentType } from '@/bilibili-comment-search/constants';
import { SwitchFunction, SearchFunction, startSearching, stopSearching, isSearching, CommentBundle } from '@/bilibili-comment-search/core';

const searchSwitch: SwitchFunction = async (container: HTMLElement, search: HTMLElement) => {
  container.innerHTML = ``;
  (search.getElementsByClassName('bcs-search-main')[0] as HTMLElement).style.display = 'block';
}

const searchSearch: SearchFunction = async (container: HTMLElement, search: HTMLElement) => {
  let param: CommentSearchParams = {
    oid: getOid()!,
    type: 1,
    sort: 2,
    pn: 1,
    ps: 20,
  };
  let total = 0, count = 0;

  await startSearching();

  do {
    let data = await fetchComments(param);
    let replies = data.replies as Reply[];

    if (replies.length == 0 || !await isSearching()) {
      break;
    }

    replies.forEach(reply => {
      let info = CommentInfo.fromReply(reply);
      
      info.up = data.upper.mid == info.mid;
      container.appendChild(createComment(info));

      count += 1 + (reply.replies.length ?? 0);
    });

    total = data.page.acount;
    param.pn++;

    setProgress(search, `${count} | ${total}`);

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  setProgress(search, `${total} | ${total} 查找完成`);

  await stopSearching();
}

export const searchBundle: CommentBundle = {
  button: createCommentButton('搜索'),
  switch: searchSwitch,
  search: searchSearch,
};
