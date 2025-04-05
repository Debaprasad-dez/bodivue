
import { useState } from 'react';
import { useHealth } from '@/contexts/HealthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getDaysToGoal, getGoalProgress, getLatestMetric } from '@/utils/localStorage';
import { Plus, Droplets, Footprints, Moon, Plus as PlusIcon, X } from 'lucide-react';

// Emoji picker component
const EmojiPicker = ({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) => {
  const emojis = ['😊', '😢', '😡', '😴', '🤒', '🤕', '😫', '🤔', '😰', '💪'];
  
  return (
    <div className="grid grid-cols-5 gap-2">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-2xl p-2 hover:bg-muted rounded-md transition-colors"
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ metricId }: { metricId: string }) => {
  const { healthData, addMetric } = useHealth();
  const [newValue, setNewValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Find the metric definition
  const metricData = healthData.metrics.find(m => m.id === metricId) || 
    healthData.metrics.find(m => m.id.startsWith(metricId));
  
  if (!metricData) return null;
  
  // Get all metrics with this name to calculate the latest
  const latestMetric = getLatestMetric(healthData.metrics, metricData.name);
  
  const handleUpdateMetric = () => {
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      addMetric(metricData.name, numValue, metricData.unit, metricData.targetValue);
      setNewValue("");
      setIsUpdating(false);
    }
  };
  
  const getIcon = () => {
    switch (metricData.name.toLowerCase()) {
      case 'water intake':
        return <Droplets className="h-8 w-8 text-blue-500" />;
      case 'steps':
        return <Footprints className="h-8 w-8 text-green-500" />;
      case 'sleep':
        return <Moon className="h-8 w-8 text-purple-500" />;
      default:
        return <div className="h-8 w-8 rounded-full bg-health-teal flex items-center justify-center text-white">
          {metricData.name.charAt(0).toUpperCase()}
        </div>;
    }
  };
  
  // Calculate progress
  let progressPercent = metricData.targetValue 
    ? Math.min(100, Math.round((latestMetric?.value || 0) / metricData.targetValue * 100)) 
    : 0;
  
  return (
    <Card className="metric-card animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{metricData.name}</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{latestMetric?.value || 0} {metricData.unit}</div>
        
        {metricData.targetValue && (
          <>
            <p className="text-xs text-muted-foreground mt-1">
              Target: {metricData.targetValue} {metricData.unit}
            </p>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </>
        )}
        
        {isUpdating ? (
          <div className="mt-3 flex gap-2">
            <Input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="New value"
              className="text-sm"
            />
            <Button size="sm" onClick={handleUpdateMetric}>
              Save
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full"
            onClick={() => setIsUpdating(true)}
          >
            Update
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { healthData, addPainPoint } = useHealth();
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [painDesc, setPainDesc] = useState('');
  
  const handleAddPainPoint = () => {
    if (selectedEmoji && painDesc.trim()) {
      addPainPoint(selectedEmoji, painDesc.trim());
      setSelectedEmoji(null);
      setPainDesc('');
    }
  };
  
  // Get main goal (first one for now)
  const mainGoal = healthData.goals[0];
  const daysLeft = getDaysToGoal(mainGoal);
  const progress = getGoalProgress(mainGoal);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground">Your health journey at a glance</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-health-teal hover:bg-health-darkGreen">
              <PlusIcon className="mr-2 h-4 w-4" />
              Log Pain Point
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log a Pain Point</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">How are you feeling?</label>
                <EmojiPicker onEmojiSelect={(emoji) => setSelectedEmoji(emoji)} />
                {selectedEmoji && (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <span className="text-2xl">{selectedEmoji}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => setSelectedEmoji(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="What's bothering you?"
                  value={painDesc}
                  onChange={(e) => setPainDesc(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full bg-health-teal hover:bg-health-darkGreen" 
                disabled={!selectedEmoji || !painDesc.trim()}
                onClick={handleAddPainPoint}
              >
                Save Pain Point
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Goal Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Goal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {daysLeft > 0 
              ? `${daysLeft} days to go! 💪` 
              : "Goal deadline reached!"
            }
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {mainGoal.name}: {mainGoal.current} {mainGoal.unit} / Target: {mainGoal.target} {mainGoal.unit}
          </p>
          <div className="progress-bar mt-3">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
      
      {/* Metrics Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Metrics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.settings.selectedMetrics.map(metricId => (
            <MetricCard key={metricId} metricId={metricId} />
          ))}
        </div>
      </div>
      
      {/* Recent Pain Points */}
      {healthData.painPoints.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Pain Points</h2>
          <div className="space-y-3">
            {healthData.painPoints
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map(point => (
                <Card key={point.id}>
                  <CardContent className="py-4">
                    <div className="flex gap-3 items-start">
                      <div className="text-3xl">{point.emoji}</div>
                      <div>
                        <p>{point.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(point.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
