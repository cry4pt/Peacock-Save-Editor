"use client";

import { useState } from "react";
import {
  Search,
  Unlock,
  Check,
  Trophy,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import { unlockChallenges } from "@/lib/api";
import { toast } from "sonner";
import { useActivities } from "@/hooks/use-activities";

interface ChallengeData {
  id: string;
  name: string;
  description: string;
  location: string;
  completed: boolean;
}

interface ChallengesResponse {
  challenges: ChallengeData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function ChallengesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [unlocking, setUnlocking] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 100;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(searchQuery && { search: searchQuery }),
    ...(selectedLocation !== "All" && { location: selectedLocation }),
  });

  const { data, error, isLoading, mutate } = useSWR<ChallengesResponse>(
    `/api/challenges?${queryParams}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    { keepPreviousData: true },
  );

  const { mutate: mutateActivities } = useActivities();

  const challenges = data?.challenges ?? [];
  const pagination = data?.pagination;

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleUnlockSelected = async () => {
    if (selectedItems.length === 0) return;
    setUnlocking(true);
    try {
      const result = await unlockChallenges(selectedItems);
      toast.success(result.message);
      setSelectedItems([]);
      mutate();
      mutateActivities();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unlock challenges",
      );
    } finally {
      setUnlocking(false);
    }
  };

  const handleUnlockAll = async () => {
    setUnlocking(true);
    try {
      const result = await unlockChallenges();
      toast.success(result.message);
      mutate();
      mutateActivities();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to unlock all challenges",
      );
    } finally {
      setUnlocking(false);
    }
  };

  const handleUnlockSingle = async (id: string) => {
    try {
      const result = await unlockChallenges([id]);
      toast.success(result.message);
      mutate();
      mutateActivities();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unlock challenge",
      );
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setPage(1);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Failed to load challenges</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Challenges
          </h1>
          <p className="mt-1 text-muted-foreground">
            Browse and unlock challenges
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {pagination?.total ?? "..."} Total
          </Badge>
          <Button
            className="gap-2"
            onClick={handleUnlockAll}
            disabled={unlocking}
          >
            {unlocking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
            Unlock All
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
            challenges
          </span>
        </div>
      )}

      {/* Selection Bar */}
      {selectedItems.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>{selectedItems.length} challenge(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems([])}
                className="transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleUnlockSelected}
                disabled={unlocking}
              >
                {unlocking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
                Unlock Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`group cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                selectedItems.includes(challenge.id)
                  ? "border-primary bg-primary/5"
                  : ""
              } ${challenge.completed ? "opacity-60" : ""}`}
              onClick={() => toggleSelect(challenge.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedItems.includes(challenge.id)}
                      onCheckedChange={() => toggleSelect(challenge.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {challenge.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {challenge.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {challenge.location}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5 text-chart-4" />
                    {challenge.completed ? "Completed" : "Challenge"}
                  </div>
                  {!challenge.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs text-primary hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlockSingle(challenge.id);
                      }}
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      Unlock
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && challenges.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No challenges found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages || isLoading}
            className="transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
