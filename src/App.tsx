
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HealthProvider } from "@/contexts/HealthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import HealthTips from "@/pages/HealthTips";
import DietPlanner from "@/pages/DietPlanner";
import ProgressAnalytics from "@/pages/ProgressAnalytics";
import NotFound from "@/pages/NotFound";
import { HashRouter } from 'react-router-dom';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="health-tracker-theme">
      <TooltipProvider>
        <HealthProvider>
          <Toaster />
          <Sonner position="top-right" closeButton />
          <HashRouter>
  <Layout>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/tips" element={<HealthTips />} />
      <Route path="/diet" element={<DietPlanner />} />
      <Route path="/progress" element={<ProgressAnalytics />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
</HashRouter>
        </HealthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
