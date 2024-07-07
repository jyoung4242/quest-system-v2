// Types

// quest enabled is for quest edges to check if they can be enabled
export type isQuestEnabled = (state: any, parent: Quest) => boolean;

// quest complete is for quest to check if they have been completed
export type isQuestComplete = (state: any) => boolean;

// quest cancelled is for quest to check if they have been cancelled
export type isQuestCancelled = (state: any) => boolean;

// onQuestComplete is the effect callback that will happen when a quest is completed
export type onQuestComplete = (quest: Quest, state: any) => void;

// onQuestCancelled is the effect callback that will happen when a quest is cancelled
export type onQuestCancelled = (quest: Quest, state: any) => void;

// rewardConfig, used to define the reference to the data store
export type Reward = (state: any) => void;

// Events

// onQuestComplete when a quest is completed
// onQuestCancelled when a quest is cancelled
type MyEventDetail = {
  quest: Quest;
};

export type QuestConfig = {
  id: string;
  name: string;
  giver: string;
  description: string;
  reward: Reward;
  isComplete: isQuestComplete;
  isCancelled?: isQuestCancelled;
  state: any;
  onComplete?: onQuestComplete;
  onCancelled?: onQuestCancelled;
  listener?: string;
  eventCallback?: EventListener;
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
  Inactive = "inactive",
  Open = "open",
  Completed = "completed",
  Cancelled = "cancelled",
}

// Classes

export class QuestManager {
  cy: any;
  openQuests: QuestTree[] = [];
  activeQuest: Quest | undefined;
  completedQuests: QuestTree[] = [];
  cancelledQuests: QuestTree[] = [];
  onComplete: (quest: Quest, state: any) => void;
  onCancelled: (quest: Quest, state: any) => void;

  constructor() {
    this.onComplete = this.defaultOnQuestComplete;
    this.onCancelled = this.defaultOnQuestCancelled;
  }

  createTree(name: string, id: string) {
    const newQuestTree = new QuestTree(name, id, this, this.onComplete, this.onCancelled);
    this.openQuests.push(newQuestTree);
    return newQuestTree;
  }

  closeTree(tree: QuestTree, cancelled?: boolean) {
    debugger;
    if (cancelled) this.cancelledQuests.push(tree);
    else this.completedQuests.push(tree);
    const index = this.openQuests.indexOf(tree);
    this.openQuests.splice(index, 1);
  }

  makeQuestActive(quest: Quest) {
    this.activeQuest = quest;
    quest.status = QuestStatus.Active;
  }

  defaultOnQuestComplete(quest: Quest, state: any): void {
    console.log("quest complete", quest);

    if (this instanceof Quest) {
      // for each edge child for quest, update
      quest.children.forEach(edge => edge.update());

      // move quest to completed
      // reward player
      quest.reward(state);
      console.log("reward: ", state.player);

      // if active quest, clear out active quest
      // if quest has an eventlistener, clean it up
      if (quest.listener && quest.onEvent) document.removeEventListener(quest.listener, quest.onEvent);
      let event = new CustomEvent("onQuestComplete", {
        detail: {
          quest: quest,
        },
      });
      document.dispatchEvent(event);

      //if quest has children, assign next quest
      quest.children.forEach(child => {
        if (child.status === QuestEdgeStatus.enabled) {
          console.log("assigning next quest", child.child);

          child.child.status = QuestStatus.Open;
          child.status = QuestEdgeStatus.disabled;
          let event = new CustomEvent("onNewQuestStarting", {
            detail: {
              quest: quest,
            },
          });
          document.dispatchEvent(event);
        }
      });

      // if quest has no Active children, close quest
      if (quest.children.filter(edge => edge.status === QuestEdgeStatus.enabled).length === 0) {
        this.parent.parent.closeTree(quest.parent);
      }

      console.log("Quest Manager", this.parent.parent);
    }
  }
  defaultOnQuestCancelled(quest: Quest, state: any): void {
    console.log("quest cancelled", quest);

    if (this instanceof Quest) {
      // for each edge child for quest, update
      quest.children.forEach(edge => edge.update());

      // if active quest, clear out active quest
      if (quest.listener && quest.onEvent) document.removeEventListener(quest.listener, quest.onEvent);

      let event = new CustomEvent("onQuestCancelled", {
        detail: {
          quest: quest,
        },
      });
      document.dispatchEvent(event);

      //if quest has children, assign next quest
      quest.children.forEach(child => {
        if (child.status === QuestEdgeStatus.enabled) {
          console.log("assigning next quest", child.child);

          child.child.status = QuestStatus.Open;
          child.status = QuestEdgeStatus.disabled;
          let event = new CustomEvent("onNewQuestStarting", {
            detail: {
              quest: quest,
            },
          });
          document.dispatchEvent(event);
        }
      });
      // if quest has no Active children, close quest
      if (quest.children.filter(edge => edge.status === QuestEdgeStatus.enabled).length === 0) {
        this.parent.parent.closeTree(quest.parent, true);
      }
      console.log("Quest Manager", this.parent.parent);
    }
  }

