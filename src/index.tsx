import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { callSettings } from "./callSettings";
import { handleClosePopup } from "./handleClosePopup";
import { insertTasksIntoLogseq } from "./helpersLogseq";
import {
  getIdFromProjectAndLabel,
  removePrefix,
  removePrefixWhenAddingTicktickUrl,
  sendTaskFunction,
} from "./helpersTicktick";
import { sendTask } from "./sendTask";

const main = async () => {
  console.log("logseq-ticktick-plugin loaded");

  callSettings(); // 更新 logseq 的一些 settings

  handleClosePopup(); //插件安装还是设置界面对 ESC 的监听

  // Register push command
  logseq.Editor.registerSlashCommand("ticktick - send task", async (e) => { //增加一个 operarion 到 slash 命令
    const {
      sendDefaultProject,
      sendDefaultLabel,
      sendDefaultDeadline,
      appendLogseqUri,
      appendTicktickUrl,
    } = logseq.settings!;

    const currGraphName =
      (await logseq.App.getCurrentGraph())?.name ?? "logseq";
    const currBlk = (await logseq.Editor.getBlock(e.uuid)) as BlockEntity;

    await new Promise((r) => setTimeout(r, 2000)); //等待 2s

    if (!sendDefaultProject && !sendDefaultLabel && !sendDefaultDeadline) {
      await sendTask(currBlk.content, currBlk.uuid, currGraphName); // 弹窗 sendTask
    } else {
      let blockUri = `logseq://graph/${currGraphName}?block-id=${currBlk.uuid}`;
      let taskTitle =
        appendLogseqUri === "Link title"
          ? `[${removePrefix(currBlk.content)}](${blockUri})`
          : removePrefix(currBlk.content);
      let taskDes =
        appendLogseqUri === "Link description"
          ? `[(logseq link)](${blockUri})`
          : "";

      let data: {
        content: string;
        description?: string;
        project_id?: number;
        due_string?: string;
        label_ids?: number[];
      } = {
        content: taskTitle,
        description: taskDes,
      };

      if (sendDefaultProject && sendDefaultProject !== "---")
        data["project_id"] = parseInt(
          getIdFromProjectAndLabel(sendDefaultProject) as string
        );
      if (sendDefaultDeadline) data["due_string"] = "today";
      if (sendDefaultLabel && sendDefaultLabel !== "---")
        data["label_ids"] = [
          parseInt(getIdFromProjectAndLabel(sendDefaultLabel) as string),
        ];

      const sendResponse = await sendTaskFunction(data);

      let newBlockContent = currBlk.content;

      if (appendTicktickUrl === "Link content") {
        newBlockContent = `${removePrefixWhenAddingTicktickUrl(
          currBlk.content
        )}(${sendResponse.url})`;
      }

      if (appendTicktickUrl === "Append link") {
        newBlockContent = `${currBlk.content} [(ticktick)](${sendResponse.url})`;
      }
      await logseq.Editor.updateBlock(currBlk.uuid, newBlockContent);

      window.setTimeout(async function () {
        await logseq.Editor.exitEditingMode();
        logseq.App.showMsg(`
         [:div.p-2
           [:h1 "Task!"]
           [:h2.text-xl "${currBlk.content}"]]`);
      }, 500);
    }
  });

  // Register pull command
  logseq.Editor.registerSlashCommand("ticktick - pull tasks", async () => {
    const id = getIdFromProjectAndLabel(logseq.settings!.pullDefaultProject);

    if (id.startsWith("Error")) {
      logseq.App.showMsg(
        "Error getting default project ID. Do you want to pull TODAY's tasks instead?"
      );
    } else {
      await insertTasksIntoLogseq(id);
    }
  });

  // Register pull today's tasks command
  logseq.Editor.registerSlashCommand(
    `ticktick - pull today's tasks`,
    async () => {
      await insertTasksIntoLogseq("today");
    }
  );

  // For use with daily template // 提供 renderer 的模板
  logseq.App.onMacroRendererSlotted(async function ({ slot, payload }) { //UI slot
    const uuid = payload.uuid;
    const [type] = payload.arguments;
    if (!type.startsWith(":ticktick_")) return;
    await insertTasksIntoLogseq("today");
    await logseq.Editor.removeBlock(uuid);
  });
};

logseq.ready(main).catch(console.error);
