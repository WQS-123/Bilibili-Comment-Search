import { CommentsReqParams, fetchComments, getOid, Reply, ReplyInfo } from '@/bilibili-comment-search/bilibili';
import { createComment, createCommentButton, setProgress } from '@/bilibili-comment-search/components';
import { BiliCommentType } from '@/bilibili-comment-search/constants';
import { CommentBundle, isSearching, SearchFunction, startSearching, stopSearching, SwitchFunction } from '@/bilibili-comment-search/core';

const noteSwitch: SwitchFunction = async (container: HTMLElement, search: HTMLElement) => {
  container.innerHTML = ``;
  (search.getElementsByClassName('bcs-search-main')[0] as HTMLElement).style.display = 'none';

  let params: CommentsReqParams = {
    oid: getOid()!,
    type: '1',
    sort: '2',
    ps: '20',
    pn: '1',
  };
  let total = 0, count = 0;

  await startSearching();

  do {
    let data = await fetchComments(params);
    let replies = data.replies as Reply[];

    if (replies.length == 0 || !await isSearching()) {
      break;
    }

    for (let reply of replies) {
      let info = ReplyInfo.fromReply(reply);
      let [element, number] = await createComment(info);

      if (info.type == BiliCommentType.note) {
        container.appendChild(element);
      }

      count += number;
    }

    total = data.page.acount;
    params.pn = (parseInt(params.pn, 10) + 1).toString();

    setProgress(search, `${count} | ${total}`);

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  setProgress(search, `${total} | ${total} 查找完成`);

  await stopSearching();
}

const noteSearch: SearchFunction = async (container: HTMLElement, search: HTMLElement) => {
}

export const noteBundle: CommentBundle = {
  button: createCommentButton('笔记'),
  switch: noteSwitch,
  search: noteSearch,
};
