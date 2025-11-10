// @ts-nocheck
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, ExternalLink, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

// Mock data untuk trader profile
const mockTraderData: Record<string, any> = {
  trader2: {
    name: 'YatSen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YatSen',
    stats: {
      currentHoldings: '$70.9K',
      biggestWin: '$1.9M',
      totalTrades: 530,
      joinDate: 'Jun 2024',
      totalPnL: '+$2.2M',
      pastMonthPnL: '+$208.6K'
    },
    pnlData: [
      { date: 'Jun', value: 0 },
      { date: 'Jul', value: 500000 },
      { date: 'Aug', value: 800000 },
      { date: 'Sep', value: 1200000 },
      { date: 'Oct', value: 1800000 },
      { date: 'Nov', value: 2200000 },
    ],
    topTrades: [
      { event: 'Kamala Harris US President 2024', outcome: 'No', profit: '+$380K' },
      { event: 'Trump US President 2024', outcome: 'Yes', profit: '+$320K' },
      { event: 'Fed interest rates 50+ bps', outcome: 'Yes', profit: '+$280K' },
      { event: 'Bitcoin above $80K', outcome: 'Yes', profit: '+$240K' },
      { event: 'Ethereum above $4K', outcome: 'Yes', profit: '+$200K' },
      { event: 'S&P 500 new high', outcome: 'Yes', profit: '+$180K' },
      { event: 'US GDP growth Q3', outcome: 'Yes', profit: '+$160K' },
      { event: 'China GDP target', outcome: 'No', profit: '+$140K' },
      { event: 'Oil price direction', outcome: 'Down', profit: '+$120K' },
      { event: 'Gold price target', outcome: 'Yes', profit: '+$100K' },
    ]
  },
  trader4: {
    name: 'Dropper',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dropper',
    stats: {
      currentHoldings: '$170.8K',
      biggestWin: '$2.2M',
      totalTrades: 1330,
      joinDate: 'Jul 2024',
      totalPnL: '+$604.1K',
      pastMonthPnL: '+$51.4K'
    },
    pnlData: [
      { date: 'Jul', value: 0 },
      { date: 'Aug', value: 150000 },
      { date: 'Sep', value: 300000 },
      { date: 'Oct', value: 450000 },
      { date: 'Nov', value: 604100 },
    ],
    topTrades: [
      { event: 'Kim Moon-soo PPP candidate', outcome: 'Yes', profit: '+$220K' },
      { event: 'Fort Knox gold reserves', outcome: 'No', profit: '+$180K' },
      { event: 'Lee Jae-myung president', outcome: 'No', profit: '+$160K' },
      { event: 'MrBeast clean water', outcome: 'Yes', profit: '+$140K' },
      { event: 'South Korea election winner', outcome: 'Yes', profit: '+$120K' },
      { event: 'Nicușor Dan election', outcome: 'Yes', profit: '+$100K' },
      { event: 'Lord Miles water fast', outcome: 'No', profit: '+$90K' },
      { event: 'Kim Moon-soo elected', outcome: 'Yes', profit: '+$80K' },
      { event: 'Zelenskyy suit appearance', outcome: 'Yes', profit: '+$70K' },
      { event: 'Hyperliquid fees milestone', outcome: 'Yes', profit: '+$60K' },
    ]
  }
};

export default function ProfilePage() {
  const { traderId } = useParams<{ traderId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const traderData = traderId ? mockTraderData[traderId] : null;

  if (!traderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Trader Not Found</h2>
          <Link to="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 md:p-8 border-b border-muted/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-primary">
            KalsehiWatch
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Profile Card */}
        <div className="bg-card rounded-lg p-6 md:p-8 mb-8 border border-muted/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img 
              src={traderData.avatar} 
              alt={traderData.name}
              className="w-20 h-20 rounded-full bg-muted"
            />
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {traderData.name}
              </h1>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md font-semibold transition-colors">
                Watch
              </button>
              <a 
                href={`https://kalshi.com/profile/${traderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-muted hover:border-foreground rounded-md font-semibold transition-colors flex items-center gap-2"
              >
                View on Kalsehi
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trader by address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-muted/20 rounded-lg pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Statistics Block */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard label="Current Holdings" value={traderData.stats.currentHoldings} />
          <StatCard label="Biggest Win" value={traderData.stats.biggestWin} />
          <StatCard label="Total Trades" value={traderData.stats.totalTrades} />
          <StatCard label="Join Date" value={traderData.stats.joinDate} />
          <StatCard label="Total PnL (All History)" value={traderData.stats.totalPnL} highlight />
          <StatCard label="PnL (Past Month)" value={traderData.stats.pastMonthPnL} highlight />
        </div>

        {/* PnL Graph */}
        <div className="bg-card rounded-lg p-6 md:p-8 mb-8 border border-muted/20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            PnL History
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={traderData.pnlData}>
              <XAxis 
                dataKey="date" 
                stroke="#A3A3A3"
                style={{ fontSize: '14px' } as any}
              />
              <YAxis 
                stroke="#A3A3A3"
                style={{ fontSize: '14px' } as any}
                tickFormatter={(value: any) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F1F1F', 
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                } as any}
                formatter={(value: any) => [`$${(value / 1000).toFixed(1)}K`, 'PnL']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Trades */}
        <div className="bg-card rounded-lg p-6 md:p-8 border border-muted/20">
          <h2 className="text-2xl font-bold mb-6">
            Top 10 Profitable Trades
          </h2>
          <div className="space-y-4">
            {traderData.topTrades.map((trade: any, index: number) => (
              <div 
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background rounded-lg border border-muted/20 hover:border-primary/50 transition-colors gap-3"
              >
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{trade.event}</h3>
                  <p className="text-sm text-muted-foreground">
                    Outcome: <span className="text-foreground">{trade.outcome}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold text-lg">
                    {trade.profit}
                  </span>
                  <a 
                    href="#"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    View Event
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 md:p-8 text-center border-t border-muted/20 mt-12">
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

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div className={`bg-background rounded-lg p-4 md:p-6 border ${
      highlight ? 'border-primary/50' : 'border-muted/20'
    }`}>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className={`text-xl md:text-2xl font-bold ${
        highlight ? 'text-primary' : 'text-foreground'
      }`}>
        {value}
      </p>
    </div>
  );
}
