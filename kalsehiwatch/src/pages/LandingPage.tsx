import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

// Mock data untuk 7 trader recommendations
const recommendedTraders = [
  { 
    id: 'trader1', 
    name: 'scottilicious', 
    performance: 'Loading...',
    status: 'loading' as const
  },
  { 
    id: 'trader2', 
    name: 'YatSen', 
    performance: '+$2.2M Total PnL',
    status: 'active' as const,
    trend: 'up' as const
  },
  { 
    id: 'trader3', 
    name: 'GreekGamblerPM', 
    performance: 'Loading...',
    status: 'loading' as const
  },
  { 
    id: 'trader4', 
    name: 'Dropper', 
    performance: '+$604.1K Total PnL',
    status: 'active' as const,
    trend: 'up' as const
  },
  { 
    id: 'trader5', 
    name: 'Euan', 
    performance: 'Loading...',
    status: 'loading' as const
  },
  { 
    id: 'trader6', 
    name: '25usdc', 
    performance: 'Loading...',
    status: 'loading' as const
  },
  { 
    id: 'trader7', 
    name: 'Car', 
    performance: 'Loading...',
    status: 'loading' as const
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Logo */}
      <header className="p-6 md:p-8">
        <Link to="/" className="inline-block">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            KalsehiWatch
          </h1>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8">
            KalsehiWatch
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12">
            Track Kalsehi traders and get instant alerts
          </p>
          <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Get started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Recommended Traders Section */}
        <div className="w-full max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Recommended traders
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedTraders.map((trader) => (
              <TraderCard key={trader.id} trader={trader} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 md:p-8 text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <a 
            href="https://x.com/kalsehiwatch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            X (Twitter)
          </a>
          <span>•</span>
          <a 
            href="https://t.me/kalsehiwatch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Telegram
          </a>
        </div>
      </footer>
    </div>
  );
}

interface TraderCardProps {
  trader: {
    id: string;
    name: string;
    performance: string;
    status: 'loading' | 'active';
    trend?: 'up' | 'down';
  };
}

function TraderCard({ trader }: TraderCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 border border-muted/20 hover:border-primary/50 transition-colors">
      <Link to={`/profile/${trader.id}`} className="block mb-4">
        <h4 className="text-xl font-semibold mb-3 hover:text-primary transition-colors">
          {trader.name}
        </h4>
      </Link>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {trader.status === 'loading' ? (
            <span className="text-muted-foreground animate-pulse">
              {trader.performance}
            </span>
          ) : (
            <>
              {trader.trend === 'up' && (
                <TrendingUp className="w-4 h-4 text-primary" />
              )}
              {trader.trend === 'down' && (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-foreground font-medium">
                {trader.performance}
              </span>
            </>
          )}
        </div>
        
        <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-semibold transition-colors">
          Watch
        </button>
      </div>
    </div>
  );
}
