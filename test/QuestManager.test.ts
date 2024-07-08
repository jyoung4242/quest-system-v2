import { QueryManager } from "excalibur";
import { Quest, QuestEdgeConfig, QuestManager, QuestStatus } from "../src/Quests/QuestManager";
import { QuestUUID } from "../src/utility";

import { describe, expect, it, beforeEach } from "vitest";
import { myTree } from "../src/main";

describe("QuestManager", () => {
  let myQuestManager: QuestManager;

  beforeEach(() => {
    myQuestManager = new QuestManager();
  });

  it("should create a new quest tree", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";

    const questTree = myQuestManager.createTree(treeName, treeId);

    expect(questTree.id).toBe(treeId);
    expect(questTree.name).toBe(treeName);
  });

  it("should add a quest to the quest tree", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId = QuestUUID.generateUUID();
    const questName = "Test Quest";

    const questTree = myQuestManager.createTree(treeName, treeId);
    const state = {
      gold: 0,
      xp: 0,
    };
    const quest = questTree.createQuest({
      id: questId,
      name: questName,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });

    questTree.addQuest(quest);

    expect(questTree.nodes).toContain(quest);
  });

  it("should add an edge to the quest tree", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";
    const questId2 = QuestUUID.generateUUID();
    const questName2 = "Test Quest 2";

    const questTree = myQuestManager.createTree(treeName, treeId);
    const state = {
      gold: 0,
      xp: 0,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });
    const quest2 = questTree.createQuest({
      id: questId2,
      name: questName2,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });

    questTree.addQuest(quest1);
    questTree.addQuest(quest2);
    questTree.addEdge({
      parentQuest: quest1,
      nextQuest: quest2,
      id: QuestUUID.generateUUID(),
      prereqquest: () => false,
      state: state,
    });

    expect(questTree.edges.length).toBe(1);
  });

  it("should update the quest tree", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";
    const questId2 = QuestUUID.generateUUID();
    const questName2 = "Test Quest 2";

    const questTree = myQuestManager.createTree(treeName, treeId);
    const state = {
      gold: 0,
      xp: 0,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });
    const quest2 = questTree.createQuest({
      id: questId2,
      name: questName2,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });

    questTree.addQuest(quest1);
    questTree.addQuest(quest2);
    questTree.addEdge({
      parentQuest: quest1,
      nextQuest: quest2,
      id: QuestUUID.generateUUID(),
      prereqquest: () => false,
      state: state,
    });
  });

  it("should jump from parent quest to child quest", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";
    const questId2 = QuestUUID.generateUUID();
    const questName2 = "Test Quest 2";

    const questTree = myQuestManager.createTree(treeName, treeId);
    const state = {
      gold: 0,
      xp: 0,
      questCntr: 0,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => {
        return state.questCntr >= 3;
      },
      isCancelled: () => false,
    });
    const quest2 = questTree.createQuest({
      id: questId2,
      name: questName2,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });

    questTree.addQuest(quest1);
    questTree.addQuest(quest2);
    questTree.addEdge({
      parentQuest: quest1,
      nextQuest: quest2,
      id: QuestUUID.generateUUID(),
      prereqquest: (state, quest1) => {
        return quest1.status === QuestStatus.Completed;
      },
      state: state,
    });

    state.questCntr = 3;

    questTree.update();

    expect(quest1.status).toBe(QuestStatus.Completed);
    expect(quest2.status).toBe(QuestStatus.Open);
  });

  //test for cancelling quest
  it("should cancel quest", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";

    const questTree = myQuestManager.createTree(treeName, treeId);
    const state = {
      gold: 0,
      xp: 0,
      cancel: false,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: state => {
        return state.cancel;
      },
    });

    questTree.addQuest(quest1);
    // check quest status
    expect(quest1.status).toBe(QuestStatus.Open);
    expect(questTree.nodes.length).toBe(1);
    expect(myQuestManager.openQuests.length).toBe(1);

    state.cancel = true;
    myQuestManager.update();

    // check quest status
    expect(quest1.status).toBe(QuestStatus.Cancelled);
    expect(myQuestManager.openQuests.length).toBe(0);
    expect(myQuestManager.cancelledQuests.length).toBe(1);
  });

  it("should get quest id and then quest by id", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";
    const questId2 = QuestUUID.generateUUID();
    const questName2 = "Test Quest 2";
    const questId3 = QuestUUID.generateUUID();
    const questName3 = "Test Quest 3";
    const questTree = myQuestManager.createTree(treeName, treeId);

    const state = {
      gold: 0,
      xp: 0,
    };

    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });
    const quest2 = questTree.createQuest({
      id: questId2,
      name: questName2,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });
    const quest3 = questTree.createQuest({
      id: questId3,
      name: questName3,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });

    questTree.addQuest(quest1);
    questTree.addQuest(quest2);
    questTree.addQuest(quest3);

    expect(questTree.getQuestID(questName1)).toBe(questId1);
    expect(questTree.getQuestID(questName2)).toBe(questId2);
    expect(questTree.getQuestID(questName3)).toBe(questId3);

    expect(questTree.getQuest(questId1)).toBe(quest1);
    expect(questTree.getQuest(questId2)).toBe(quest2);
    expect(questTree.getQuest(questId3)).toBe(quest3);
  });

  it("should register an event listener", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";

    const questTree = myQuestManager.createTree(treeName, treeId);

    const state = {
      gold: 0,
      xp: 0,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
      listener: "test",
      eventCallback: (e: Event) => {
        expect((e as CustomEvent).detail).toBe("test");
      },
    });
    questTree.addQuest(quest1);

    const myEvent = new CustomEvent("test", {
      detail: "test",
    });
    document.dispatchEvent(myEvent);
  });

  it("should execute reward on successful quest completiont", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";

    const questTree = myQuestManager.createTree(treeName, treeId);

    const state = {
      gold: 0,
      xp: 0,
      questCompleted: false,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: state => {
        return state.questCompleted;
      },
      isCancelled: () => false,
    });

    questTree.addQuest(quest1);

    //check before closing quest
    expect(state.gold).toBe(0);
    expect(state.xp).toBe(0);
    expect(state.questCompleted).toBe(false);
    //close quest
    state.questCompleted = true;
    quest1.update();
    //check after closing quest
    expect(state.gold).toBe(100);
    expect(state.xp).toBe(10);
    expect(state.questCompleted).toBe(true);
    expect(quest1.status).toBe(QuestStatus.Completed);
  });

  it("should add edge with the addQuest method", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";
    const questId2 = QuestUUID.generateUUID();
    const questName2 = "Test Quest 2";

    const questTree = myQuestManager.createTree(treeName, treeId);

    const state = {
      gold: 0,
      xp: 0,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });
    const quest2 = questTree.createQuest({
      id: questId2,
      name: questName2,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });

    let edgeconf: QuestEdgeConfig = {
      parentQuest: quest1,
      id: QuestUUID.generateUUID(),
      nextQuest: quest2,
      prereqquest: (state, quest1) => {
        return state.gold >= 100;
      },
      state: state,
    };

    questTree.addQuest(quest1);
    questTree.addQuest(quest2, edgeconf);
    expect(questTree.edges.length).toBe(1);
  });

  it("should cancel quest and check for edges for child quests", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";
    const questId2 = QuestUUID.generateUUID();
    const questName2 = "Test Quest 2";

    const questTree = myQuestManager.createTree(treeName, treeId);

    const state = {
      gold: 0,
      xp: 0,
      cancelFlag: false,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => {
        return state.cancelFlag;
      },
    });
    const quest2 = questTree.createQuest({
      id: questId2,
      name: questName2,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => false,
      isCancelled: () => false,
    });

    questTree.addQuest(quest1);
    questTree.addQuest(quest2);
    questTree.addEdge({
      parentQuest: quest1,
      nextQuest: quest2,
      id: QuestUUID.generateUUID(),
      prereqquest: (state, quest1) => {
        return quest1.status === QuestStatus.Cancelled;
      },
      state: state,
    });

    state.cancelFlag = true;
    myQuestManager.update();
    expect(quest1.status).toBe(QuestStatus.Cancelled);
    expect(quest2.status).toBe(QuestStatus.Open);
  });

  it("should move quest to completed on closure", () => {
    const treeId = QuestUUID.generateUUID();
    const treeName = "Test Tree";
    const questId1 = QuestUUID.generateUUID();
    const questName1 = "Test Quest 1";

    const questTree = myQuestManager.createTree(treeName, treeId);
    const state = {
      gold: 0,
      xp: 0,
    };
    const quest1 = questTree.createQuest({
      id: questId1,
      name: questName1,
      description: "Test Description",
      giver: "Test Giver",
      reward: state => {
        state.gold += 100;
        state.xp += 10;
      },
      state: state,
      isComplete: () => {
        return state.gold >= 100;
      },
      isCancelled: () => false,
    });
    questTree.addQuest(quest1);

    expect(quest1.status).toBe(QuestStatus.Open);
    myQuestManager.update();
    state.gold = 100;
    myQuestManager.update();
    expect(quest1.status).toBe(QuestStatus.Completed);
    expect(myQuestManager.completedQuests.length).toBe(1);
    expect(myQuestManager.openQuests.length).toBe(0);
  });
});
