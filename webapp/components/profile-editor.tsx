"use client";

import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  AlertCircle,
  Loader2,
  User,
  Sparkles,
  Coins,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSWR from "swr";
import {
  getProfiles,
  getStatus,
  type ProfileResponse,
  type StatusResponse,
} from "@/lib/api";
import { toast } from "sonner";
import { useActivities } from "@/hooks/use-activities";
import { GAME_CONSTANTS } from "@/lib/constants";

export function ProfileEditor() {
  const [saving, setSaving] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  const { data: status } = useSWR<StatusResponse>("/api/status", getStatus);
  const {
    data: profiles,
    error,
    mutate,
  } = useSWR<ProfileResponse[]>("/api/profiles", getProfiles);
  const { mutate: mutateActivities } = useActivities();

  const [profileData, setProfileData] = useState({
    level: 1,
    xp: 0,
    merces: 0,
    prestige: 0,
  });

  useEffect(() => {
    if (profiles && profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
      setProfileData({
        level: profiles[0].level,
        xp: profiles[0].xp,
        merces: profiles[0].merces,
        prestige: profiles[0].prestige,
      });
    }
  }, [profiles, selectedProfileId]);

  const handleProfileChange = (profileId: string) => {
    const profile = profiles?.find((p) => p.id === profileId);
    if (profile) {
      setSelectedProfileId(profileId);
      setProfileData({
        level: profile.level,
        xp: profile.xp,
        merces: profile.merces,
        prestige: profile.prestige,
      });
    }
  };

  const handleSave = async () => {
    if (!selectedProfileId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/profile/${selectedProfileId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      const result = await response.json();
      toast.success(result.message || "Profile saved successfully");
      mutate();
      mutateActivities();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const profile = profiles?.find((p) => p.id === selectedProfileId);
    if (profile) {
      setProfileData({
        level: profile.level,
        xp: profile.xp,
        merces: profile.merces,
        prestige: profile.prestige,
      });
      toast.info("Changes reset");
    }
  };

  if (!status?.connected) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Profile Editor
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manually edit your profile values
            </p>
          </div>
          <Alert
            variant="destructive"
            className="border-destructive/30 bg-destructive/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {status?.message ||
                "Unable to connect to Peacock. Make sure PEACOCK_PATH is set correctly."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Profile Editor
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manually edit your profile values
            </p>
          </div>
          <Alert
            variant="destructive"
            className="border-destructive/30 bg-destructive/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load profiles. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-chart-2/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-8 p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Profile Editor
              </h1>
            </div>
            <p className="text-muted-foreground ml-13">
              Manually edit your profile values
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 border-border/60 bg-transparent transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              className="gap-2 shadow-lg shadow-primary/20"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Profile Selector */}
        {profiles && profiles.length > 1 && (
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10">
                  <User className="h-4 w-4 text-chart-2" />
                </div>
                Select Profile
              </CardTitle>
              <CardDescription>Choose which profile to edit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <Button
                    key={profile.id}
                    variant={
                      selectedProfileId === profile.id ? "default" : "outline"
                    }
                    onClick={() => handleProfileChange(profile.id)}
                    className={`font-mono text-sm ${
                      selectedProfileId === profile.id
                        ? "shadow-lg shadow-primary/20"
                        : "border-border/60 hover:bg-muted/50"
                    }`}
                  >
                    {profile.id.substring(0, 8)}...
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Editor Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Player Stats */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-1/10">
                  <Zap className="h-4 w-4 text-chart-1" />
                </div>
                Player Statistics
              </CardTitle>
              <CardDescription>
                Edit player level and experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="level" className="text-sm font-medium">
                  Player Level
                </Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="7500"
                  value={profileData.level}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      level: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  className="font-mono bg-background/50 border-border/60 focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">Maximum: 7,500</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="xp" className="text-sm font-medium">
                  Total XP
                </Label>
                <Input
                  id="xp"
                  type="number"
                  min="0"
                  value={profileData.xp}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      xp: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="font-mono bg-background/50 border-border/60 focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  XP is calculated at 6,000 per level
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const calculatedXp = profileData.level * 6000;
                  setProfileData({ ...profileData, xp: calculatedXp });
                  toast.info(`XP set to ${calculatedXp.toLocaleString()}`);
                }}
                className="w-full border-dashed border-border/60 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Calculate XP from Level
              </Button>
            </CardContent>
          </Card>

          {/* Currency & Progression */}
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/10">
                  <Coins className="h-4 w-4 text-chart-4" />
                </div>
                Currency & Progression
              </CardTitle>
              <CardDescription>
                Edit merces and freelancer prestige
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="merces" className="text-sm font-medium">
                  Merces (Currency)
                </Label>
                <Input
                  id="merces"
                  type="number"
                  min="0"
                  value={profileData.merces}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      merces: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="font-mono bg-background/50 border-border/60 focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Freelancer mode currency
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prestige" className="text-sm font-medium">
                  Freelancer Prestige
                </Label>
                <Input
                  id="prestige"
                  type="number"
                  min="0"
                  max="100"
                  value={profileData.prestige}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      prestige: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="font-mono bg-background/50 border-border/60 focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">Maximum: 100</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Values Display */}
        <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10">
                <Trophy className="h-4 w-4 text-chart-3" />
              </div>
              Current Values
            </CardTitle>
            <CardDescription>Preview of changes to be saved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group rounded-xl border border-border/40 bg-background/50 p-4 transition-all hover:border-border/80 hover:shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-chart-1" />
                  Level
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {profileData.level.toLocaleString()}
                </p>
              </div>
              <div className="group rounded-xl border border-border/40 bg-background/50 p-4 transition-all hover:border-border/80 hover:shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Total XP
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                  {profileData.xp.toLocaleString()}
                </p>
              </div>
              <div className="group rounded-xl border border-border/40 bg-background/50 p-4 transition-all hover:border-border/80 hover:shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Coins className="h-3.5 w-3.5 text-chart-4" />
                  Merces
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums text-chart-4">
                  {profileData.merces.toLocaleString()}
                </p>
              </div>
              <div className="group rounded-xl border border-border/40 bg-background/50 p-4 transition-all hover:border-border/80 hover:shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-3.5 w-3.5 text-chart-3" />
                  Prestige
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums text-chart-3">
                  {profileData.prestige}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
