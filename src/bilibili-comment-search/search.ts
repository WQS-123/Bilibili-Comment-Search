import { CommentInfo, CommentSearchParams, fetchComments, getOid, Reply } from '@/bilibili-comment-search/bilibili';
import { createCommentButton, createComment, setProgress, getSearchOptions } from '@/bilibili-comment-search/components';
import { SwitchFunction, SearchFunction, match, startSearching, stopSearching, isSearching, CommentBundle } from '@/bilibili-comment-search/core';

const searchSwitch: SwitchFunction = async (container: HTMLElement, search: HTMLElement) => {
  container.innerHTML = ``;
  (search.getElementsByClassName('bcs-search-main')[0] as HTMLElement).style.display = 'block';
}

const searchSearch: SearchFunction = async (container: HTMLElement, search: HTMLElement) => {
  container.innerHTML = ``;

  let param: CommentSearchParams = {
    oid: getOid()!,
    type: 1,
    sort: 2,
    pn: 1,
    ps: 20,
  };
  let total = 0, count = 0;
  let options = getSearchOptions(search);
  let pattern: RegExp;

  if (options.regexp) {
    try {
      pattern = new RegExp(options.match, 'g');
    } catch (e) {
      setProgress(search, `正则表达式错误，请使用 js 正则表达式：https://www.runoob.com/js/js-regexp.html`);
      return;
    }
  }
  else {
    pattern = new RegExp(options.match, 'g');
  }

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

      if (options.onlyup && info.up == false) {
        return;
      }

      let element = createComment(info);
      if (options.match != '') {
        element.innerHTML = match(element.innerHTML, pattern);
      }
      container.appendChild(element);

      count += 1 + (reply.replies.length ?? 0);
      console.log(count);
    });

    total = data.page.acount;
    param.pn++;

    setProgress(search, `${count} | ${total}`);

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
