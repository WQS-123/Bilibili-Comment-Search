import { CommentsReqParams, fetchComments, getOid, Reply, ReplyInfo } from '@/bilibili-comment-search/bilibili';
import { createComment, createCommentButton, getSearchOptions, setProgress } from '@/bilibili-comment-search/components';
import { CommentBundle, isSearching, match, SearchFunction, startSearching, stopSearching, SwitchFunction } from '@/bilibili-comment-search/core';

const searchSwitch: SwitchFunction = async (container: HTMLElement, search: HTMLElement) => {
  container.innerHTML = ``;
  (search.getElementsByClassName('bcs-search-main')[0] as HTMLElement).style.display = 'block';
}

const searchSearch: SearchFunction = async (container: HTMLElement, search: HTMLElement) => {
  container.innerHTML = ``;

  let params: CommentsReqParams = {
    oid: getOid()!,
    type: '1',
    sort: '2',
    ps: '20',
    pn: '1',
  };
  let total = 0, count = 0;
  let options = getSearchOptions(search);

  if (options.regexp) {
    try {
      options.pattern = new RegExp(options.match, 'g');
    } catch (e) {
      setProgress(search, `正则表达式错误，请使用 js 正则表达式：https://www.runoob.com/js/js-regexp.html`);
      return;
    }
  }
  else if (options.match == '') {
    options.pattern = new RegExp(/.*/, 'g');
  }
  else {
    options.pattern = new RegExp(options.match, 'g');
  }

  setProgress(search, `开始搜索`);

  await startSearching();

  do {
    let data = await fetchComments(params);
    let replies = data.replies as Reply[];

    if (replies.length == 0 || !await isSearching()) {
      break;
    }

    for (let reply of replies) {
      let info = ReplyInfo.fromReply(reply);

      options.mid = data.upper.mid;
      info.up = data.upper.mid == info.mid;

      let [element, number, isOk] = await createComment(info, options);

      if (!((options.onlyup && !isOk.onlyup) || !isOk.regexp)) {
        container.appendChild(element);
      }

      count += number;
      setProgress(search, `${count} | ${total}`);
    }

    total = data.page.acount;
    params.pn = (parseInt(params.pn, 10) + 1).toString();

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  setProgress(search, `${count} | ${total} 查找完成`);

  await stopSearching();
}

export const searchBundle: CommentBundle = {
  button: createCommentButton('搜索'),
  switch: searchSwitch,
  search: searchSearch,
};
