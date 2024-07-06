// Types

// quest enabled is for quest edges to check if they can be enabled
export type isQuestEnabled = (state: any, parentstate?: any) => boolean;

// quest complete is for quest to check if they have been completed
export type isQuestComplete = (state: any) => boolean;

// quest cancelled is for quest to check if they have been cancelled
export type isQuestCancelled = (state: any) => boolean;

// onQuestComplete is the effect callback that will happen when a quest is completed
export type onQuestComplete = (state: any) => void;
// onQuestCancelled is the effect callback that will happen when a quest is cancelled
export type onQuestCancelled = (state: any) => void;

// rewardConfig, used to define the reference to the data store
export type Reward<T> = T;

type QuestConfig = {
  id: string;
  name: string;
  giver: string;
  description: string;
  reward: Reward<any>;
  isComplete: isQuestComplete;
  isCancelled?: isQuestCancelled;
  state: any;
  onComplete: onQuestComplete;
  onCancelled?: onQuestCancelled;
};

type QuestEdgeConfig = {
  id: string;
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
  id: string = "";
  nodes: Quest[] = [];
  edges: QuestEdge[] = [];
  constructor() {}

  addQuest(quest: Quest, edgeConfig?: QuestEdgeConfig) {
    if (edgeConfig) {
      const edge: QuestEdgeConfig = {
        id: edgeConfig.id,
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

export class QuestEdge {
  id: string = "";
  status: QuestEdgeStatus = QuestEdgeStatus.disabled;
  parent: Quest;
  prereq: isQuestEnabled;
  child: Quest;
  state: any;

  constructor(config: QuestEdgeConfig) {
    this.id = config.id;
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
  id: string = "";
  giver: string = "";
  name: string = "";
  description: string = "";
  isCompleted: isQuestComplete = () => false;
  isCancelled: isQuestCancelled = () => false;
  status: QuestStatus = QuestStatus.Active;
  children: QuestEdge[] = [];
  state: any;
  reward: Reward<any>;
  onComplete: onQuestComplete = () => {};
  onCancelled: onQuestCancelled = () => {};

  constructor(config: QuestConfig) {
    this.id = config.id;
    this.description = config.description;
    this.giver = config.giver;
    this.name = config.name;
    this.onComplete = config.onComplete;
    if (config.onCancelled) this.onCancelled = config.onCancelled;
    if (config.isCancelled) this.isCancelled = config.isCancelled;
    this.isCompleted = config.isComplete;
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
