"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinorUnits } from "@/lib/money/money";
import { formatDate } from "@/lib/dates/dates";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Receipt,
  CalendarDays,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { CalendarEvent, DayCalendarSummary } from "@/services/calendar.service";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [calendarData, setCalendarData] = React.useState<{ [key: string]: DayCalendarSummary }>({});
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchCalendar = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
      const json = await res.json();
      if (json.data) {
        setCalendarData(json.data);
      }
    } catch {
      toast.error("Failed to load calendar events.");
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  React.useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const activeDaySummary = selectedDay ? calendarData[selectedDay] : null;

  return (
    <div className="space-y-8">
      {/* Top Header & Month Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Event Calendar</h2>
          <p className="text-sm text-muted-foreground">
            Day-by-day map of income cash-ins, expense outflows, bill due dates, and routine schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-[140px] text-center font-bold text-sm">
            {formatDate(currentDate, "MMMM yyyy")}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs font-semibold"
          >
            Today
          </Button>
        </div>
      </div>

      {/* Main Grid: Calendar + Day Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 7-column Calendar View */}
        <Card className="lg:col-span-3 shadow-sm overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-bold text-muted-foreground py-2.5">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Day Cells */}
          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60 bg-card">
              {days.map((day) => {
                const dateKey = formatDate(day, "yyyy-MM-dd");
                const daySummary = calendarData[dateKey];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);
                const isSelected = selectedDay === dateKey;

                return (
                  <div
                    key={dateKey}
                    onClick={() => setSelectedDay(dateKey)}
                    className={`min-h-[95px] p-2 flex flex-col justify-between cursor-pointer transition-colors ${
                      !isCurrentMonth ? "opacity-35 bg-muted/10" : ""
                    } ${isSelected ? "bg-primary/10 ring-2 ring-primary inset-0" : "hover:bg-muted/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                          isDayToday
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {formatDate(day, "d")}
                      </span>

                      {daySummary && (daySummary.incomeMinor > 0 || daySummary.expenseMinor > 0) && (
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            daySummary.incomeMinor >= daySummary.expenseMinor
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {daySummary.incomeMinor > 0 && `+₹${Math.round(daySummary.incomeMinor / 100)}`}
                        </span>
                      )}
                    </div>

                    {/* Events indicators */}
                    <div className="space-y-1 mt-1">
                      {daySummary?.events.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                            ev.type === "transaction_income"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : ev.type === "transaction_expense"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : ev.type === "bill"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {daySummary && daySummary.events.length > 2 && (
                        <span className="text-[9px] text-muted-foreground font-bold pl-1">
                          +{daySummary.events.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Selected Day Events Sheet */}
        <Card className="shadow-sm h-fit">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Day Details
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedDay ? formatDate(selectedDay, "EEEE, MMMM dd, yyyy") : "Select a day on the calendar"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {!selectedDay ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Click any calendar cell to inspect transactions, scheduled bills, and routine items.
              </p>
            ) : !activeDaySummary || activeDaySummary.events.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No financial events recorded for this date.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                {activeDaySummary.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="truncate">{ev.title}</span>
                      <span
                        className={`font-mono font-bold ${
                          ev.type === "transaction_income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : ev.type === "transaction_expense"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-foreground"
                        }`}
                      >
                        {formatMinorUnits(ev.amountMinor, { currency: ev.currency })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="capitalize">{ev.type.replace("_", " ")}</span>
                      {ev.categoryName && <span>{ev.categoryName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
