import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Selamat Datang di Kalshiwatch!',
    description: 'Platform untuk tracking trader Kalshi dan menerima alert real-time. Mari kita lihat fitur-fitur utama.',
    image: null,
  },
  {
    title: 'Pantau Trader Favorit',
    description: 'Klik pada kartu trader untuk melihat profile lengkap mereka, termasuk PnL history, statistik trading, dan top profitable trades.',
    highlight: 'trader-cards',
  },
  {
    title: 'Watch Trader',
    description: 'Klik tombol "Watch" di profile trader untuk menambahkan mereka ke watchlist Anda. Anda bisa mengakses watchlist dari menu di header.',
    highlight: 'watch-button',
  },
  {
    title: 'Buat Custom Alerts',
    description: 'Di halaman Alerts, Anda bisa membuat notifikasi custom berdasarkan trade baru, profit threshold, atau volume threshold untuk setiap trader.',
    highlight: 'alerts-menu',
  },
  {
    title: 'Hubungkan Telegram',
    description: 'Di Settings, hubungkan akun Telegram Anda untuk menerima alert real-time langsung di Telegram. Tidak akan melewatkan trade penting lagi!',
    highlight: 'settings-menu',
  },
  {
    title: 'Siap Mulai!',
    description: 'Anda sudah siap untuk memulai tracking trader Kalshi. Jelajahi platform dan temukan trader terbaik untuk diikuti!',
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
              Lewati
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Kembali
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Mulai' : 'Lanjut'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
