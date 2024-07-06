import { Quest, QuestStatus, Reward, isQuestComplete, isQuestEnabled } from "../QuestManager";
import { gamestate, QuestUUID, myTree } from "../../main";

const reward: Reward<{}> = {
  gold: 100,
  exp: 100,
};

const questComplete: isQuestComplete = (state: any): boolean => {
  return state.player.monstersKilled >= 5;
};
// make a new quest

// make 2nd quest (child)
export const myQuest2 = myTree.createQuest({
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

export const questEnabled: isQuestEnabled = (state: any, parentstate: any): boolean => {
  return parentstate.status == QuestStatus.Completed;
};
