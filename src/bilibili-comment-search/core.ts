export interface ButtonClickFunction {
  (commentContainer: HTMLElement): void;
}

export const clearComments: ButtonClickFunction = (commentContainer: HTMLElement) => {
  const feed = commentContainer.querySelector('#feed') as HTMLElement;
  const children = Array.from(feed.childNodes);

  children.forEach(child => {
    // 仅移除元素节点，不然会出 bug
    if (child.nodeType === Node.ELEMENT_NODE) {
      feed.removeChild(child);
    }
  });
}

function fetchComments() {

}
