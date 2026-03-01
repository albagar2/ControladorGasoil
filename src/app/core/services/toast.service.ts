import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<Toast[]>([]);
    private counter = 0;

    show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
        const id = this.counter++;
        const toast: Toast = { id, message, type, duration };
        this.toasts.update(t => [...t, toast]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string) { this.show(message, 'success'); }
    error(message: string) { this.show(message, 'error'); }
    warning(message: string) { this.show(message, 'warning'); }
    info(message: string) { this.show(message, 'info'); }

    remove(id: number) {
        this.toasts.update(t => t.filter(x => x.id !== id));
    }
}
