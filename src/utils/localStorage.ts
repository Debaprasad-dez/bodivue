import img1 from '../assets/foodImages/img1.jpg'
import img2 from '../assets/foodImages/img2.jpg'
import img3 from '../assets/foodImages/img3.jpg'
import img4 from '../assets/foodImages/img4.jpg'
import img5 from '../assets/foodImages/img5.jpg'
import img6 from '../assets/foodImages/img6.jpg'
import img7 from '../assets/foodImages/img7.jpg'
import img8 from '../assets/foodImages/img8.jpg'
import img9 from '../assets/foodImages/img9.jpg'
import img10 from '../assets/foodImages/img10.jpg'
import img11 from '../assets/foodImages/img11.jpg'
import img12 from '../assets/foodImages/img12.jpg'
// Types
export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  deadline: string; // ISO date string
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  targetValue?: number;
  date: string; // ISO date string
}

export interface PainPoint {
  id: string;
  emoji: string;
  description: string;
  date: string; // ISO date string
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prepTime: number; // minutes
  ingredients: string[];
  liked?: boolean;
  disliked?: boolean;
  eaten?: boolean;
  eatenAt?: string; // ISO date string
}

export interface DailyTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
}

export interface HealthData {
  goals: Goal[];
  metrics: Metric[];
  painPoints: PainPoint[];
  recipes: Recipe[];
  dailyTips: {
    tips: DailyTip[];
    lastUpdated: string; // ISO date string
    streak: number;
  };
  settings: {
    darkMode: boolean;
    selectedMetrics: string[]; // array of metric ids to display
    lastWeightUpdate?: string; // ISO date string
  };
  eatenMeals: {
    recipeId: string;
    date: string; // ISO date string
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }[];
}

// Default data
const defaultHealthData: HealthData = {
  goals: [
    {
      id: '1',
      name: 'Weight Loss',
      target: 70,
      current: 75,
      unit: 'kg',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }
  ],
  metrics: [
    {
      id: 'water',
      name: 'Water Intake',
      value: 2,
      unit: 'L',
      targetValue: 3,
      date: new Date().toISOString()
    },
    {
      id: 'steps',
      name: 'Steps',
      value: 6500,
      unit: 'steps',
      targetValue: 10000,
      date: new Date().toISOString()
    },
    {
      id: 'sleep',
      name: 'Sleep',
      value: 7,
      unit: 'hours',
      targetValue: 8,
      date: new Date().toISOString()
    }
  ],
  painPoints: [],
  recipes: [
    {
      id: '1',
      name: 'Avocado Toast',
      image: img1,
      mealType: 'breakfast',
      prepTime: 10,
      ingredients: ['Bread', 'Avocado', 'Salt', 'Pepper', 'Olive oil'],
      liked: false,
      disliked: false
    },
    {
      id: '2',
      name: 'Greek Yogurt with Berries',
      image: img2,
      mealType: 'breakfast',
      prepTime: 5,
      ingredients: ['Greek yogurt', 'Mixed berries', 'Honey', 'Granola'],
      liked: false,
      disliked: false
    },
    {
      id: '3',
      name: 'Spinach Omelette',
      image: img3,
      mealType: 'breakfast',
      prepTime: 15,
      ingredients: ['Eggs', 'Spinach', 'Cheese', 'Salt', 'Pepper'],
      liked: false,
      disliked: false
    },
    {
      id: '4',
      name: 'Chicken Salad',
      image: img4,
      mealType: 'lunch',
      prepTime: 20,
      ingredients: ['Chicken breast', 'Mixed greens', 'Cucumber', 'Tomato', 'Olive oil', 'Lemon juice'],
      liked: false,
      disliked: false
    },
    {
      id: '5',
      name: 'Quinoa Bowl',
      image: img5,
      mealType: 'lunch',
      prepTime: 25,
      ingredients: ['Quinoa', 'Roasted vegetables', 'Chickpeas', 'Feta cheese', 'Tahini dressing'],
      liked: false,
      disliked: false
    },
    {
      id: '6',
      name: 'Tuna Wrap',
      image: img6,
      mealType: 'lunch',
      prepTime: 10,
      ingredients: ['Whole wheat wrap', 'Tuna', 'Lettuce', 'Tomato', 'Mayo'],
      liked: false,
      disliked: false
    },
    {
      id: '7',
      name: 'Grilled Salmon',
      image: img7,
      mealType: 'dinner',
      prepTime: 25,
      ingredients: ['Salmon fillet', 'Lemon', 'Garlic', 'Dill', 'Olive oil'],
      liked: false,
      disliked: false
    },
    {
      id: '8',
      name: 'Vegetable Stir-fry',
      image: img8,
      mealType: 'dinner',
      prepTime: 20,
      ingredients: ['Tofu', 'Broccoli', 'Carrot', 'Bell pepper', 'Soy sauce', 'Ginger'],
      liked: false,
      disliked: false
    },
    {
      id: '9',
      name: 'Turkey Chili',
      image: img9,
      mealType: 'dinner',
      prepTime: 40,
      ingredients: ['Ground turkey', 'Kidney beans', 'Tomatoes', 'Onion', 'Bell pepper', 'Chili powder'],
      liked: false,
      disliked: false
    },
    {
      id: '10',
      name: 'Greek Yogurt with Honey',
      image: img10,
      mealType: 'snack',
      prepTime: 2,
      ingredients: ['Greek yogurt', 'Honey', 'Walnuts'],
      liked: false,
      disliked: false
    },
    {
      id: '11',
      name: 'Apple with Peanut Butter',
      image: img11,
      mealType: 'snack',
      prepTime: 3,
      ingredients: ['Apple', 'Peanut butter'],
      liked: false,
      disliked: false
    },
    {
      id: '12',
      name: 'Hummus with Carrot Sticks',
      image: img12,
      mealType: 'snack',
      prepTime: 5,
      ingredients: ['Hummus', 'Carrot sticks'],
      liked: false,
      disliked: false
    }
  ],
  dailyTips: {
    tips: [
      {
        id: '1',
        title: 'Walk After Meals',
        description: 'Taking a 5-minute walk after meals can improve digestion and blood sugar control.',
        icon: 'footprints',
        completed: false
      },
      {
        id: '2',
        title: 'Stay Hydrated',
        description: 'Drink a glass of water before each meal to help control appetite and stay hydrated.',
        icon: 'droplets',
        completed: false
      },
      {
        id: '3',
        title: 'Mindful Eating',
        description: 'Put away screens during meals and eat slowly to enjoy your food and recognize fullness cues.',
        icon: 'utensils',
        completed: false
      },
      {
        id: '4',
        title: 'Stretching Break',
        description: 'Take a 2-minute stretching break every hour to improve circulation and reduce stiffness.',
        icon: 'stretch',
        completed: false
      }
    ],
    lastUpdated: new Date().toISOString(),
    streak: 0
  },
  settings: {
    darkMode: false,
    selectedMetrics: ['water', 'steps', 'sleep']
  },
  eatenMeals: []
};

