
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Globe, Database } from "lucide-react";

export function SettingsView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
          <p className="text-slate-600">Configure your dashboard preferences and integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-slate-800">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-slate-700">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="review-alerts" className="text-slate-700">New Review Alerts</Label>
              <Switch id="review-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-reports" className="text-slate-700">Weekly Reports</Label>
              <Switch id="weekly-reports" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="performance-alerts" className="text-slate-700">Performance Alerts</Label>
              <Switch id="performance-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-600/10">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-slate-800">API Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google-api" className="text-slate-700">Google Business API Key</Label>
              <Input 
                id="google-api" 
                type="password" 
                placeholder="Enter your API key"
                className="bg-white/50 border-white/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sync-interval" className="text-slate-700">Sync Interval (minutes)</Label>
              <Input 
                id="sync-interval" 
                type="number" 
                defaultValue="30"
                className="bg-white/50 border-white/20 rounded-xl"
              />
            </div>
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl">
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-600/10">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-slate-800">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor" className="text-slate-700">Two-Factor Authentication</Label>
              <Switch id="two-factor" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="session-timeout" className="text-slate-700">Auto Session Timeout</Label>
              <Switch id="session-timeout" defaultChecked />
            </div>
            <Button variant="outline" className="w-full rounded-xl bg-white/50 border-white/20">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-600/10">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-slate-800">General</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-slate-700">Timezone</Label>
              <Input 
                id="timezone" 
                defaultValue="UTC-5 (Eastern)"
                className="bg-white/50 border-white/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-slate-700">Currency</Label>
              <Input 
                id="currency" 
                defaultValue="USD"
                className="bg-white/50 border-white/20 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-slate-700">Dark Mode</Label>
              <Switch id="dark-mode" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
