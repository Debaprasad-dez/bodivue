
import React, { useState } from 'react';
import { useHealth } from '@/contexts/HealthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format, addMonths } from 'date-fns';
import { Check, ArrowRight } from 'lucide-react';

const goalFormSchema = z.object({
  targetWeight: z.coerce.number().positive('Weight must be positive').min(30, 'Weight must be at least 30kg').max(300, 'Weight must be less than 300kg'),
  goalDate: z.string().min(1, 'Please select a date'),
  waterTarget: z.coerce.number().min(1, 'Water target must be at least 1L').max(10, 'Water target must be less than 10L'),
  stepsTarget: z.coerce.number().min(1000, 'Steps target must be at least 1,000').max(50000, 'Steps target must be less than 50,000'),
  sleepTarget: z.coerce.number().min(4, 'Sleep target must be at least 4 hours').max(12, 'Sleep target must be less than 12 hours'),
  preferredCuisine: z.string().min(1, 'Please select a cuisine'),
  healthPriority: z.string().min(1, 'Please select a health priority'),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

const cuisineOptions = [
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'asian', label: 'Asian' },
  { value: 'vegan', label: 'Vegan/Plant-based' },
  { value: 'keto', label: 'Keto' },
  { value: 'western', label: 'Western' },
];

const healthPriorityOptions = [
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'muscle-gain', label: 'Muscle Gain' },
  { value: 'energy', label: 'Energy & Focus' },
  { value: 'heart-health', label: 'Heart Health' },
  { value: 'general', label: 'General Wellness' },
];

interface GoalSetupWizardProps {
  onComplete: () => void;
}

const GoalSetupWizard = ({ onComplete }: GoalSetupWizardProps) => {
  const { healthData, updateGoal, addMetric } = useHealth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get latest weight for initial value
  const latestWeight = healthData.metrics
    .filter(metric => metric.name === 'Weight')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value || 70;
  
  // Default date is 3 months from now
  const defaultDate = format(addMonths(new Date(), 3), 'yyyy-MM-dd');

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      targetWeight: latestWeight - 5, // Default to 5kg less than current weight
      goalDate: defaultDate,
      waterTarget: 3,
      stepsTarget: 10000,
      sleepTarget: 8,
      preferredCuisine: '',
      healthPriority: '',
    },
  });

  const handleNext = () => {
    if (step === 1) {
      // Validate first step fields before proceeding
      form.trigger(['targetWeight', 'goalDate']);
      if (form.getFieldState('targetWeight').invalid || form.getFieldState('goalDate').invalid) {
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: GoalFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create weight goal
      updateGoal({
        id: 'weight-goal',
        name: 'Weight',
        target: data.targetWeight,
        current: latestWeight,
        unit: 'kg',
        deadline: data.goalDate,
      });
      
      // Add target metrics
      addMetric('Water Target', data.waterTarget, 'L', data.waterTarget);
      addMetric('Steps Target', data.stepsTarget, 'steps', data.stepsTarget);
      addMetric('Sleep Target', data.sleepTarget, 'hours', data.sleepTarget);
      
      // Store preferences in localStorage
      const preferences = {
        preferredCuisine: data.preferredCuisine,
        healthPriority: data.healthPriority,
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      toast.success("Your goals have been set successfully!", {
        position: "top-center",
        duration: 3000,
      });
      
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      console.error('Error setting goals:', error);
      toast.error("Failed to set goals. Please try again.", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Goal Setup Wizard</CardTitle>
        <CardDescription>Set your health goals and preferences</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div 
              key={stepNumber} 
              className={`flex flex-col items-center w-1/3 ${step === stepNumber ? 'opacity-100' : 'opacity-60'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                step >= stepNumber ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <div className="text-xs text-center">
                {stepNumber === 1 ? 'Weight Goal' : stepNumber === 2 ? 'Daily Targets' : 'Preferences'}
              </div>
            </div>
          ))}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="targetWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your current weight is {latestWeight}kg
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="goalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Set a realistic deadline for your goal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="waterTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Water Target (L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Recommended: 2-4 liters per day
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stepsTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Steps Target</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Recommended: 8,000-12,000 steps per day
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sleepTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Sleep Target (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" {...field} />
                      </FormControl>
                      <FormDescription>
                        Recommended: 7-9 hours per day
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferredCuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Cuisine</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a cuisine style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cuisineOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        We'll suggest recipes based on your preference
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="healthPriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your main health goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {healthPriorityOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your priority helps us personalize your experience
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={handlePrevious}>
            Back
          </Button>
        ) : (
          <div></div> // Empty div to maintain layout with flex justify-between
        )}
        
        {step < 3 ? (
          <Button type="button" onClick={handleNext} className="gap-2">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Goals'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GoalSetupWizard;
