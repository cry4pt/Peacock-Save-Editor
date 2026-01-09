"use client";

import { useState } from "react";
import {
  Trophy,
  MapPin,
  TrendingUp,
  BookOpen,
  Unlock,
  Zap,
  Target,
  ChevronRight,
  AlertCircle,
  Loader2,
  Clock,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import useSWR from "swr";
import {
  getProfiles,
  getChallenges,
  getLocations,
  getEscalations,
  getStories,
  getStatus,
  unlockAll,
  unlockContent,
  maxAllMastery,
  clearActivities,
  type ProfileResponse,
  type StatusResponse,
} from "@/lib/api";
import { toast } from "sonner";
import { useActivities } from "@/hooks/use-activities";
import { GAME_CONSTANTS } from "@/lib/constants";

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export function Dashboard() {
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [clearingActivities, setClearingActivities] = useState(false);

  const { data: status } = useSWR<StatusResponse>("/api/status", getStatus);
  const { data: profiles, mutate: mutateProfiles } = useSWR<ProfileResponse[]>(
    "/api/profiles",
    getProfiles,
  );
  const { data: challenges } = useSWR("/api/challenges", getChallenges);
  const { data: locations } = useSWR("/api/locations", getLocations);
  const { data: escalations } = useSWR("/api/escalations", getEscalations);
  const { data: stories } = useSWR("/api/stories", getStories);
  const { activities, mutate: mutateActivities } = useActivities();

  const profile = profiles?.[0];

  const stats = [
    {
      name: "Challenges",
      value: challenges?.length?.toLocaleString() ?? "...",
      completed: profile?.challenges_completed ?? 0,
      icon: Trophy,
      href: "/challenges",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      name: "Locations",
      value: locations?.length?.toString() ?? "...",
      completed: profile?.locations_count ?? 0,
      icon: MapPin,
      href: "/locations",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      name: "Escalations",
      value: escalations?.length?.toString() ?? "...",
      completed: profile?.escalations_completed ?? 0,
      icon: TrendingUp,
      href: "/escalations",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      name: "Mission Stories",
      value: stories?.length?.toString() ?? "...",
      completed: profile?.stories_completed ?? 0,
      icon: BookOpen,
      href: "/stories",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  const handleUnlockAll = async () => {
    setUnlocking("unlock-all");
    try {
      const result = await unlockContent();
      toast.success(result.message);
      mutateProfiles();
      mutateActivities();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unlock all content",
      );
    } finally {
      setUnlocking(null);
    }
  };

  const handleMaxMastery = async () => {
    setUnlocking("max-mastery");
    try {
      const result = await maxAllMastery();
      toast.success(result.message);
      mutateProfiles();
      mutateActivities();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to max mastery",
      );
    } finally {
      setUnlocking(null);
    }
  };

  const handleCompleteProfile = async () => {
    setUnlocking("complete-profile");
    try {
      const result = await unlockAll();
      toast.success(result.message);
      mutateProfiles();
      mutateActivities();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete profile",
      );
    } finally {
      setUnlocking(null);
    }
  };

  const handleClearActivities = async () => {
    setClearingActivities(true);
    try {
      const result = await clearActivities();
      toast.success(result.message || "Activities cleared");
      mutateActivities();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear activities",
      );
    } finally {
      setClearingActivities(false);
    }
  };

  const quickActions = [
    {
      name: "Unlock All Content",
      description: "Instantly unlock all challenges, locations, and items",
      icon: Unlock,
      action: handleUnlockAll,
      id: "unlock-all",
    },
    {
      name: "Max All Mastery",
      description: "Set all location mastery to maximum level",
      icon: Zap,
      action: handleMaxMastery,
      id: "max-mastery",
    },
    {
      name: "Complete Profile",
      description: "Max level, XP, and all unlockables",
      icon: Target,
      action: handleCompleteProfile,
      id: "complete-profile",
    },
  ];

  if (!status?.connected) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your Peacock profile and unlock content
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {status?.message ||
              "Unable to connect to Peacock. Make sure PEACOCK_PATH is set correctly."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your Peacock profile and unlock content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="group cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  {stat.completed > 0 && (
                    <p className="text-xs text-primary mt-1">
                      {stat.completed} completed
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              One-click operations for your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={action.action}
                disabled={unlocking !== null}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
              >
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{action.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                {unlocking === action.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Overview</CardTitle>
            <CardDescription>Current progression status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Player Level</span>
                    <span className="font-medium text-foreground">
                      Level {profile.level.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (profile.level / GAME_CONSTANTS.MAX_LEVEL) * 100,
                      100,
                    )}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Overall Completion
                    </span>
                    <span className="font-medium text-foreground">
                      {(() => {
                        const totalItems =
                          (challenges?.length || 0) +
                          (locations?.length || 0) +
                          (escalations?.length || 0) +
                          (stories?.length || 0);
                        const completedItems =
                          profile.challenges_completed +
                          profile.locations_count +
                          profile.escalations_completed +
                          profile.stories_completed;
                        const percentage =
                          totalItems > 0
                            ? Math.round((completedItems / totalItems) * 100)
                            : 0;
                        return `${percentage}%`;
                      })()}
                    </span>
                  </div>
                  <Progress
                    value={(() => {
                      const totalItems =
                        (challenges?.length || 0) +
                        (locations?.length || 0) +
                        (escalations?.length || 0) +
                        (stories?.length || 0);
                      const completedItems =
                        profile.challenges_completed +
                        profile.locations_count +
                        profile.escalations_completed +
                        profile.stories_completed;
                      return totalItems > 0
                        ? (completedItems / totalItems) * 100
                        : 0;
                    })()}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Freelancer</span>
                    <span className="font-medium text-foreground">
                      Prestige {profile.prestige}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(profile.prestige, 100)}
                    className="h-2"
                  />
                </div>
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total XP</span>
                    <span className="font-mono font-medium text-primary">
                      {profile.xp.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Merces</span>
                    <span className="font-mono font-medium text-chart-4">
                      {profile.merces.toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>
                Your latest profile modifications
              </CardDescription>
            </div>
            {activities && activities.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={clearingActivities}
                    className="gap-2"
                  >
                    {clearingActivities ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all activity?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove all {activities.length}{" "}
                      activity
                      {activities.length !== 1 ? " entries" : " entry"} from
                      your history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearActivities}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {activity.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
