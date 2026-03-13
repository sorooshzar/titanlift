import React, { createContext, useContext, useState, useCallback } from 'react';

const TabStateContext = createContext();

export function TabStateProvider({ children }) {
  const [tabStates, setTabStates] = useState({
    Profile: { scrollTop: 0 },
    Lifts: { scrollTop: 0, activeTab: 'workouts' },
    Cardio: { scrollTop: 0 },
    Macros: { scrollTop: 0, activeTab: 'dashboard', date: null },
  });

  const saveTabState = useCallback((tabName, state) => {
    setTabStates(prev => ({
      ...prev,
      [tabName]: { ...prev[tabName], ...state },
    }));
  }, []);

  const getTabState = useCallback((tabName) => {
    return tabStates[tabName] || {};
  }, [tabStates]);

  return (
    <TabStateContext.Provider value={{ tabStates, saveTabState, getTabState }}>
      {children}
    </TabStateContext.Provider>
  );
}

export function useTabState() {
  return useContext(TabStateContext);
}