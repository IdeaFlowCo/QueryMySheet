import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ApiKeySectionProps } from "../types";

export default function ApiKeySection({
  apiKey,
  model,
  temperature,
  onApiKeyChange,
  onModelChange,
  onTemperatureChange
}: ApiKeySectionProps) {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">OpenAI API Settings</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="api-model" className="block text-sm font-medium mb-1">
              Model
            </Label>
            <Select value={model} onValueChange={onModelChange}>
              <SelectTrigger id="api-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="temperature" className="block text-sm font-medium mb-1">
              Temperature (0-1)
            </Label>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[temperature]}
              onValueChange={(value) => onTemperatureChange(value[0])}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Precise</span>
              <span>{temperature.toFixed(1)}</span>
              <span>Creative</span>
            </div>
          </div>
          <div className="flex-1">
            <Label htmlFor="api-key" className="block text-sm font-medium mb-1">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="font-mono"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
