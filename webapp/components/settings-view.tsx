"use client"

import { useState, useEffect } from "react"
import { Save, RotateCcw, FolderOpen, Shield, Zap, Map, Eye, Shirt, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import useSWR from "swr"
import {
  getSettings,
  saveSettings,
  getStatus,
  createBackup,
  restoreBackup,
  type SettingsData,
  type StatusResponse,
} from "@/lib/api"
import { toast } from "sonner"
import { useActivities } from "@/hooks/use-activities"

export function SettingsView() {
  const [saving, setSaving] = useState(false)
  const [backingUp, setBackingUp] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [apiEndpoint, setApiEndpoint] = useState("Loading...")

  const { data: status } = useSWR<StatusResponse>("/api/status", getStatus)
  const { data: apiSettings, error, isLoading, mutate } = useSWR<SettingsData>("/api/settings", getSettings)
  const { mutate: mutateActivities } = useActivities()

  const [settings, setSettings] = useState<SettingsData>({
    gameplayUnlockAllShortcuts: true,
    gameplayUnlockAllFreelancerMasteries: true,
    mapDiscoveryState: "REVEALED",
    enableMasteryProgression: false,
    elusivesAreShown: true,
    getDefaultSuits: true,
  })

  // Update local state when API data loads
  useEffect(() => {
    if (apiSettings) {
      setSettings(apiSettings)
    }
  }, [apiSettings])

  // Get API endpoint from window location
  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiEndpoint(`${window.location.protocol}//${window.location.host}`)
    }
  }, [])

  const toggleSetting = (key: keyof SettingsData) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await saveSettings(settings)
      toast.success(result.message)
      mutate()
      mutateActivities()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBackup = async () => {
    setBackingUp(true)
    try {
      const result = await createBackup()
      toast.success(result.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create backup")
    } finally {
      setBackingUp(false)
    }
  }

  const handleRestoreBackup = async () => {
    setRestoring(true)
    try {
      const result = await restoreBackup()
      toast.success(result.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore backup")
    } finally {
      setRestoring(false)
    }
  }

  const settingsOptions = [
    {
      key: "gameplayUnlockAllShortcuts" as const,
      label: "Unlock Shortcuts",
      description: "Unlock all agency pickups and shortcuts",
      icon: Zap,
    },
    {
      key: "gameplayUnlockAllFreelancerMasteries" as const,
      label: "Unlock Freelancer Masteries",
      description: "Unlock all freelancer mode masteries",
      icon: Shield,
    },
    {
      key: "elusivesAreShown" as const,
      label: "Show Elusive Targets",
      description: "Make elusive targets visible in menus",
      icon: Eye,
    },
    {
      key: "getDefaultSuits" as const,
      label: "Default Suits",
      description: "Set default suits for all locations",
      icon: Shirt,
    },
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">Configure Peacock options and manage backups</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load settings. Is the API server running?</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">Configure Peacock options and manage backups</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-transparent transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground" onClick={handleRestoreBackup} disabled={restoring}>
            {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Restore Backup
          </Button>
          <Button className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Peacock Path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="h-5 w-5 text-primary" />
              Peacock Installation
            </CardTitle>
            <CardDescription>Path to your Peacock server installation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="peacock-path">Installation Path</Label>
              <div className="flex gap-2">
                <Input
                  id="peacock-path"
                  value={status?.peacock_path ?? "Not connected"}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div className={`rounded-lg px-4 py-3 ${status?.connected ? "bg-success/10" : "bg-destructive/10"}`}>
              <div
                className={`flex items-center gap-2 text-sm ${status?.connected ? "text-success" : "text-destructive"}`}
              >
                <div className={`h-2 w-2 rounded-full ${status?.connected ? "bg-success" : "bg-destructive"}`} />
                {status?.connected ? "Peacock detected successfully" : "Peacock not connected"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Server</CardTitle>
            <CardDescription>Backend server status and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input
                value={apiEndpoint}
                readOnly
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Profiles Found</Label>
              <Input value={status?.profiles_count?.toString() ?? "0"} readOnly className="font-mono text-sm" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Options</CardTitle>
          <CardDescription>Configure options.ini settings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1">
              {settingsOptions.map((option, index) => (
                <div key={option.key}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-2.5">
                        <option.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[option.key] as boolean}
                      onCheckedChange={() => toggleSetting(option.key)}
                    />
                  </div>
                  {index < settingsOptions.length - 1 && <Separator />}
                </div>
              ))}

              <Separator />

              {/* Map Discovery State */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Map className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Reveal All Maps</p>
                    <p className="text-sm text-muted-foreground">Show all unexplored areas on the map</p>
                  </div>
                </div>
                <Switch
                  checked={settings.mapDiscoveryState === "REVEALED"}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      mapDiscoveryState: checked ? "REVEALED" : "CLOUDED",
                    }))
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backup Management</CardTitle>
          <CardDescription>Create and restore profile backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 gap-2 bg-transparent transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              onClick={handleCreateBackup}
              disabled={backingUp}
            >
              {backingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Create Backup
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 bg-transparent transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              onClick={handleRestoreBackup}
              disabled={restoring}
            >
              {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Restore Latest Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
