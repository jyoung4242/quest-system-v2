// Types

export type isQuestEnabled = (state: any, parentstate?: any) => boolean;
export type isQuestComplete = (state: any) => boolean;
export type isQuestCancelled = (state: any) => boolean;

// rewardConfig, used to define the reference to the data store
export type Reward<T> = T;

type QuestConfig = {
  name: string;
  giver: string;
  description: string;
  reward: Reward<any>;
  complete: isQuestComplete;
  cancelled?: isQuestCancelled;
  state: any;
};

type QuestEdgeConfig = {
  nextQuest: Quest;
  parentQuest: Quest;
  prereqquest: isQuestEnabled;
  state: any;
};

enum QuestEdgeStatus {
  enabled = "enabled",
  disabled = "disabled",
}

export enum QuestStatus {
  Active = "active",
  Open = "open",
  Completed = "completed",
  Cancelled = "cancelled",
}

// Classes

export class QuestManager {
  openQuests: QuestTree[] = [];
  activeQuest: Quest | undefined;
  completedQuests: QuestTree[] = [];
  cancelledQuests: QuestTree[] = [];

  constructor() {}

  createTree() {
    const newQuestTree = new QuestTree();
    this.openQuests.push(newQuestTree);
    return newQuestTree;
  }

  closeTree(tree: QuestTree, cancelled?: boolean) {
    if (cancelled) this.cancelledQuests.push(tree);
    else this.completedQuests.push(tree);
    const index = this.openQuests.indexOf(tree);
    this.openQuests.splice(index, 1);
  }

  makeQuestActive(quest: Quest) {
    this.activeQuest = quest;
  }

  update() {
    this.openQuests.forEach(q => q.update());
  }
}

export class QuestTree {
  id: string = QuestUUID.generateUUID();

  nodes: Quest[] = [];
  edges: QuestEdge[] = [];
  constructor() {}

  addQuest(quest: Quest, edgeConfig?: QuestEdgeConfig) {
    if (edgeConfig) {
      const edge: QuestEdgeConfig = {
        nextQuest: quest,
        parentQuest: edgeConfig.parentQuest,
        prereqquest: edgeConfig.prereqquest,
        state: edgeConfig.state,
      };
      const newQuestEdge = new QuestEdge(edgeConfig);
      edgeConfig.parentQuest.assignNextQuestEdge(newQuestEdge);
      this.edges.push(newQuestEdge);
    }
    this.nodes.push(quest);
  }

  update() {}
}

/*
type QuestEdgeConfig = {
  nextQuest: Quest;
  parentQuest: Quest;
  prereqquest: isQuestEnabled;
  state: any;
};

*/

export class QuestEdge {
  id: string = QuestUUID.generateUUID();
  status: QuestEdgeStatus = QuestEdgeStatus.disabled;
  parent: Quest;
  prereq: isQuestEnabled;
  child: Quest;
  state: any;

  constructor(config: QuestEdgeConfig) {
    this.prereq = config.prereqquest;
    this.parent = config.parentQuest;
    this.child = config.nextQuest;
    this.state = config.state;
  }

  update() {
    if (this.prereq(this.state, this.parent.state)) {
      this.status = QuestEdgeStatus.enabled;
    } else {
      this.status = QuestEdgeStatus.disabled;
    }
  }
}

export class Quest {
  id: string = QuestUUID.generateUUID();
  giver: string = "";
  name: string = "";
  description: string = "";
  isCompleted: isQuestComplete;
  isCancelled: isQuestCancelled | undefined;
  status: QuestStatus = QuestStatus.Active;
  children: QuestEdge[] = [];
  state: any;
  reward: Reward<any>;

  constructor(config: QuestConfig) {
    this.description = config.description;
    this.giver = config.giver;
    this.name = config.name;
    this.isCompleted = config.complete;
    this.isCancelled = config.cancelled;
    this.state = config.state;
    this.reward = config.reward;
  }

  assignNextQuestEdge(nextQuest: QuestEdge) {
    this.children.push(nextQuest);
  }

  update() {
    if (this.status === QuestStatus.Active || this.status === QuestStatus.Open) {
      // check if quest completed
      if (this.isCompleted(this.state)) {
        this.status = QuestStatus.Completed;
        // do something here when quest completed
      } else if (this.isCancelled && this.isCancelled(this.state)) {
        this.status = QuestStatus.Cancelled;
        // do something here when quest cancelled
      }
    }
  }
}

export class QuestUUID {
  static generateUUID(): string {
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return uuid.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
