export const handleClosePopup = () => {
  //ESC
  document.addEventListener( //一个属性来确定是捕获阶段处理还是冒泡阶段处理。事件模型。不同事件处理的阶段可能是冒泡或者捕获。
    'keydown',
    function (e) {
      if (e.keyCode === 27) { // ESC
        logseq.hideMainUI({ restoreEditingCursor: true });
      }
      e.stopPropagation(); // event.stopPropagation() 方法阻止事件冒泡到父元素，阻止任何父事件处理程序被执行。事件捕获，默认随着 DOM 树一层层往下传；事件冒泡，往上传。到这层为止。
    },
    false
  );
};
