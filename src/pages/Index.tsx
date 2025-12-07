import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UTMBuilder } from '@/components/UTMBuilder';
import { UrlCard } from '@/components/UrlCard';
import { urlApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Zap, 
  Link2, 
  BarChart3, 
  QrCode, 
  Globe, 
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [utmParams, setUtmParams] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdUrls, setCreatedUrls] = useState<UrlData[]>([]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      let finalUrl = longUrl;
      if (utmParams) {
        const separator = longUrl.includes('?') ? '&' : '?';
        finalUrl = `${longUrl}${separator}${utmParams}`;
      }

      let response;
      if (isAuthenticated) {
        // Logged-in users can use custom codes
        response = customCode
          ? await urlApi.shortenCustom({ originalUrl: finalUrl, customCode })
          : await urlApi.shorten({ originalUrl: finalUrl });
      } else {
        // Unauthenticated users use the public endpoint
        // and cannot use custom codes from the homepage.
        response = await urlApi.shortenPublic({ originalUrl: finalUrl });
      }

      const newUrl: UrlData = {
        _id: Date.now().toString(),
        originalUrl: finalUrl,
        shortCode: response.data.shortCode,
        clicks: 0,
        createdAt: new Date().toISOString(),
      };

      setCreatedUrls((prev) => [newUrl, ...prev]);
      setLongUrl('');
      setCustomCode('');
      toast.success('Link shortened successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setCreatedUrls((prev) => prev.filter((url) => url._id !== id));
    // For unauthenticated users, just remove from local state.
    // If you wanted to delete from DB for logged-in users, you'd call an API here
    // but since these are temporary on the homepage, local removal is fine.
    toast.success('Link removed');
  };

  const features = [
    {
      icon: Link2,
      title: 'Custom Short Links',
      description: 'Create memorable, branded short links that reflect your identity.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track clicks, locations, devices, and more in real-time.',
    },
    {
      icon: QrCode,
      title: 'QR Code Generator',
      description: 'Generate QR codes for any link instantly.',
    },
    {
      icon: Globe,
      title: 'Custom Domains',
      description: 'Use your own domain for ultimate brand consistency.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">LinkShort</span>
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button
                  variant="gradient"
                  onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
                >
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button variant="gradient" asChild>
                    <Link to="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            All features FREE - No credit card required
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Make every{' '}
            <span className="gradient-text">connection</span>
            <br />count
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Create short links, QR codes, and Link-in-bio pages. Share them anywhere. 
            Track what's working and what's not. All for free.
          </p>

          {/* URL Shortener Form */}
          <form onSubmit={handleShorten} className="max-w-2xl mx-auto space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="url"
                placeholder="Paste your long URL here..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="flex-1 h-14 text-base px-5"
              />
              <Button
                type="submit"
                variant="hero"
                size="xl"
                disabled={loading}
                className="sm:w-auto w-full"
              >
                {loading ? 'Shortening...' : 'Shorten'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              Advanced Options
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Advanced Options */}
            {showAdvanced &&
              (isAuthenticated ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground text-left block">
                        Custom back-half (optional)
                      </label>
                      <Input
                        placeholder="my-custom-link"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground text-left block flex items-center gap-2">
                        Custom Domain
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">FREE</span>
                      </label>
                      <Input
                        placeholder="https://your-domain.com"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                      />
                    </div>
                  </div>
                  <UTMBuilder onUTMChange={setUtmParams} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground animate-fade-in">
                  <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link> to use advanced options like custom links.
                </p>
              ))}
          </form>

          {/* Created URLs */}
          {createdUrls.length > 0 && (
            <div className="mt-10 space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold">Your shortened links</h3>
              <div className="space-y-3 max-w-2xl mx-auto">
                {createdUrls.map((url) => (
                  <UrlCard
                    key={url._id}
                    id={url._id}
                    originalUrl={url.originalUrl}
                    shortCode={url.shortCode}
                    clicks={url.clicks}
                    createdAt={url.createdAt}
                    customDomain={customDomain || undefined}
                    onDelete={handleDelete}
                    onEdit={() => toast('Please sign in to edit links.')}
                    onViewAnalytics={(code) => navigate(`/analytics/${code}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need, <span className="gradient-text">completely free</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No hidden fees, no premium tiers. Every feature is available to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-6 border border-border card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who trust LinkShort for their link management needs.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/register">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">LinkShort</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 LinkShort. All features free, forever.
          </p>
        </div>
      </footer>
    </div>
  );
}