  update() {
    this.openQuests.forEach(q => q.update());
  }
}

export class QuestTree {
  name: string = "Quest Tree";
  id: string = "";
  nodes: Quest[] = [];
  edges: QuestEdge[] = [];
  defaultOnComplete: (quest: Quest, state: any) => void;
  defaultOnCancelled: (quest: Quest, state: any) => void;

  constructor(
    name: string,
    id: string,
    public parent: QuestManager,
    complete: (quest: Quest, state: any) => void,
    cancel: (quest: Quest, state: any) => void
  ) {
    this.name = name;
    this.id = id;
    this.defaultOnComplete = complete;
    this.defaultOnCancelled = cancel;
  }

  createQuest(quest: QuestConfig): Quest {
    return new Quest(quest, this);
  }

  getQuestID(questname: string): string | undefined {
    const foundquests = this.nodes.find(q => q.name === questname);
    if (foundquests) return foundquests.id;
    return undefined;
  }

  getQuest(id: string): Quest | undefined {
    const foundquests = this.nodes.find(q => q.id === id);
    if (foundquests) return foundquests;
    return undefined;
  }

  addEdge(edge: QuestEdgeConfig) {
    const newQuestEdge = new QuestEdge(edge);
    this.edges.push(newQuestEdge);
    edge.parentQuest.assignNextQuestEdge(newQuestEdge);
  }

  addQuest(quest: Quest, edgeConfig?: QuestEdgeConfig) {
    console.log("adding quest", quest);

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
    if (this.nodes.length == 1) {
      quest.status = QuestStatus.Open;
      let event = new CustomEvent("onNewQuestStarting", {
        detail: {
          quest: quest,
        },
      });
      document.dispatchEvent(event);
    }
  }

  update() {
    this.edges.forEach(e => e.update());
    this.nodes.forEach(q => q.update());
  }
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
    if (this.prereq(this.state, this.parent)) {
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
  status: QuestStatus = QuestStatus.Inactive;
  children: QuestEdge[] = [];
  state: any;
  reward: Reward;
  onComplete: onQuestComplete = () => {};
  onCancelled: onQuestCancelled = () => {};
  parent: QuestTree;
  listener: string = "";
  onEvent: EventListener = () => {};

  constructor(config: QuestConfig, tree: QuestTree) {
    this.id = config.id;
    this.description = config.description;
    this.giver = config.giver;
    this.name = config.name;
    this.parent = tree;

    if (config.onComplete) this.onComplete = config.onComplete;
    else this.onComplete = this.parent.defaultOnComplete;
    if (config.onCancelled) this.onCancelled = config.onCancelled;
    else this.onCancelled = this.parent.defaultOnCancelled;

    if (config.isCancelled) this.isCancelled = config.isCancelled;
    this.isCompleted = config.isComplete;
    this.state = config.state;
    this.reward = config.reward;

    if (config.listener && config.eventCallback) {
      this.listener = config.listener;
      this.onEvent = config.eventCallback;
      document.addEventListener(this.listener, (e: Event) => this.onEvent(e as CustomEvent));
    }
  }

  assignNextQuestEdge(nextQuest: QuestEdge) {
    this.children.push(nextQuest);
  }

  update() {
    if (this.status === QuestStatus.Active || this.status === QuestStatus.Open) {
      // check if quest completed
      if (this.isCompleted(this.state)) {
        console.log("quest completed", this.id);

        this.status = QuestStatus.Completed;

        this.onComplete(this, this.state);
      } else if (this.isCancelled && this.isCancelled(this.state)) {
        console.log("quest cancelled", this.id);

        this.status = QuestStatus.Cancelled;
        this.onCancelled(this, this.state);
      }
    }
  }
}