// Generate 30 days of weight history
const generateWeightHistory = () => {
  const today = new Date();
  const metrics = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Start at 78kg and gradually decrease to 75kg with some randomness
    const baseWeight = 78 - (i * 0.1);
    const randomVariation = (Math.random() - 0.5) * 0.6; // Random variation between -0.3 and 0.3
    const weight = Number((baseWeight + randomVariation).toFixed(1));
    
    metrics.push({
      id: `weight-${i}`,
      name: 'Weight',
      value: weight,
      unit: 'kg',
      date: date.toISOString()
    });
  }
  
  return metrics;
};

// Functions to interact with localStorage
export const initializeHealthData = (): HealthData => {
  try {
    const storedData = localStorage.getItem('healthData');
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // Merge default data with generated weight history
    const weightHistory = generateWeightHistory();
    const initialData = {
      ...defaultHealthData,
      metrics: [...defaultHealthData.metrics, ...weightHistory]
    };
    
    localStorage.setItem('healthData', JSON.stringify(initialData));
    return initialData;
  } catch (error) {
    console.error('Error initializing health data:', error);
    return defaultHealthData;
  }
};

export const getHealthData = (): HealthData => {
  try {
    const storedData = localStorage.getItem('healthData');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return initializeHealthData();
  } catch (error) {
    console.error('Error getting health data:', error);
    return defaultHealthData;
  }
};

export const saveHealthData = (data: HealthData): void => {
  try {
    localStorage.setItem('healthData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving health data:', error);
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('LocalStorage is full. Please clear some data to continue saving.');
    }
  }
};

