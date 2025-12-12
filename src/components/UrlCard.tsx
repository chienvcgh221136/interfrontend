import { useState } from 'react';
import { Copy, Trash2, QrCode, BarChart3, Check, ExternalLink, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeModal } from './QRCodeModal';
import toast from 'react-hot-toast';
import { cn, formatDate, truncateUrl } from '@/lib/utils';

interface UrlCardProps {
  id: string; // This is the _id from the database
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  customDomain?: string;
  onDelete: (id: string) => void;
  onEdit: (url: {
    _id: string;
    originalUrl: string;
    shortCode: string;
  }) => void;
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
  onEdit,
  onViewAnalytics,
}: UrlCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const baseUrl = customDomain || import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  let shortUrl = `${baseUrl}/${shortCode}`;

  try {
    // Đảm bảo URL hợp lệ để parse
    const urlToParse = originalUrl.startsWith('http') ? originalUrl : `http://${originalUrl}`;
    const urlObj = new URL(urlToParse);
    const params = new URLSearchParams(urlObj.search);
    const utmValues: string[] = [];
    
    // Chỉ lấy GIÁ TRỊ của các tham số UTM, bỏ qua tên tham số (utm_source...)
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = params.get(key);
      if (value) utmValues.push(value);
    });

    if (utmValues.length > 0) {
      // Nối các giá trị lại với nhau, ví dụ: ?facebook&social&summer
      shortUrl += `?${utmValues.join('&')}`;
    }
  } catch (e) {
    // Bỏ qua nếu lỗi parse URL
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
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
                onClick={() => onEdit({ _id: id, originalUrl, shortCode })}
                className="h-8 px-3"
              >
                <Edit className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">Edit</span>
              </Button>
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
