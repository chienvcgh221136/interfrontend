import { useState } from 'react';
import { Copy, Trash2, QrCode, BarChart3, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeModal } from './QRCodeModal';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface UrlCardProps {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  customDomain?: string;
  onDelete: (id: string) => void;
  onViewAnalytics?: (shortCode: string) => void;
}

export function UrlCard({
  id,
  originalUrl,
  shortCode,
  clicks,
  createdAt,
  customDomain,
  onDelete,
  onViewAnalytics,
}: UrlCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const baseUrl = customDomain || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const shortUrl = `${baseUrl}/${shortCode}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  return (
    <>
      <div className="group relative bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
        <div className="flex flex-col gap-4">
          {/* Short URL */}
          <div className="flex items-center justify-between">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-primary hover:underline flex items-center gap-2"
            >
              {shortUrl.replace('http://', '').replace('https://', '')}
              <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {clicks} click{clicks !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Original URL */}
          <p className="text-sm text-muted-foreground truncate">
            {truncateUrl(originalUrl, 60)}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {formatDate(createdAt)}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className={cn(
                  "h-8 px-3",
                  copied && "text-green-600"
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1.5 hidden sm:inline">
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQR(true)}
                className="h-8 px-3"
              >
                <QrCode className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">QR</span>
              </Button>
              {onViewAnalytics && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewAnalytics(shortCode)}
                  className="h-8 px-3"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="ml-1.5 hidden sm:inline">Stats</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <QRCodeModal
        open={showQR}
        onClose={() => setShowQR(false)}
        url={shortUrl}
        shortCode={shortCode}
      />
    </>
  );
}
