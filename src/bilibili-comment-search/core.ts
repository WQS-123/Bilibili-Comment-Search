export interface ButtonClickFunction {
  (commentContainer: HTMLElement): void;
}

/**
 * 仅供测试使用
 * 
 * @param commentsContainer 元素 <div id='feed'></div>
 */
export const emptyButtonClickFunction: ButtonClickFunction = (commentsContainer: HTMLElement) => { }

/**
 * 因为使用 display: none 来禁用 #feed，所以这个函数暂时用不上了
 * 
 * @param commentsContainer 元素 <div id='feed'></div>
 */
export const clearComments: ButtonClickFunction = (commentsContainer: HTMLElement) => {
  const children = Array.from(commentsContainer.childNodes);

  children.forEach(child => {
    // 仅移除元素节点，不然会出 bug
    if (child.nodeType === Node.ELEMENT_NODE) {
      commentsContainer.removeChild(child);
    }
  });
}

function fetchComments() {

}
