
import { useState, useEffect } from 'react';
import { useHealth } from '@/contexts/HealthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertTriangle, Clock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const PainPointTracker = () => {
  const { healthData, addPainPoint, refreshData } = useHealth();
  const [emoji, setEmoji] = useState('😣');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Get the last 5 pain points
  const recentPainPoints = [...healthData.painPoints]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const emojiOptions = ['😣', '🤕', '😷', '🤒', '😨', '😰', '🥴', '🤢', '🤮'];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Please describe your pain point");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      addPainPoint(emoji, description);
      toast.success("Pain point recorded successfully");
      setDescription('');
      // Force data refresh to show new pain point
      refreshData();
    } catch (error) {
      console.error('Error adding pain point:', error);
      toast.error("Failed to record pain point");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Log Health Issue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="emoji">How are you feeling?</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {emojiOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={emoji === option ? "default" : "outline"}
                  className="text-2xl h-12 w-12 p-0"
                  onClick={() => setEmoji(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Describe what's wrong</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Headache, back pain, upset stomach..."
              className="mt-1"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !description.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Recording...' : 'Record Pain Point'}
          </Button>
        </form>
        
        {/* Pain point history */}
        {recentPainPoints.length > 0 && (
          <div className="mt-4">
            <Collapsible 
              open={showHistory} 
              onOpenChange={setShowHistory}
              className="border rounded-md p-2"
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full flex justify-between">
                  <span>Recent Health Issues</span>
                  <span>{showHistory ? '▲' : '▼'}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {recentPainPoints.map((painPoint) => (
                  <div key={painPoint.id} className="border-b pb-2 last:border-0 flex gap-2">
                    <span className="text-2xl">{painPoint.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm">{painPoint.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(painPoint.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PainPointTracker;
