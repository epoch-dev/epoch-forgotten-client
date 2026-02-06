// Toast Types and Event Bus
export type ToastType = 'info' | 'success' | 'error' | 'quest' | 'item';

export type ToastData = {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
};

type ToastListener = (toast: ToastData) => void;
type DismissListener = (id: string) => void;

class ToastEventBus {
    private listeners: ToastListener[] = [];
    private dismissListeners: DismissListener[] = [];

    subscribe(listener: ToastListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    subscribeDismiss(listener: DismissListener) {
        this.dismissListeners.push(listener);
        return () => {
            this.dismissListeners = this.dismissListeners.filter((l) => l !== listener);
        };
    }

    emit(toast: ToastData) {
        this.listeners.forEach((listener) => listener(toast));
    }

    dismiss(id: string) {
        this.dismissListeners.forEach((listener) => listener(id));
    }
}

export const toastBus = new ToastEventBus();

let toastCounter = 0;

// Public API
export const showToast = (options: Omit<ToastData, 'id'>) => {
    const toast: ToastData = {
        ...options,
        id: `toast-${++toastCounter}`,
        duration: options.duration ?? 4000,
    };
    toastBus.emit(toast);
    return toast.id;
};

export const dismissToast = (id: string) => {
    toastBus.dismiss(id);
};
