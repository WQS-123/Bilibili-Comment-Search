interface MemberInfo {
  avatar: string,
  level: string,
  uname: string,
}

interface CommentInfo {
  content: string,
  member: MemberInfo,
  replies: (CommentInfo | null)[],
}

function createDivider(): HTMLElement {
  let divider = document.createElement('div');
  divider.className = 'sort-div';
  return divider;
}

function createButton(text: string): HTMLElement {
  let button = document.createElement('Bilibili-Comment-Button');
  button.innerHTML = text;
  return button;
}

function createCommentsContainer(): HTMLElement {
  let container = document.createElement('div');
  return container;
}

function createComment(comment: CommentInfo): HTMLElement {
  return document.createElement('div');
}

export { MemberInfo, CommentInfo };
export { createDivider, createButton, createCommentsContainer, createComment };
