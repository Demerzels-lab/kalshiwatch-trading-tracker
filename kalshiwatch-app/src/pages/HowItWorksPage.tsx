import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Bell, Users, Zap } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <header className="p-6 md:p-8 border-b border-muted/20">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How Kalshiwatch Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track top Kalshi prediction market traders and get instant notifications on their activities
          </p>
        </div>

        <div className="space-y-16">
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary">STEP 1</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Discover Top Traders
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Browse our curated list of high-performing traders on Kalshi prediction markets. 
                We track and rank traders based on their total PnL, monthly performance, win rates, 
                and trading activity.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Real-time performance metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Detailed trade history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Performance badges (Hottest, Consistent, Stable)</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 bg-card border border-muted/20 rounded-lg p-8">
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 border border-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">CryptoKing Pro</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                      Hottest
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total PnL</span>
                    <span className="text-primary font-bold">$2.97M</span>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">MarketOracle</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Consistent
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total PnL</span>
                    <span className="text-primary font-bold">$2.24M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-card border border-muted/20 rounded-lg p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-primary/50">
                  <div>
                    <div className="font-semibold mb-1">TrendCatcher</div>
                    <div className="text-sm text-muted-foreground">7 trades</div>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
                    Watching
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-muted/20">
                  <div>
                    <div className="font-semibold mb-1">VelocityTrader</div>
                    <div className="text-sm text-muted-foreground">5 trades</div>
                  </div>
                  <button className="px-4 py-2 border border-muted/20 rounded-md text-sm font-semibold">
                    Watch
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary">STEP 2</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Add Traders to Your Watchlist
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Click the "Watch" button on any trader's profile to add them to your personal watchlist. 
                Monitor multiple traders simultaneously and track their performance over time.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Unlimited watchlist capacity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Easy add/remove functionality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Centralized dashboard view</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary">STEP 3</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Connect Your Telegram
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Link your Telegram account via our bot (@kalshiwatch_bot) to receive instant notifications 
                when traders in your watchlist make new trades or achieve significant milestones.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Real-time trade alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Performance milestone notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Customizable alert settings</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 bg-card border border-muted/20 rounded-lg p-8">
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 border border-primary/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <span className="font-semibold">New Trade Alert</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    CryptoKing Pro just opened a position on "2024 Election Outcome"
                  </p>
                  <div className="text-xs text-primary">2 minutes ago</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-muted/20 opacity-70">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Milestone Reached</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    TrendCatcher reached $50K monthly PnL
                  </p>
                  <div className="text-xs text-muted-foreground">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-card border border-muted/20 rounded-lg p-8">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6 text-center">
                <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Stay Ahead</h3>
                <p className="text-muted-foreground">
                  Never miss an opportunity. Get insights into what successful traders are doing in real-time.
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary">STEP 4</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Make Informed Decisions
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Use insights from top traders to inform your own trading strategies. Learn from their 
                successes and failures, and stay updated on market trends.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Pattern recognition from successful trades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Market sentiment indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Historical performance data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-card border border-muted/20 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Tracking?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Kalshiwatch today and gain access to powerful trader tracking tools and instant notifications.
          </p>
          <Link 
            to="/auth"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      <footer className="p-6 md:p-8 text-center border-t border-muted/20">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <a 
            href="https://x.com/kalshiwatch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            X (Twitter)
          </a>
          <span>•</span>
          <a 
            href="https://t.me/kalshiwatch_bot" 
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
