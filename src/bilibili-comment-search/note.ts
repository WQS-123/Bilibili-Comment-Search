import { CommentsReqParams, fetchComments, getOid, ReplyInfo, ReplyType } from '@/bilibili-comment-search/bilibili';
import { createComment, createCommentButton, setProgress } from '@/bilibili-comment-search/components';
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

  setProgress(search, `开始搜索`);

  await startSearching();

  while (true) {
    let commentInfoList = await fetchComments(params);

    if (commentInfoList == null || !await isSearching()) {
      break;
    }

    for (let commentInfo of commentInfoList) {
      if (commentInfo.type != ReplyType.note) {
        continue;
      }

      let comment = createComment(commentInfo);

      count++;
      total = commentInfo.total;
      container.appendChild(comment);
      setProgress(search, `${count} | ${total}`);
    }

    params.pn = (parseInt(params.pn, 10) + 1).toString();

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  setProgress(search, `${count} | ${total} 查找完成`);
  await stopSearching();
}

const noteSearch: SearchFunction = async (container: HTMLElement, search: HTMLElement) => {
}

export const noteBundle: CommentBundle = {
  button: createCommentButton('笔记'),
  switch: noteSwitch,
  search: noteSearch,
};