// Utility functions
export const getDaysToGoal = (goal: Goal): number => {
  const deadlineDate = new Date(goal.deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getLatestMetric = (metrics: Metric[], name: string): Metric | undefined => {
  const filteredMetrics = metrics.filter(metric => metric.name === name);
  if (filteredMetrics.length === 0) return undefined;
  
  return filteredMetrics.reduce((latest, current) => {
    const latestDate = new Date(latest.date);
    const currentDate = new Date(current.date);
    return currentDate > latestDate ? current : latest;
  });
};

export const getMetricHistory = (metrics: Metric[], name: string, days: number): Metric[] => {
  const filteredMetrics = metrics.filter(metric => metric.name === name);
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - days);
  
  // Group by date (keeping only the latest entry per day)
  const metricsByDate = filteredMetrics.reduce<Record<string, Metric>>((acc, metric) => {
    const date = new Date(metric.date);
    const dateString = date.toISOString().split('T')[0];
    
    if (date >= cutoffDate) {
      if (!acc[dateString] || new Date(acc[dateString].date) < date) {
        acc[dateString] = metric;
      }
    }
    
    return acc;
  }, {});
  
  return Object.values(metricsByDate).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const getGoalProgress = (goal: Goal): number => {
  if (goal.target === goal.current) return 100;
  
  // For goals where lower is better (like weight loss)
  if (goal.current > goal.target) {
    const initial = goal.current + (goal.current - goal.target); // Estimate starting point
    const totalChange = initial - goal.target;
    const currentChange = initial - goal.current;
    return Math.round((currentChange / totalChange) * 100);
  } 
  // For goals where higher is better (like water intake)
  else {
    return Math.round((goal.current / goal.target) * 100);
  }
};

export const resetDailyTips = (): void => {
  const healthData = getHealthData();
  const today = new Date();
  const lastUpdated = new Date(healthData.dailyTips.lastUpdated);
  
  // Check if it's a new day
  if (today.toDateString() !== lastUpdated.toDateString()) {
    healthData.dailyTips.tips.forEach(tip => {
      tip.completed = false;
    });
    healthData.dailyTips.lastUpdated = today.toISOString();
    saveHealthData(healthData);
  }
};

export const updateDailyTipCompletion = (tipId: string, completed: boolean): void => {
  const healthData = getHealthData();
  const tipIndex = healthData.dailyTips.tips.findIndex(tip => tip.id === tipId);
  
  if (tipIndex !== -1) {
    healthData.dailyTips.tips[tipIndex].completed = completed;
    
    // Update streak if all tips are completed
    const allCompleted = healthData.dailyTips.tips.every(tip => tip.completed);
    if (allCompleted) {
      healthData.dailyTips.streak += 1;
    }
    
    saveHealthData(healthData);
  }
};

export const getLikedRecipes = (): Recipe[] => {
  const healthData = getHealthData();
  return healthData.recipes.filter(recipe => recipe.liked);
};

export const updateRecipeLike = (recipeId: string, liked: boolean, disliked: boolean): void => {
  const healthData = getHealthData();
  const recipeIndex = healthData.recipes.findIndex(recipe => recipe.id === recipeId);
  
  if (recipeIndex !== -1) {
    healthData.recipes[recipeIndex].liked = liked;
    healthData.recipes[recipeIndex].disliked = disliked;
    saveHealthData(healthData);
  }
};

export const markRecipeAsEaten = (recipeId: string): void => {
  const healthData = getHealthData();
  const recipeIndex = healthData.recipes.findIndex(recipe => recipe.id === recipeId);
  
  if (recipeIndex !== -1) {
    const now = new Date().toISOString();
    healthData.recipes[recipeIndex].eaten = true;
    healthData.recipes[recipeIndex].eatenAt = now;
    
    // Add to eaten meals log
    const recipe = healthData.recipes[recipeIndex];
    healthData.eatenMeals.push({
      recipeId,
      date: now,
      mealType: recipe.mealType
    });
    
    saveHealthData(healthData);
  }
};

export const getEatenMeals = (): HealthData['eatenMeals'] => {
  const healthData = getHealthData();
  return healthData.eatenMeals;
};

export const addPainPoint = (emoji: string, description: string): void => {
  const healthData = getHealthData();
  const newPainPoint: PainPoint = {
    id: Date.now().toString(),
    emoji,
    description,
    date: new Date().toISOString()
  };
  
  healthData.painPoints.push(newPainPoint);
  saveHealthData(healthData);
};

export const addMetric = (name: string, value: number, unit: string, targetValue?: number): void => {
  const healthData = getHealthData();
  const newMetric: Metric = {
    id: `${name}-${Date.now()}`,
    name,
    value,
    unit,
    targetValue,
    date: new Date().toISOString()
  };
  
  // If this is a weight metric, update the last weight update timestamp
  if (name === 'Weight') {
    healthData.settings.lastWeightUpdate = new Date().toISOString();
  }
  
  healthData.metrics.push(newMetric);
  saveHealthData(healthData);
};

export const canUpdateWeight = (): { canUpdate: boolean; hoursRemaining: number } => {
  const healthData = getHealthData();
  const lastUpdate = healthData.settings.lastWeightUpdate;
  
  if (!lastUpdate) {
    return { canUpdate: true, hoursRemaining: 0 };
  }
  
  const lastUpdateTime = new Date(lastUpdate).getTime();
  const now = new Date().getTime();
  const hoursSinceUpdate = (now - lastUpdateTime) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate >= 48) {
    return { canUpdate: true, hoursRemaining: 0 };
  }
  
  const hoursRemaining = Math.ceil(48 - hoursSinceUpdate);
  return { canUpdate: false, hoursRemaining };
};
