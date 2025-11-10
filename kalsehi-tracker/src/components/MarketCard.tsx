import { Market } from '../types';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onAddToWatchlist?: (ticker: string) => void;
  onViewDetails?: (ticker: string) => void;
}

export function MarketCard({ market, onAddToWatchlist, onViewDetails }: MarketCardProps) {
  const yesBid = market.yes_bid || 0;
  const yesAsk = market.yes_ask || 0;
  const midPrice = (yesBid + yesAsk) / 2;
  const priceChange = market.previous_yes_bid ? ((yesBid - market.previous_yes_bid) / market.previous_yes_bid) * 100 : 0;
  const isPositive = priceChange >= 0;

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <div 
      className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-all hover:border-gray-700 hover:shadow-lg cursor-pointer"
      onClick={() => onViewDetails?.(market.ticker)}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white line-clamp-2">
          {market.title}
        </h3>
        <p className="mt-1 text-xs text-gray-400">{market.ticker}</p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-white">
            {formatPrice(midPrice)}
          </div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
            {Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400">Volume</div>
          <div className="text-sm font-medium text-white">{formatVolume(market.volume)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 pt-3">
        <div className="flex items-center text-xs text-gray-400">
          <Clock className="mr-1 h-3 w-3" />
          Closes {new Date(market.close_time).toLocaleDateString('id-ID')}
        </div>

        <div className={`rounded-full px-2 py-1 text-xs font-medium ${
          market.status === 'active' ? 'bg-green-900 text-green-300' :
          market.status === 'closed' ? 'bg-gray-800 text-gray-400' :
          'bg-blue-900 text-blue-300'
        }`}>
          {market.status}
        </div>
      </div>
    </div>
  );
}
