import { toast } from 'react-toastify';

type ToastOptions = {
    message: string;
    duration?: number;
};

export class ToastService {
    private static readonly DEFAULT_DURATION = 3000;
    private static readonly DEFAULT_POSITION = 'bottom-center';

    public static success(options: ToastOptions) {
        toast.success(options.message, {
            autoClose: options.duration || this.DEFAULT_DURATION,
            position: this.DEFAULT_POSITION,
            bodyClassName: 'toastWrapper toastSuccess',
        });
    }

    public static error(options: ToastOptions) {
        toast.error(options.message, {
            autoClose: options.duration || this.DEFAULT_DURATION,
            position: this.DEFAULT_POSITION,
            className: 'toastWrapper toastError',
        });
    }

    public static yellow() {
        toast.warn('GET', {
            autoClose: 10_000,
            position: 'top-center',
            className: 'toastYellow',
        });
    }
}
