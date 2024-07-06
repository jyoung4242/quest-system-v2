import { Quest, Reward, isQuestComplete } from "./QuestManager";
import { gamestate, QuestUUID } from "../main";

const reward: Reward<{}> = {
  gold: 100,
  exp: 100,
};

const questComplete: isQuestComplete = (state: any): boolean => {
  return state.player.monstersKilled >= 5;
};

export const myQuest = new Quest({
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
