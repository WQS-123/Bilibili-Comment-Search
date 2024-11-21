import { CommentsReqParams, fetchComments, fetchAllCommentReplies, getOid } from '@/bilibili-comment-search/bilibili';
import { appendReplyToComment, createComment, createCommentButton, createCommentReply, getCommentSearchOptions, setProgress, showCommentReplies } from '@/bilibili-comment-search/components';
import { FetchDelay } from '@/bilibili-comment-search/constants';
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
  let count = 0, total = 0;
  let options = getCommentSearchOptions(search);
  let pattern = null;

  try {
    if (options.match != '') {
      pattern = new RegExp(options.match, 'g');
    }
  } catch (e) {
    setProgress(search, `正则表达式错误，请使用 js 正则表达式：https://www.runoob.com/js/js-regexp.html`);
    return;
  }

  setProgress(search, `开始搜索`);
  await startSearching();

  while (true) {
    let commentInfoList = await fetchComments(params);

    if (commentInfoList == null || !await isSearching()) {
      break;
    }

    for (let commentInfo of commentInfoList) {
      total = commentInfo.total;
      setProgress(search, `${++count} | ${commentInfo.total}`);

      if (!options.replies) {
        if (options.onlyup && !commentInfo.isUp) {
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

        container.appendChild(createComment(commentInfo));
      }
      else {
        let onlyupOk = false, matchOk = false;

        if (!options.onlyup || commentInfo.isUp) {
          onlyupOk = true;
        }

        if (pattern) {
          let message = match(commentInfo.content.message, pattern);
          let uname = match(commentInfo.member.uname, pattern);

          if (message != '') {
            commentInfo.content.message = message;
            matchOk = true;
          }
          if (uname != '') {
            commentInfo.member.uname = uname;
            matchOk = true;
          }
        }
        else {
          matchOk = true;
        }

        const comment = createComment(commentInfo);
        const replyInfoList = await fetchAllCommentReplies({
          oid: params.oid,
          type: params.type,
          root: commentInfo.rpid_str,
          ps: '10',
          pn: '1',
        });
        let replyCount = 0;

        for (let replyInfo of replyInfoList) {
          setProgress(search, `${++count} | ${commentInfo.total}`);

          if (options.onlyup && !replyInfo.isUp) {
            continue;
          }
          else {
            onlyupOk = true;
          }

          if (pattern) {
            let message = match(replyInfo.content.message, pattern);
            let uname = match(replyInfo.member.uname, pattern);

            if (message == '' && uname == '') {
              continue;
            }
            else {
              matchOk = true;
            }
            if (message != '') {
              replyInfo.content.message = message;
            }
            if (uname != '') {
              replyInfo.member.uname = uname;
            }
          }
          else {
            matchOk = true;
          }

          replyCount++;
          appendReplyToComment(comment, createCommentReply(replyInfo));
        }

        if (replyCount != 0) {
          showCommentReplies(comment, replyCount);
        }

        if (onlyupOk && matchOk) {
          container.appendChild(comment);
        }
      }
    }

    params.pn = (parseInt(params.pn, 10) + 1).toString();

    await new Promise(resolve => setTimeout(resolve, FetchDelay.comment));
  }

  setProgress(search, `${count} | ${total} 搜索完成`);
  await stopSearching();
}

export const searchBundle: CommentBundle = {
  button: createCommentButton('搜索'),
  switch: searchSwitch,
  search: searchSearch,
};
