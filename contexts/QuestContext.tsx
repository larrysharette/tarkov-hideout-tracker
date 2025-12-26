"use client";

import { createContext, useContext, useMemo, useCallback } from "react";
import { useHideout } from "./HideoutContext";

interface QuestContextValue {
  completedQuests: Set<string>;
  toggleQuestCompletion: (questId: string) => void;
  isQuestCompleted: (questId: string) => boolean;
}

const QuestContext = createContext<QuestContextValue | null>(null);

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const { userState, toggleQuestCompletion: toggleQuest } = useHideout();

  const completedQuests = useMemo(() => {
    return new Set(userState.completedQuests || []);
  }, [userState.completedQuests]);

  const isQuestCompleted = useCallback(
    (questId: string) => completedQuests.has(questId),
    [completedQuests]
  );

  const contextValue: QuestContextValue = {
    completedQuests,
    toggleQuestCompletion: toggleQuest,
    isQuestCompleted,
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
