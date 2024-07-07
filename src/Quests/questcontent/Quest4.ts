import { Quest, QuestConfig, QuestStatus, Reward, isQuestComplete, isQuestEnabled } from "../QuestManager";
import { QuestUUID } from "../../utility";
import { gamestate } from "../../gamestate";

const reward: Reward = (state: any) => {
  state.gold += 100;
  state.exp += 100;
};

const quest4Complete: isQuestComplete = (state: any): boolean => {
  return state.player.monstersKilled >= 15;
};

export const quest4Enabled: isQuestEnabled = (state: any, parent: Quest): boolean => {
  return parent.status == QuestStatus.Completed;
};

export const quest4Config: QuestConfig = {
  id: QuestUUID.generateUUID(),
  name: "My Fourth Quest",
  description: "My Fourth Quest Description",
  giver: "Me",
  reward: reward,
  isComplete: quest4Complete,
  state: gamestate,
};
