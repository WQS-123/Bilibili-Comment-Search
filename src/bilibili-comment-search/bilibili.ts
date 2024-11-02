import { BiliApi } from "@/bilibili-comment-search/constants";

function getBV(): string | undefined {
  let url = window.location.href;
  let match = url.match(/BV[a-zA-Z0-9]+/);

  if (!match) {
    console.error('未找到 bv 号');
    return
  }

  return match[0]
}

export function getOid(): string | undefined {
  return getBV()
}

export interface CommentApiParam {
  oid: string,
  type: string,
  sort: string,
  pn: string,
  ps: string,
};

export async function fetchComments(param: URLSearchParams): Promise<[]> {
  const resp = await fetch(`${BiliApi.comments}?${param.toString()}`, {
    method: "GET",
    credentials: 'include'
  });
  const body = await resp.json();

  if (body.code != 0) {
    console.error(`获取评论区数据失败: ${body.message}`);
    return [];
  }

  if (body.data.top_replies) {
    body.data.replies.unshift(body.data.top_replies);
  }

  return body.data.replies;
}

export async function fetchAllComments(): Promise<any[]> {
  let page = 1, count = 0, replies: [] = [];
  let oid = getOid();
  
  if (!oid) {
    return [];
  }

  do {
    let reply = await fetchComments(
      new URLSearchParams({
        oid: oid,
        type: '1',
        sort: '2',
        pn: `${page}`,
        ps: '20'
      }
    ));

    if (reply.length == 0) {
      break;
    }

    count += reply.length;
    replies.push(...reply);
    page++;

    await new Promise(resolve => setTimeout(resolve, 500));
  } while (true);

  return replies;
}
