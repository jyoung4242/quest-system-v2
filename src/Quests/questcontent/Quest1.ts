import { QuestConfig, Reward, isQuestComplete } from "../QuestManager";
import { QuestUUID } from "../../utility";
import { gamestate } from "../../gamestate";

const reward: Reward = (state: any) => {
  state.gold += 100;
  state.exp += 100;
};

const questComplete: isQuestComplete = (state: any): boolean => {
  return state.player.monstersKilled >= 5;
};

const questCancel: isQuestComplete = (state: any): boolean => {
  return state.cancel == true;
};

export const quest1config: QuestConfig = {
  id: QuestUUID.generateUUID(),
  name: "My Quest",
  description: "My Quest Description",
  giver: "Me",
  reward: reward,
  state: gamestate,
  isComplete: questComplete,
  isCancelled: questCancel,
  listener: "testEvent",
  eventCallback: (e: Event) => {
    console.log("This is my quest receiving game event", e);
  },
};
