import { CommentsReqParams, fetchComments, fetchAllCommentReplies, getOid } from '@/bilibili-comment-search/bilibili';
import { appendReplyToComment, createComment, createCommentButton, createCommentReply, getCommentSearchOptions, setProgress, showCommentReplies } from '@/bilibili-comment-search/components';
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
  let options = getCommentSearchOptions(search);
  let pattern = null;

  if (options.match != '') {
    try {
      pattern = new RegExp(options.match, 'g');
    } catch (e) {
      setProgress(search, `正则表达式错误，请使用 js 正则表达式：https://www.runoob.com/js/js-regexp.html`);
      return;
    }
  }

  setProgress(search, `开始搜索`);
  await startSearching();

  while (true) {
    let commentInfoList = await fetchComments(params);

    if (commentInfoList == null || !await isSearching()) {
      break;
    }

    for (let commentInfo of commentInfoList) {
      if (options.onlyup && !options.replies && !commentInfo.isUp) {
        continue;
      }

      if (pattern) {
        let message = match(commentInfo.content.message, pattern);
        let uname = match(commentInfo.member.uname, pattern);

        if (message == '' && uname == '') {
          continue;
        }
        if (message != '') {
          commentInfo.content.message = message;
        }
        if (uname != '') {
          commentInfo.member.uname = uname;
        }
      }

      let comment = createComment(commentInfo);

      if (options.replies && commentInfo.replies && commentInfo.replies.length > 0) {
        const replyInfoList = await fetchAllCommentReplies({
          oid: params.oid,
          type: params.type,
          root: commentInfo.rpid_str,
          ps: '10',
          pn: '1',
        });

        let countPrev = count;
        for (let replyInfo of replyInfoList) {
          if (options.onlyup && !replyInfo.isUp) {
            continue;
          }

          if (pattern) {
            let message = match(replyInfo.content.message, pattern);
            let uname = match(replyInfo.member.uname, pattern);

            if (message == '' && uname == '') {
              continue;
            }
            if (message != '') {
              replyInfo.content.message = message;
            }
            if (uname != '') {
              replyInfo.member.uname = uname;
            }
          }

          let reply = createCommentReply(replyInfo);

          count++;
          appendReplyToComment(comment, reply);
        }

        if (countPrev != count) {
          showCommentReplies(comment, count - countPrev);
          container.appendChild(comment);
        }
        else if (!options.onlyup) {
          container.appendChild(comment);
        }
        else {
          continue;
        }
      }
      else if (!options.onlyup) {
        container.appendChild(comment);
      }
      else {
        continue;
      }

      count++;
      total = commentInfo.total;
      setProgress(search, `${count} | ${total}`);
    }

    params.pn = (parseInt(params.pn, 10) + 1).toString();

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  setProgress(search, `${count} | ${total} 搜索完成`);
  await stopSearching();
}

export const searchBundle: CommentBundle = {
  button: createCommentButton('搜索'),
  switch: searchSwitch,
  search: searchSearch,
};
