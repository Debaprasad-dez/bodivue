import { useState, useRef, useEffect } from 'react';
import { useHealth } from '@/contexts/HealthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { getMetricHistory, addMetric } from '@/utils/localStorage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Download, AlertCircle, Info, Clock, Undo } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ProgressAnalytics = () => {
  const { healthData, canUpdateWeight } = useHealth();
  const chartRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Water Intake', 'Steps', 'Sleep']);
  const [isExporting, setIsExporting] = useState(false);
  
  const [newWeight, setNewWeight] = useState<string>('');
  const [weightUpdateStatus, setWeightUpdateStatus] = useState<{ canUpdate: boolean; hoursRemaining: number }>({ canUpdate: true, hoursRemaining: 0 });
  
  const [waterInput, setWaterInput] = useState<string>('');
  const [stepsInput, setStepsInput] = useState<string>('');
  const [sleepInput, setSleepInput] = useState<string>('');
  
  const [lastAddedMetric, setLastAddedMetric] = useState<{
    name: string;
    value: number;
    unit: string;
    id: string;
    timestamp: number;
  } | null>(null);
  
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const weightHistory = getMetricHistory(
    healthData.metrics,
    'Weight',
    parseInt(timeRange)
  ).map(metric => ({
    date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: metric.value
  }));
  
  useEffect(() => {
    const checkWeightUpdateEligibility = () => {
      const status = canUpdateWeight();
      setWeightUpdateStatus(status);
    };
    
    checkWeightUpdateEligibility();
    
    const timer = setInterval(() => {
      checkWeightUpdateEligibility();
    }, 60 * 1000); // Update every minute
    
    return () => clearInterval(timer);
  }, [canUpdateWeight, healthData.metrics]);

  useEffect(() => {
    let undoTimer: NodeJS.Timeout;
    
    if (lastAddedMetric) {
      undoTimer = setTimeout(() => {
        setLastAddedMetric(null);
      }, 10000); // 10 seconds
    }
    
    return () => {
      if (undoTimer) clearTimeout(undoTimer);
    };
  }, [lastAddedMetric]);
  
  const getMetricData = (name: string) => {
    return getMetricHistory(
      healthData.metrics,
      name,
      7
    ).map(metric => ({
      date: new Date(metric.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: metric.value
    }));
  };

  const handleUndoMetric = () => {
    if (!lastAddedMetric) return;
    
    try {
      const updatedMetrics = healthData.metrics.filter(
        m => m.id !== lastAddedMetric.id
      );
      
      const updatedHealthData = {
        ...healthData,
        metrics: updatedMetrics
      };
      
      localStorage.setItem('healthData', JSON.stringify(updatedHealthData));
      
      toast.success(`${lastAddedMetric.name} update undone`, {
        description: "Your last entry has been removed",
      });
      
      setRefreshKey(prev => prev + 1);
      setLastAddedMetric(null);
      
      if (lastAddedMetric.name === 'Weight') setNewWeight('');
      else if (lastAddedMetric.name === 'Water Intake') setWaterInput('');
      else if (lastAddedMetric.name === 'Steps') setStepsInput('');
      else if (lastAddedMetric.name === 'Sleep') setSleepInput('');
      
    } catch (error) {
      console.error('Error undoing metric:', error);
      toast.error("Failed to undo. Please try again.");
    }
  };
  
  const handleWeightSubmit = () => {
    const weightValue = parseFloat(newWeight);
    
    if (isNaN(weightValue) || weightValue <= 0) {
      toast("Invalid weight", {
        description: "Please enter a valid weight value",
      });
      return;
    }
    
    if (!weightUpdateStatus.canUpdate) {
      toast("Weight update restricted", {
        description: `You can update your weight again in ${weightUpdateStatus.hoursRemaining}h`,
      });
      return;
    }
    
    const metricId = `Weight-${Date.now()}`;
    addMetric('Weight', weightValue, 'kg');
    
    setLastAddedMetric({
      name: 'Weight',
      value: weightValue,
      unit: 'kg',
      id: metricId,
      timestamp: Date.now()
    });
    
    toast("Weight updated", {
      description: "Your weight has been recorded successfully!",
      action: {
        label: "Undo",
        onClick: handleUndoMetric,
      },
    });
    
    setNewWeight('');
    setRefreshKey(prev => prev + 1);
  };
  
  const handleMetricSubmit = (metricName: string, value: string, unit: string) => {
    const metricValue = parseFloat(value);
    
    if (isNaN(metricValue) || metricValue < 0) {
      toast(`Invalid ${metricName.toLowerCase()}`, {
        description: `Please enter a valid ${metricName.toLowerCase()} value`,
      });
      return;
    }
    
    const metricId = `${metricName}-${Date.now()}`;
    addMetric(metricName, metricValue, unit);
    
    setLastAddedMetric({
      name: metricName,
      value: metricValue,
      unit,
      id: metricId,
      timestamp: Date.now()
    });
    
    toast(`${metricName} updated`, {
      description: `Your ${metricName.toLowerCase()} has been recorded`,
      action: {
        label: "Undo",
        onClick: handleUndoMetric,
      },
    });
    
    if (metricName === 'Water Intake') setWaterInput('');
    else if (metricName === 'Steps') setStepsInput('');
    else if (metricName === 'Sleep') setSleepInput('');
    
    setRefreshKey(prev => prev + 1);
  };
  
  const availableMetrics = Array.from(
    new Set(healthData.metrics.map(metric => metric.name))
  ).filter(name => name !== 'Weight');
  
  const handleExportChart = async () => {
    if (!chartRef.current) return;
    
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'health-progress.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast("Chart exported", {
        description: "Your chart has been exported successfully!",
      });
    } catch (error) {
      console.error('Error exporting chart:', error);
      toast("Export failed", {
        description: "Failed to export chart. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleSelectMetric = (index: number, metricName: string) => {
    const newSelectedMetrics = [...selectedMetrics];
    newSelectedMetrics[index] = metricName;
    setSelectedMetrics(newSelectedMetrics);
  };
  
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };
  
  const getMetricUnit = (name: string): string => {
    const metric = healthData.metrics.find(m => m.name === name);
    return metric?.unit || '';
  };
  
  const getUnitForMetric = (metricName: string): string => {
    switch(metricName) {
      case 'Water Intake': return 'L';
      case 'Steps': return 'steps';
      case 'Sleep': return 'hours';
      default: return '';
    }
  };
  
  const waterData = getMetricData('Water Intake');
  const stepsData = getMetricData('Steps');
  const sleepData = getMetricData('Sleep');
  
  return (
    <div className="space-y-6" ref={chartRef} key={refreshKey}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Progress Analytics</h1>
          <p className="text-muted-foreground">Track your health metrics over time</p>
        </div>
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleExportChart}
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Charts'}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Weight Trends</CardTitle>
            <Select 
              value={timeRange} 
              onValueChange={value => setTimeRange(value)}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="30 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {weightHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weightHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Weight (kg)"
                    stroke="#009688"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No weight data available</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto flex-1">
              <Input
                type="number"
                placeholder="Enter weight (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                disabled={!weightUpdateStatus.canUpdate}
                className="pr-10"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Weight can only be updated once every 48 hours to avoid daily fluctuations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleWeightSubmit} 
                disabled={!weightUpdateStatus.canUpdate || !newWeight}
              >
                Update Weight
              </Button>
              {!weightUpdateStatus.canUpdate && (
                <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Next update in {weightUpdateStatus.hoursRemaining}h</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Water Intake</CardTitle>
            <CardDescription>Track your hydration (L)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {waterData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={waterData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Water (L)" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No water intake data available</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter water intake (L)"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                />
              </div>
              <Button onClick={() => handleMetricSubmit('Water Intake', waterInput, 'L')}>Add</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Daily Steps</CardTitle>
            <CardDescription>Track your activity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {stepsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stepsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={formatYAxis} />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Steps" fill="#009688" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No step data available</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter steps"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                />
              </div>
              <Button onClick={() => handleMetricSubmit('Steps', stepsInput, 'steps')}>Add</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Daily Sleep</CardTitle>
            <CardDescription>Track your sleep duration (hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {sleepData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sleepData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 12]} />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Sleep (hours)" fill="#673AB7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No sleep data available</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter sleep duration (hours)"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                />
              </div>
              <Button onClick={() => handleMetricSubmit('Sleep', sleepInput, 'hours')}>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {lastAddedMetric && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-20">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2 shadow-lg" 
            onClick={handleUndoMetric}
          >
            <Undo className="h-4 w-4" />
            Undo {lastAddedMetric.name} Update
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => {
          const metricName = availableMetrics.find(name => name === selectedMetrics[index]) || 
            (availableMetrics[0] ?? 'No data');
          
          if (['Water Intake', 'Steps', 'Sleep'].includes(metricName)) {
            return null;
          }
          
          const metricData = getMetricData(metricName);
          const metricInfo = healthData.metrics.find(m => m.name === metricName);
          const unit = metricInfo?.unit || '';
          
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{metricName}</CardTitle>
                  <Select 
                    value={selectedMetrics[index]} 
                    onValueChange={(value) => handleSelectMetric(index, value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMetrics.map(metric => (
                        <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {metricData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metricData}
                        margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          tickFormatter={formatYAxis}
                          tick={{ fontSize: 11 }}
                        />
                        <RechartsTooltip formatter={(value) => [`${value} ${unit}`, metricName]} />
                        <Bar 
                          dataKey="value" 
                          name={metricName} 
                          fill="#4CAF50" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressAnalytics;
