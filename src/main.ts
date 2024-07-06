import "./style.css";
import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode } from "excalibur";
import { Quest, QuestManager, QuestStatus, Reward, isQuestComplete, isQuestEnabled } from "./QuestManager";
const model = {};
const template = `
<style> 
    canvas{ 
        position: fixed; 
        top:50%; 
        left:50%; 
        transform: translate(-50% , -50%); 
    }
</style> 
<div> 
    <canvas id='cnv'> </canvas> 
</div>`;
await UI.create(document.body, model, template).attached;
const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
});
await game.start();
class QuestUUID {
  static generateUUID(): string {
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return uuid.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

const myQuestManager = new QuestManager();
const myTree = myQuestManager.createTree();

const gamestate = {
  player: {
    gold: 0,
    exp: 0,
    monstersKilled: 0,
  },
};

game.currentScene.onPreUpdate = () => {
  myQuestManager.update();
};

console.log("myQuestManager", myQuestManager);

const reward: Reward<{}> = {
  gold: 100,
  exp: 100,
};

const questComplete: isQuestComplete = (state: any): boolean => {
  return state.player.monstersKilled >= 5;
};

// make a new quest
const myQuest = new Quest({
  id: QuestUUID.generateUUID(),
  name: "My Quest",
  description: "My Quest Description",
  giver: "Me",
  reward: reward,
  onComplete: () => {
    console.log("quest complete");
  },
  state: gamestate,
  isComplete: questComplete,
});

// make 2nd quest (child)
const myQuest2 = new Quest({
  id: QuestUUID.generateUUID(),
  name: "My Second Quest",
  description: "My Second Quest Description",
  giver: "Me",
  reward: reward,
  isComplete: questComplete,
  onComplete: () => {
    console.log("quest complete");
  },
  state: gamestate,
});

const questEnabled: isQuestEnabled = (state: any, parentstate: any): boolean => {
  return parentstate.status == QuestStatus.Completed;
};

myTree.addQuest(myQuest);
myTree.addQuest(myQuest2, {
  id: QuestUUID.generateUUID(),
  parentQuest: myQuest,
  prereqquest: questEnabled,
  state: gamestate,
  nextQuest: myQuest2,
});
