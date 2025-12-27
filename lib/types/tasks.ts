export interface TaskKey {
  id: string;
  imageLink: string;
  name: string;
}

export interface TaskMap {
  id: string;
  name: string;
}

export interface TaskTrader {
  id: string;
  name: string;
  imageLink: string;
}

export interface TaskRequirement {
  task: {
    map: TaskMap | null;
    name: string;
    id: string;
    minPlayerLevel: number | null;
  };
}

export interface TaskObjective {
  description: string;
  type: string;
}

export interface Task {
  id: string;
  wikiLink: string;
  name: string;
  neededKeys: {
    keys: TaskKey[];
  };
  kappaRequired: boolean;
  lightkeeperRequired: boolean;
  minPlayerLevel: number | null;
  trader: TaskTrader | null;
  taskRequirements: TaskRequirement[];
  taskImageLink: string | null;
  map: TaskMap | null;
  objectives: TaskObjective[];
}

export interface QuestNode {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  task: Task;
  dependencies: string[]; // IDs of tasks this quest depends on
  dependents: string[]; // IDs of tasks that depend on this quest
}

