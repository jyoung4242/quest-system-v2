import "./style.css";
import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode } from "excalibur";
import { QuestManager } from "./Quests/QuestManager";
import { model, template } from "./UI";
import { setupTreeQuests } from "./Quests/questcontent/tree";

// setup peasy
await UI.create(document.body, model, template).attached;

// setup Excalibur
const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
});
await game.start();

// setup quest manager
export const myQuestManager = new QuestManager();

console.log("myQuestManager", myQuestManager);
export const myTree = myQuestManager.createTree("Main Quest");
console.log("new quest tree created", myTree);

game.currentScene.onPreUpdate = () => {
  myQuestManager.update();
};

setupTreeQuests();
