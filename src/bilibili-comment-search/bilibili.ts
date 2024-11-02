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

export async function fetchComments(param: URLSearchParams) {
  const resp = await fetch(`${BiliApi.comments}?${param.toString()}`, {
    method: "GET",
    credentials: 'include'
  });
  const body = await resp.json();

  if (body.code == 0) {
    console.error(`获取评论区数据失败: ${body.message}`);
  }

  console.log(body.data.replies);

  if (body.data.page.count == 0) {
    // break;
  }
}
