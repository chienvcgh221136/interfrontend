import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UTMBuilderProps {
  onUTMChange: (utmParams: string) => void;
}

export function UTMBuilder({ onUTMChange }: UTMBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  const buildUTMString = () => {
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    
    const utmString = params.toString();
    onUTMChange(utmString);
    return utmString;
  };

  const handleChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setTimeout(buildUTMString, 0);
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-border/60 bg-secondary/30 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          UTM Campaign Builder
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">FREE</span>
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="utm_source" className="text-xs">Source</Label>
                <Input
                  id="utm_source"
                  placeholder="e.g., facebook"
                  value={utmSource}
                  onChange={handleChange(setUtmSource)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm_medium" className="text-xs">Medium</Label>
                <Input
                  id="utm_medium"
                  placeholder="e.g., social"
                  value={utmMedium}
                  onChange={handleChange(setUtmMedium)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm_campaign" className="text-xs">Campaign</Label>
                <Input
                  id="utm_campaign"
                  placeholder="e.g., summer_sale"
                  value={utmCampaign}
                  onChange={handleChange(setUtmCampaign)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
