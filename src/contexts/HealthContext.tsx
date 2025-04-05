
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  HealthData, 
  Goal, 
  Metric, 
  PainPoint, 
  Recipe, 
  initializeHealthData, 
  getHealthData, 
  saveHealthData,
  resetDailyTips,
  addPainPoint as addPainPointToStorage,
  addMetric as addMetricToStorage,
  updateRecipeLike as updateRecipeLikeInStorage,
  updateDailyTipCompletion as updateDailyTipCompletionInStorage,
  markRecipeAsEaten as markRecipeAsEatenInStorage,
  canUpdateWeight as canUpdateWeightCheck
} from '../utils/localStorage';
import { toast } from "sonner";

interface HealthContextType {
  healthData: HealthData;
  loading: boolean;
  addPainPoint: (emoji: string, description: string) => void;
  addMetric: (name: string, value: number, unit: string, targetValue?: number) => void;
  updateMetricTracking: (metricId: string, track: boolean) => void;
  updateGoal: (goal: Goal) => void;
  toggleDarkMode: () => void;
  updateRecipeLike: (recipeId: string, liked: boolean, disliked: boolean) => void;
  markRecipeAsEaten: (recipeId: string) => void;
  completeTip: (tipId: string) => void;
  resetTip: (tipId: string) => void;
  refreshData: () => void;
  canUpdateWeight: () => { canUpdate: boolean; hoursRemaining: number };
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider = ({ children }: { children: ReactNode }) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    try {
      // Reset daily tips if needed
      resetDailyTips();
      
      // Get the latest data
      const data = getHealthData();
      setHealthData(data);
    } catch (error) {
      console.error('Error loading health data:', error);
      toast("Error loading data", {
        description: "There was a problem loading your health data.",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = () => {
    loadData();
  };

  const addPainPoint = (emoji: string, description: string) => {
    if (!healthData) return;
    
    try {
      addPainPointToStorage(emoji, description);
      refreshData(); // Immediate refresh to show the new pain point
      toast("Pain point added", {
        description: "Your pain point has been recorded.",
        position: "top-right",
      });
    } catch (error) {
      console.error('Error adding pain point:', error);
      toast("Error adding pain point", {
        description: "There was a problem saving your pain point.",
        position: "top-right",
      });
    }
  };

  const addMetric = (name: string, value: number, unit: string, targetValue?: number) => {
    if (!healthData) return;
    
    try {
      addMetricToStorage(name, value, unit, targetValue);
      refreshData(); // Immediate refresh to update all views
      toast(`${name} updated`, {
        description: `Your ${name.toLowerCase()} has been recorded.`,
        position: "top-right",
      });
    } catch (error) {
      console.error('Error adding metric:', error);
      toast("Error updating metric", {
        description: "There was a problem saving your metric.",
        position: "top-right",
      });
    }
  };

  const updateMetricTracking = (metricId: string, track: boolean) => {
    if (!healthData) return;
    
    try {
      const updatedSettings = { ...healthData.settings };
      
      if (track) {
        // Add metric to tracking if not already there
        if (!updatedSettings.selectedMetrics.includes(metricId)) {
          updatedSettings.selectedMetrics.push(metricId);
        }
      } else {
        // Remove metric from tracking
        updatedSettings.selectedMetrics = updatedSettings.selectedMetrics.filter(id => id !== metricId);
      }
      
      const updatedData = { ...healthData, settings: updatedSettings };
      saveHealthData(updatedData);
      setHealthData(updatedData);
      
      toast(track ? "Metric tracked" : "Metric removed", {
        description: track 
          ? "This metric will now appear on your dashboard." 
          : "This metric has been removed from your dashboard.",
        position: "top-right",
      });
    } catch (error) {
      console.error('Error updating metric tracking:', error);
      toast("Error updating metric", {
        description: "There was a problem updating your metric settings.",
        position: "top-right",
      });
    }
  };

  const updateGoal = (goal: Goal) => {
    if (!healthData) return;
    
    try {
      const goalIndex = healthData.goals.findIndex(g => g.id === goal.id);
      const updatedGoals = [...healthData.goals];
      
      if (goalIndex !== -1) {
        updatedGoals[goalIndex] = goal;
      } else {
        updatedGoals.push(goal);
      }
      
      const updatedData = { ...healthData, goals: updatedGoals };
      saveHealthData(updatedData);
      setHealthData(updatedData);
      
      toast("Goal updated", {
        description: "Your goal has been updated successfully.",
        position: "top-right",
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast("Error updating goal", {
        description: "There was a problem saving your goal.",
        position: "top-right",
      });
    }
  };

  const toggleDarkMode = () => {
    if (!healthData) return;
    
    try {
      const updatedSettings = { 
        ...healthData.settings, 
        darkMode: !healthData.settings.darkMode 
      };
      
      const updatedData = { ...healthData, settings: updatedSettings };
      saveHealthData(updatedData);
      setHealthData(updatedData);
      
      // Apply dark mode to document
      document.documentElement.classList.toggle('dark', updatedSettings.darkMode);
      
    } catch (error) {
      console.error('Error toggling dark mode:', error);
      toast("Error updating theme", {
        description: "There was a problem changing the theme.",
        position: "top-right",
      });
    }
  };

  const updateRecipeLike = (recipeId: string, liked: boolean, disliked: boolean) => {
    if (!healthData) return;
    
    try {
      updateRecipeLikeInStorage(recipeId, liked, disliked);
      refreshData(); // Immediate refresh to update favorites
    } catch (error) {
      console.error('Error updating recipe like:', error);
      toast("Error updating preferences", {
        description: "There was a problem saving your recipe preferences.",
        position: "top-right",
      });
    }
  };

  const markRecipeAsEaten = (recipeId: string) => {
    if (!healthData) return;
    
    try {
      markRecipeAsEatenInStorage(recipeId);
      refreshData(); // Immediate refresh to update meal log
      toast("Meal logged", {
        description: "This meal has been added to your food log.",
        position: "top-right",
      });
    } catch (error) {
      console.error('Error marking recipe as eaten:', error);
      toast("Error logging meal", {
        description: "There was a problem recording your meal.",
        position: "top-right",
      });
    }
  };

  const completeTip = (tipId: string) => {
    if (!healthData) return;
    
    try {
      updateDailyTipCompletionInStorage(tipId, true);
      refreshData(); // Immediate refresh to update tip status
    } catch (error) {
      console.error('Error completing tip:', error);
      toast("Error updating tip", {
        description: "There was a problem marking the tip as completed.",
        position: "top-right",
      });
    }
  };

  const resetTip = (tipId: string) => {
    if (!healthData) return;
    
    try {
      updateDailyTipCompletionInStorage(tipId, false);
      refreshData(); // Immediate refresh to update tip status
    } catch (error) {
      console.error('Error resetting tip:', error);
      toast("Error updating tip", {
        description: "There was a problem resetting the tip.",
        position: "top-right",
      });
    }
  };

  const canUpdateWeight = () => {
    return canUpdateWeightCheck();
  };

  // Apply dark mode on load
  useEffect(() => {
    if (healthData) {
      document.documentElement.classList.toggle('dark', healthData.settings.darkMode);
    }
  }, [healthData]);

  if (!healthData) {
    return null; // or a loading state
  }

  return (
    <HealthContext.Provider
      value={{
        healthData,
        loading,
        addPainPoint,
        addMetric,
        updateMetricTracking,
        updateGoal,
        toggleDarkMode,
        updateRecipeLike,
        markRecipeAsEaten,
        completeTip,
        resetTip,
        refreshData,
        canUpdateWeight,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = (): HealthContextType => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
