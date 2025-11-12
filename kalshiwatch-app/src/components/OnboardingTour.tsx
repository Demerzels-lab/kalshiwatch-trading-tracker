import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Welcome to Kalshiwatch!',
    description: 'Platform for tracking Kalshi traders and receiving real-time alerts. Let\'s explore the main features.',
    image: null,
  },
  {
    title: 'Monitor Your Favorite Traders',
    description: 'Click on trader cards to view their complete profile, including PnL history, trading statistics, and top profitable trades.',
    highlight: 'trader-cards',
  },
  {
    title: 'Watch Traders',
    description: 'Click the "Watch" button on a trader\'s profile to add them to your watchlist. You can access your watchlist from the menu in the header.',
    highlight: 'watch-button',
  },
  {
    title: 'Create Custom Alerts',
    description: 'On the Alerts page, you can create custom notifications based on new trades, profit thresholds, or volume thresholds for each trader.',
    highlight: 'alerts-menu',
  },
  {
    title: 'Connect Telegram',
    description: 'In Settings, connect your Telegram account to receive real-time alerts directly on Telegram. Never miss an important trade again!',
    highlight: 'settings-menu',
  },
  {
    title: 'Ready to Start!',
    description: 'You\'re all set to start tracking Kalshi traders. Explore the platform and find the best traders to follow!',
    image: null,
  },
];

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full mx-4 p-8 relative">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[300px] flex flex-col">
          <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
          <p className="text-lg text-muted-foreground mb-8 flex-1">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
