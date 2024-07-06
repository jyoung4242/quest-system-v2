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
  name: "My Quest",
  description: "My Quest Description",
  giver: "Me",
  reward: reward,
  complete: questComplete,
  state: gamestate,
});

// make 2nd quest (child)
const myQuest2 = new Quest({
  name: "My Second Quest",
  description: "My Second Quest Description",
  giver: "Me",
  reward: reward,
  complete: questComplete,
  state: gamestate,
});

const questEnabled: isQuestEnabled = (state: any, parentstate: any): boolean => {
  return parentstate.status == QuestStatus.Completed;
};

myTree.addQuest(myQuest);
myTree.addQuest(myQuest2, { parentQuest: myQuest, prereqquest: questEnabled, state: gamestate, nextQuest: myQuest2 });
