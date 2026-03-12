import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X, RefreshCw, Zap } from 'lucide-react';

export function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        // Called when a new SW is waiting — fire needRefresh manually
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            if (!r) return;
            // Poll every 60s to check if a new SW is waiting
            setInterval(() => {
                r.update();
            }, 60 * 1000);
        },
        onRegisterError(_error: Error) {},
    });

    // When the new SW takes control (after updateServiceWorker(true)),
    // force the page to reload so users get the fresh HTML/JS immediately.
    useEffect(() => {
        const handler = () => {
            window.location.reload();
        };
        navigator.serviceWorker?.addEventListener('controllerchange', handler);
        return () => {
            navigator.serviceWorker?.removeEventListener('controllerchange', handler);
        };
    }, []);

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-card/80 border border-border shadow-[0_0_30px_rgba(6,182,212,0.1)] rounded-2xl p-4 text-foreground flex flex-col gap-3 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground leading-snug">
                                {offlineReady ? 'Ready to work offline' : 'New version available'}
                            </p>
                            {needRefresh && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Reload to get the latest updates
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={close}
                        aria-label="Dismiss"
                        className="text-muted-foreground/50 hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {needRefresh && (
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reload & Update
                    </button>
                )}
            </div>
        </div>
    );
}
