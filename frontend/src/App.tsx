import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import LiveScores from "./pages/LiveScores";
import Schedule from "./pages/Schedule";

import LiveMatchDetail from "./pages/LiveMatchDetail";
import ResultMatchDetail from "./pages/ResultMatchDetail";
import ScheduleDetail from "./pages/ScheduleDetail";
import Firehose from "./pages/Firehose";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 30 * 1000,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Helmet>
          <title>STRYKER - Your Cricket Command Center</title>
          <meta
            name="description"
            content="STRYKER is the ultimate destination for serious cricket fans. Live scores, expert analysis, and intelligent discussions - all in one place."
          />
          <meta
            name="keywords"
            content="cricket, live scores, cricket news, cricket analysis, cricket community"
          />
        </Helmet>

        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Core pages */}
              <Route index element={<Home />} />
              <Route path="live" element={<LiveScores />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="buzz" element={<Firehose />} />

              {/* Match detail pages */}
              <Route
                path="match/:matchId"
                element={<LiveMatchDetail />}
              />
              <Route
                path="match/:matchId/live"
                element={<LiveMatchDetail />}
              />
              <Route
                path="match/:matchId/result"
                element={<ResultMatchDetail />}
              />
              <Route
                path="match/:matchId/schedule"
                element={<ScheduleDetail />}
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
