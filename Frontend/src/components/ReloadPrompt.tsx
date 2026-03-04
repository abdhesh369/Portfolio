import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X, RefreshCw } from 'lucide-react';

export function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full animate-in slide-in-from-bottom-5">
            <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-lg p-4 text-slate-200 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {offlineReady ? (
                            <span className="text-sm font-medium">App ready to work offline</span>
                        ) : (
                            <span className="text-sm font-medium">
                                New content available, click on reload button to update.
                            </span>
                        )}
                    </div>
                    <button
                        title="Close"
                        onClick={close}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {needRefresh && (
                    <button
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-md transition-colors text-sm"
                        onClick={() => updateServiceWorker(true)}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reload App
                    </button>
                )}
            </div>
        </div>
    );
}
