import { QuestUUID } from "../../utility";
import { myTree } from "../../main";
import { quest1config } from "./Quest1";
import { quest2Config, questEnabled } from "./Quest2";
import { gamestate } from "../../gamestate";

export function setupTreeQuests() {
  const quest1 = myTree.createQuest(quest1config);
  const quest2 = myTree.createQuest(quest2Config);
  myTree.addQuest(quest1);
  myTree.addQuest(quest2, {
    id: QuestUUID.generateUUID(),
    parentQuest: quest1,
    prereqquest: questEnabled,
    state: gamestate,
    nextQuest: quest2,
  });
}
