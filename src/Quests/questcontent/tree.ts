import { QuestUUID } from "../../utility";
import { myTree } from "../../main";
import { quest1config } from "./Quest1";
import { quest2Config, questEnabled } from "./Quest2";
import { quest3Config, quest3Enabled } from "./Quest3";
import { gamestate } from "../../gamestate";
import { quest4Config } from "./Quest4";

export function setupTreeQuests() {
  const quest1 = myTree.createQuest(quest1config);
  const quest2 = myTree.createQuest(quest2Config);
  const quest3 = myTree.createQuest(quest3Config);
  const quest4 = myTree.createQuest(quest4Config);

  myTree.addQuest(quest1);
  myTree.addQuest(quest2);
  myTree.addQuest(quest3, {
    id: QuestUUID.generateUUID(),
    parentQuest: quest2,
    prereqquest: quest3Enabled,
    state: gamestate,
    nextQuest: quest3,
  });
  myTree.addQuest(quest4, {
    id: QuestUUID.generateUUID(),
    parentQuest: quest1,
    prereqquest: quest3Enabled,
    state: gamestate,
    nextQuest: quest4,
  });

  myTree.addEdge({
    id: QuestUUID.generateUUID(),
    parentQuest: quest3,
    prereqquest: quest3Enabled,
    state: gamestate,
    nextQuest: quest4,
  });
}
