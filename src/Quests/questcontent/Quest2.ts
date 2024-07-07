import { Quest, QuestConfig, QuestStatus, Reward, isQuestComplete, isQuestEnabled } from "../QuestManager";
import { QuestUUID } from "../../utility";
import { gamestate } from "../../gamestate";

const reward: Reward = (state: any) => {
  state.gold += 100;
  state.exp += 100;
};

const questComplete: isQuestComplete = (state: any): boolean => {
  return state.player.monstersKilled >= 10;
};

export const questEnabled: isQuestEnabled = (state: any, parent: Quest): boolean => {
  return parent.status == QuestStatus.Completed;
};

export const quest2Config: QuestConfig = {
  id: QuestUUID.generateUUID(),
  name: "My Second Quest",
  description: "My Second Quest Description",
  giver: "Me",
  reward: reward,

  isComplete: questComplete,
  state: gamestate,
};
