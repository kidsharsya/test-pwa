'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react'; // gunakan lucide-react untuk icon close (jika sudah terinstal)

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const hasHidden = localStorage.getItem('installPromptHidden');
    if (hasHidden) {
      setHidden(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ User accepted installation');
    } else {
      console.log('❌ User dismissed installation');
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  const handleClose = () => {
    setHidden(true);
    localStorage.setItem('installPromptHidden', 'true');
  };

  if (!canInstall || hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
      <span>Install aplikasi Jejak Karbon</span>
      <button onClick={handleInstallClick} className="bg-white text-green-700 px-3 py-1 rounded-md font-semibold hover:bg-green-100 transition">
        Install
      </button>
      <button onClick={handleClose} className="text-white hover:text-gray-200 transition" aria-label="Tutup">
        <X size={20} />
      </button>
    </div>
  );
}
