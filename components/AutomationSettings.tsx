import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { CloudRain, Users, Thermometer, CloudDrizzle, ThermometerSun, RefreshCw, Wind } from 'lucide-react';
import type { AutoCancelSettings } from './CourtBookingSystem';

interface AutomationSettingsProps {
  settings: AutoCancelSettings;
  onUpdate: (settings: AutoCancelSettings) => void;
}

export function AutomationSettings({ settings, onUpdate }: AutomationSettingsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
            <CloudRain className="size-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-slate-900">Weather-Based Auto-Cancel</h3>
            <p className="text-slate-600">Automatically cancel bookings based on weather conditions</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Weather Auto-Cancel</Label>
              <p className="text-slate-600">Monitor weather and cancel if conditions are poor</p>
            </div>
            <Switch
              checked={settings.weatherEnabled}
              onCheckedChange={(checked) => 
                onUpdate({ ...settings, weatherEnabled: checked })
              }
            />
          </div>

          {settings.weatherEnabled && (
            <div className="space-y-6 pl-4 border-l-2 border-slate-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="size-4 text-blue-600" />
                    <Label>Minimum Temperature</Label>
                  </div>
                  <Switch
                    checked={settings.minTempEnabled}
                    onCheckedChange={(checked) => 
                      onUpdate({ ...settings, minTempEnabled: checked })
                    }
                  />
                </div>
                {settings.minTempEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-600">Too Cold Below</span>
                      <span className="text-slate-900">{settings.minTemp}°C</span>
                    </div>
                    <Slider
                      value={[settings.minTemp]}
                      onValueChange={([value]) => 
                        onUpdate({ ...settings, minTemp: value })
                      }
                      min={0}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-slate-600 mt-2">
                      Cancel if temperature drops below this value
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="size-4 text-orange-600" />
                    <Label>Maximum Temperature</Label>
                  </div>
                  <Switch
                    checked={settings.maxTempEnabled}
                    onCheckedChange={(checked) => 
                      onUpdate({ ...settings, maxTempEnabled: checked })
                    }
                  />
                </div>
                {settings.maxTempEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-600">Too Hot Above</span>
                      <span className="text-slate-900">{settings.maxTemp}°C</span>
                    </div>
                    <Slider
                      value={[settings.maxTemp]}
                      onValueChange={([value]) => 
                        onUpdate({ ...settings, maxTemp: value })
                      }
                      min={20}
                      max={45}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-slate-600 mt-2">
                      Cancel if temperature rises above this value
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudDrizzle className="size-4 text-blue-600" />
                    <Label>Rain Probability During Booking</Label>
                  </div>
                  <Switch
                    checked={settings.rainProbabilityEnabled}
                    onCheckedChange={(checked) => 
                      onUpdate({ ...settings, rainProbabilityEnabled: checked })
                    }
                  />
                </div>
                {settings.rainProbabilityEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-600">Max Rain Chance</span>
                      <span className="text-slate-900">{settings.rainProbability}%</span>
                    </div>
                    <Slider
                      value={[settings.rainProbability]}
                      onValueChange={([value]) => 
                        onUpdate({ ...settings, rainProbability: value })
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-slate-600 mt-2">
                      Cancel if rain probability exceeds this percentage
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudRain className="size-4 text-blue-600" />
                    <Label>Recent Rain (Before Booking)</Label>
                  </div>
                  <Switch
                    checked={settings.recentRainEnabled}
                    onCheckedChange={(checked) => 
                      onUpdate({ ...settings, recentRainEnabled: checked })
                    }
                  />
                </div>
                {settings.recentRainEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-600">Check Last</span>
                      <span className="text-slate-900">{settings.recentRainHours} {settings.recentRainHours === 1 ? 'hour' : 'hours'}</span>
                    </div>
                    <Slider
                      value={[settings.recentRainHours]}
                      onValueChange={([value]) => 
                        onUpdate({ ...settings, recentRainHours: value })
                      }
                      min={1}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-slate-600 mt-2">
                      Cancel if it rained in the last {settings.recentRainHours} {settings.recentRainHours === 1 ? 'hour' : 'hours'} (courts may be wet/slippery)
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-900">
                        💧 Tip: Even if forecast is clear, courts can be wet from recent rain showers
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="size-4 text-blue-600" />
                    <Label>Maximum Wind Speed</Label>
                  </div>
                  <Switch
                    checked={settings.maxWindEnabled}
                    onCheckedChange={(checked) => 
                      onUpdate({ ...settings, maxWindEnabled: checked })
                    }
                  />
                </div>
                {settings.maxWindEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-600">Too Windy Above</span>
                      <span className="text-slate-900">{settings.maxWind} mph</span>
                    </div>
                    <Slider
                      value={[settings.maxWind]}
                      onValueChange={([value]) => 
                        onUpdate({ ...settings, maxWind: value })
                      }
                      min={5}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-slate-600 mt-2">
                      Cancel if wind speed exceeds this value (strong winds make tennis difficult)
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-900">
                        🌬️ Tip: Wind speeds above 20 mph can significantly affect ball control
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Users className="size-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-slate-900">Availability-Based Auto-Cancel</h3>
            <p className="text-slate-600">Cancel if enough courts are available (you might play for free!)</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Availability Auto-Cancel</Label>
              <p className="text-slate-600">Monitor court availability at your booking time</p>
            </div>
            <Switch
              checked={settings.availabilityEnabled}
              onCheckedChange={(checked) => 
                onUpdate({ ...settings, availabilityEnabled: checked })
              }
            />
          </div>

          {settings.availabilityEnabled && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Minimum Available Courts</Label>
                  <span className="text-slate-900">{settings.minAvailableCourts} courts</span>
                </div>
                <Slider
                  value={[settings.minAvailableCourts]}
                  onValueChange={([value]) => 
                    onUpdate({ ...settings, minAvailableCourts: value })
                  }
                  min={1}
                  max={4}
                  step={1}
                  className="w-full"
                />
                <p className="text-slate-600 mt-2">
                  Cancel booking if this many or more courts are available
                </p>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                  <p className="text-amber-900">
                    💡 Tip: If all 4 courts are free, you might not need to book at all!
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="size-4 text-purple-600" />
                    <Label>Auto-Rebook When Busy</Label>
                  </div>
                  <Switch
                    checked={settings.autoRebookEnabled}
                    onCheckedChange={(checked) => 
                      onUpdate({ ...settings, autoRebookEnabled: checked })
                    }
                  />
                </div>
                {settings.autoRebookEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-600">Re-book When Courts Drop To</span>
                      <span className="text-slate-900">{settings.maxAvailableCourtsForRebook} {settings.maxAvailableCourtsForRebook === 1 ? 'court' : 'courts'}</span>
                    </div>
                    <Slider
                      value={[settings.maxAvailableCourtsForRebook]}
                      onValueChange={([value]) => 
                        onUpdate({ ...settings, maxAvailableCourtsForRebook: value })
                      }
                      min={1}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-slate-600 mt-2">
                      Automatically re-book your cancelled slot if availability drops to this threshold or below
                    </p>
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <p className="text-purple-900">
                        🔄 Example: If cancelled because 4 courts were free, re-book when only 1 court remains
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="text-blue-900 mb-2">How Auto-Cancel Works</h4>
        <ul className="text-blue-800 space-y-2">
          <li>• Enable auto-cancel when creating a booking</li>
          <li>• The system monitors weather and availability in real-time</li>
          <li>• If conditions match your criteria 3 hours and 5 minutes before your booking start time, your booking is automatically cancelled</li>
        </ul>
      </Card>
    </div>
  );
}