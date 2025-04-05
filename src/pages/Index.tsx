
import { useState, useEffect } from 'react';
import { useHealth } from "@/contexts/HealthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Utensils, Footprints, Heart, Calendar } from 'lucide-react';
import { getMetricHistory, getGoalProgress } from '@/utils/localStorage';
import GoalSetupWizard from '@/components/GoalSetupWizard';
import PainPointTracker from '@/components/PainPointTracker';
import brand from '../assets/brand.png'

const Index = () => {
  const { healthData, refreshData } = useHealth();
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [hasCheckedWizardNeed, setHasCheckedWizardNeed] = useState(false);
  
  // Check if user needs to set up goals - only on first load, not when navigating back
  useEffect(() => {
    // Only run this check once
    if (!hasCheckedWizardNeed) {
      const userPreferences = localStorage.getItem('userPreferences');
      const setupWizardShown = localStorage.getItem('setupWizardShown');
      const noCustomGoals = healthData.goals.length <= 1 && healthData.goals[0]?.id === '1'; // Only has the default goal
      
      // Show wizard if no custom preferences and goals, and hasn't been shown before
      if (!userPreferences && noCustomGoals && !setupWizardShown) {
        setShowSetupWizard(true);
        // Mark that we've shown the wizard
        localStorage.setItem('setupWizardShown', 'true');
      }
      
      setHasCheckedWizardNeed(true);
    }
  }, [healthData.goals, hasCheckedWizardNeed]);

  // Force refresh data when component mounts to ensure we have the latest
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // Get recent weight data
  const weightData = getMetricHistory(healthData.metrics, 'Weight', 7);
  const latestWeight = weightData.length > 0 
    ? weightData[weightData.length - 1].value 
    : null;
    
  const weightGoal = healthData.goals.find(goal => goal.name === 'Weight');
  const weightProgress = weightGoal ? getGoalProgress(weightGoal) : null;
  
  // Get daily metrics
  const todayWater = getMetricHistory(healthData.metrics, 'Water Intake', 1)[0]?.value || 0;
  const todaySteps = getMetricHistory(healthData.metrics, 'Steps', 1)[0]?.value || 0;
  const todaySleep = getMetricHistory(healthData.metrics, 'Sleep', 1)[0]?.value || 0;
  
  // Calculate target values
  const waterTarget = healthData.metrics.find(m => m.name === 'Water Target')?.value || 3;
  const stepsTarget = healthData.metrics.find(m => m.name === 'Steps Target')?.value || 10000;
  const sleepTarget = healthData.metrics.find(m => m.name === 'Sleep Target')?.value || 8;
  
  // Calculate progress percentages for daily metrics
  const waterProgress = Math.min(100, Math.round((todayWater / waterTarget) * 100));
  const stepsProgress = Math.min(100, Math.round((todaySteps / stepsTarget) * 100));
  const sleepProgress = Math.min(100, Math.round((todaySleep / sleepTarget) * 100));
  
  // Create data for the daily metrics chart
  const dailyProgressData = [
    { name: 'Water', value: waterProgress, target: 100, fill: '#4CAF50' },
    { name: 'Steps', value: stepsProgress, target: 100, fill: '#009688' },
    { name: 'Sleep', value: sleepProgress, target: 100, fill: '#673AB7' },
  ];
  
  // Get in-progress and completed tips
  const completedTips = healthData.dailyTips.tips.filter(tip => tip.completed).length;
  const totalTips = healthData.dailyTips.tips.length;
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex mb-2">

        <img src={brand} className='mr-2' style={{width: '40px'}} alt="" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Welcome to your health tracking app</p>
      </div>
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Weight Metric Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Current Weight</span>
              {weightProgress !== null && (
                <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {weightProgress}% to goal
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center pt-4">
              <div className="text-4xl font-bold mb-2">{latestWeight ? `${latestWeight} kg` : 'No data'}</div>
              {weightGoal && (
                <div className="text-muted-foreground text-sm">
                  Goal: {weightGoal.target} kg by {new Date(weightGoal.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/progress">
                View Progress <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Daily Progress Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Daily Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={dailyProgressData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => [`${value}% complete`, 'Progress']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {dailyProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
            <div className="flex justify-between w-full">
              <span>Water: {todayWater}L / {waterTarget}L</span>
              <span className={`${waterProgress >= 100 ? 'text-green-500 font-medium' : ''}`}>
                {waterProgress}%
              </span>
            </div>
            <div className="flex justify-between w-full">
              <span>Steps: {todaySteps.toLocaleString()} / {stepsTarget.toLocaleString()}</span>
              <span className={`${stepsProgress >= 100 ? 'text-green-500 font-medium' : ''}`}>
                {stepsProgress}%
              </span>
            </div>
            <div className="flex justify-between w-full">
              <span>Sleep: {todaySleep}h / {sleepTarget}h</span>
              <span className={`${sleepProgress >= 100 ? 'text-green-500 font-medium' : ''}`}>
                {sleepProgress}%
              </span>
            </div>
          </CardFooter>
        </Card>
        
        {/* Health Tips Progress */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Daily Health Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: completedTips, fill: '#4CAF50' },
                      { name: 'Remaining', value: totalTips - completedTips, fill: '#E0E0E0' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  />
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2 mb-4">
              <div className="text-2xl font-bold">{completedTips} / {totalTips}</div>
              <div className="text-muted-foreground">Tips completed today</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/tips">
                View Health Tips <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick Access and Pain Point Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Button variant="outline" asChild className="h-auto py-4 flex flex-col gap-2">
                  <Link to="/">
                    <BarChart3 className="h-6 w-6 mb-1" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex flex-col gap-2">
                  <Link to="/progress">
                    <BarChart3 className="h-6 w-6 mb-1" />
                    <span>Progress</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex flex-col gap-2">
                  <Link to="/diet">
                    <Utensils className="h-6 w-6 mb-1" />
                    <span>Diet Planner</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex flex-col gap-2">
                  <Link to="/tips">
                    <Heart className="h-6 w-6 mb-1" />
                    <span>Health Tips</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setShowSetupWizard(true)}>
                Update Goals
              </Button>
              {healthData.dailyTips.streak > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Footprints className="h-4 w-4" />
                  <span>
                    {healthData.dailyTips.streak} day streak
                  </span>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <PainPointTracker />
        </div>
      </div>
      
      {/* Setup Wizard Dialog */}
      <Dialog open={showSetupWizard} onOpenChange={setShowSetupWizard}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Set Up Your Health Goals</DialogTitle>
            <DialogDescription>
              Tell us about your health goals so we can personalize your experience
            </DialogDescription>
          </DialogHeader>
          <GoalSetupWizard onComplete={() => setShowSetupWizard(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
