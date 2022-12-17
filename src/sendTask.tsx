import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

export async function sendTask(content: string, uuid: string, graphName: string) {
  ReactDOM.render( //把第一个参数渲染到第二个参数中（app）
    <React.StrictMode>
      <App content={content} uuid={uuid} graphName={graphName}/>
    </React.StrictMode>,
    document.getElementById("app") //DOM 获取 index.html 里面 div id = app
  );

  logseq.showMainUI();
}
