import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import { getAllLabels, getAllProjects } from "./helpersTicktick";

// 获取所有Project
export const callSettings = async () => {
  let allProjects: any[] = await getAllProjects();  // 鉴权，异步中的同步，等执行完，返回 response.data
  allProjects = allProjects.map(
      (i: { name: string; id: string }) => `${i.name} (${i.id})` // 从 allProjects 获取对象的 id,name 转换成 string 赋给 allProjects（数组）
  );
  allProjects.unshift(`---`); // 在头部加元素，类似 append 反过来

  let allLabels: any[] = await getAllLabels();
  allLabels = allLabels.map(
    (i: { name: string; id: string }) => `${i.name} (${i.id})`
  );
  allLabels.unshift(`---`);

  let appendLogseqUriOptions = ["Disable", "Link title", "Link description"];
  let appendLogseqUriDefault = "Disable";
  // migrate `appendLogseqUriOptions` to new setting
    if ( // Optional chaining (?.)，可选链式操作符，前面属性不存在的话，不报异常（不加 ? 的话，会报异常），只是 undefined
    logseq.settings?.appendLogseqUri !== undefined &&
    typeof logseq.settings?.appendLogseqUri === "boolean"
  ) {
    if (logseq.settings.appendLogseqUri) {
      appendLogseqUriDefault = "Link title";
    }
    logseq.updateSettings({ appendLogseqUri: appendLogseqUriDefault });
  }

  let appendTicktickUrlOptions = ["Disable", "Link content", "Append link"];
  let appendTicktickUrlDefault = "Disable";
  // migrate `appendTicktickUrlDefault` to new setting
  if (
    logseq.settings?.appendTicktickUrl !== undefined &&
    typeof logseq.settings?.appendTicktickUrl === "boolean"
  ) {
    if (logseq.settings.appendTicktickUrl) {
      appendTicktickUrlDefault = "Link content";
    }
    logseq.updateSettings({ appendTicktickUrl: appendTicktickUrlDefault });
  }

  const settings: SettingSchemaDesc[] = [
    {
      key: "apiToken",
      title: "API token",
      description: "Your API token, generated from the Ticktick Developer page.",
      type: "string",
      default: "",
    },
    {
      key: "pullDefaultProject",
      title: "Pulling Tasks - Default Project",
      description: "Default project to pull tasks from.",
      type: "enum",
      enumPicker: "select",
      enumChoices: allProjects,
      default: "",
    },
    {
      key: "pullDefaultAppend",
      title: "Pulling Tasks - Append TODO by Default",
      description:
        "Indicate if you would like to append a TODO by default to each pulled item.",
      type: "boolean",
      default: true,
    },
    {
      key: "addParentBlock",
      title: "Pulling Tasks - Add Project Name as Parent Block",
      description:
        "Indicate if you would like to add the project name as the parent block, with the tasks nested under it.",
      type: "boolean",
      default: "false",
    },
    {
      key: "clearTasks",
      title: "Pulling Tasks - Clear task after pulling them into Ticktick",
      description:
        "Indicate if you would like to clear the tasks in Ticktick after pulling them over.",
      type: "boolean",
      default: true,
    },
    {
      key: "sendDefaultProject",
      title: "Sending Tasks - Default Project",
      description:
        "Default project to send tasks to. If set, sending tasks will not allow any customisation.",
      type: "enum",
      enumPicker: "select",
      enumChoices: allProjects,
      default: "",
    },
    {
      key: "sendDefaultDeadline",
      title: "Sending Tasks - Default Deadline",
      description:
        "Set deadline as TODAY for all tasks sent to Ticktick. If set, sending tasks will not allow any customisation.",
      type: "boolean",
      default: false,
    },
    {
      key: "sendDefaultLabel",
      title: "Sending Tasks - Default Label",
      description:
        "Set label for all tasks sent to Ticktick. If set, sending tasks will not allow any customisation.",
      type: "enum",
      enumPicker: "select",
      enumChoices: allLabels,
      default: "",
    },
    {
      key: "appendLogseqUri",
      title: "Append Logseq URI to Description",
      description:
        "If enabled, all tasks sent to Ticktick will have the Logseq URI added to the task's description.",
      type: "enum",
      enumPicker: "select",
      enumChoices: appendLogseqUriOptions,
      default: appendLogseqUriDefault,
    },
    {
      key: "appendTicktickUrl",
      title: "Append Ticktick URL to Block",
      description:
        "If enabled, all tasks sent to Ticktick will its Ticktick url added to the block after sending.",
      type: "enum",
      enumPicker: "select",
      enumChoices: appendTicktickUrlOptions,
      default: appendTicktickUrlDefault,
    },
    {
      key: "appOrWebLink",
      title: "Select App or Web links as default when sending tasks",
      description:
        "Chooses whether you prefer your links to be app links or web links.",
      type: "string",
      default: "app",
    },
  ];
  logseq.useSettingsSchema(settings);
};
