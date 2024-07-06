import { QuestConfig, QuestStatus, Reward, isQuestComplete, isQuestEnabled } from "../QuestManager";
import { QuestUUID } from "../../utility";
import { gamestate } from "../../gamestate";

const reward: Reward<{}> = {
  gold: 100,
  exp: 100,
};

const questComplete: isQuestComplete = (state: any): boolean => {
  return state.player.monstersKilled >= 5;
};

export const questEnabled: isQuestEnabled = (state: any, parentstate: any): boolean => {
  return parentstate.status == QuestStatus.Completed;
};

export const quest2Config: QuestConfig = {
  id: QuestUUID.generateUUID(),
  name: "My Second Quest",
  description: "My Second Quest Description",
  giver: "Me",
  reward: reward,
  onComplete: () => {
    console.log("quest complete");
  },
  isComplete: questComplete,
  state: gamestate,
};
