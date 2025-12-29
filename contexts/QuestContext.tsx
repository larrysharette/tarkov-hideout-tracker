"use client";

import { createContext, useContext } from "react";
import { useQuest as useQuestHook } from "@/hooks/use-quest";

interface QuestContextValue {
  completedQuests: () => Set<string>;
  toggleQuestCompletion: (questId: string) => Promise<void>;
  isQuestCompleted: (questId: string) => boolean;
  markQuestsAsCompleted: (questIds: string[]) => Promise<void>;
}

const QuestContext = createContext<QuestContextValue | null>(null);

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const {
    completedQuests,
    toggleQuestCompletion,
    isQuestCompleted,
    markQuestsAsCompleted,
  } = useQuestHook();

  const contextValue: QuestContextValue = {
    completedQuests,
    toggleQuestCompletion,
    isQuestCompleted,
    markQuestsAsCompleted,
  };

  return (
    <QuestContext.Provider value={contextValue}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error("useQuest must be used within QuestProvider");
  }
  return context;
}
