import { Reward, isQuestComplete } from "../QuestManager";
import { QuestUUID } from "../../utility";
import { gamestate } from "../../gamestate";

const reward: Reward<{}> = {
  gold: 100,
  exp: 100,
};

const questComplete: isQuestComplete = (state: any): boolean => {
  return state.player.monstersKilled >= 5;
};

export const quest1config = {
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
};
