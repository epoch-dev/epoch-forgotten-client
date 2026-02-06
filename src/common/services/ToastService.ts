import { showToast } from '../ui/toast';

type ToastOptions = {
    message: string;
    duration?: number;
};

/**
 * ToastService - Adapter for the new GameToast system
 * Maintains backward compatibility with existing code
 */
export class ToastService {
    private static readonly DEFAULT_DURATION = 3000;

    public static success(options: ToastOptions) {
        showToast({
            type: 'success',
            title: 'Success',
            message: options.message,
            duration: options.duration ?? this.DEFAULT_DURATION,
        });
    }

    public static error(options: ToastOptions) {
        showToast({
            type: 'error',
            title: 'Error',
            message: options.message,
            duration: options.duration ?? this.DEFAULT_DURATION,
        });
    }

    public static info(options: ToastOptions) {
        showToast({
            type: 'info',
            title: 'Info',
            message: options.message,
            duration: options.duration ?? this.DEFAULT_DURATION,
        });
    }

    public static quest(title: string, message?: string) {
        showToast({
            type: 'quest',
            title,
            message,
            duration: 5000,
        });
    }

    public static item(title: string, message?: string) {
        showToast({
            type: 'item',
            title,
            message,
            duration: 4000,
        });
    }

    /** @deprecated Use info() instead */
    public static yellow() {
        showToast({
            type: 'info',
            title: 'Notice',
            duration: 10000,
        });
    }
}
