import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="toast-container">
            <div *ngFor="let toast of toastService.toasts()" 
                 class="toast-item" 
                 [class]="toast.type"
                 (click)="toastService.remove(toast.id)">
                <span class="material-icons">{{ getIcon(toast.type) }}</span>
                <span class="message">{{ toast.message }}</span>
                <button class="close-btn">&times;</button>
            </div>
        </div>
    `,
    styles: [`
        .toast-container {
            position: fixed;
            top: 1.5rem;
            right: 1.5rem;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            pointer-events: none;
        }
        .toast-item {
            pointer-events: auto;
            min-width: 300px;
            max-width: 450px;
            padding: 1rem 1.25rem;
            border-radius: 12px;
            background: white;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            animation: slideIn 0.3s ease-out forwards;
            border-left: 6px solid #cbd5e1;
        }
        .toast-item.success { border-left-color: #10b981; }
        .toast-item.error { border-left-color: #ef4444; }
        .toast-item.warning { border-left-color: #f59e0b; }
        .toast-item.info { border-left-color: #3b82f6; }

        .message { font-weight: 500; font-size: 0.95rem; color: #1f2937; flex: 1; }
        .material-icons { font-size: 1.25rem; }
        .success .material-icons { color: #10b981; }
        .error .material-icons { color: #ef4444; }
        .warning .material-icons { color: #f59e0b; }
        .info .material-icons { color: #3b82f6; }

        .close-btn { background: none; border: none; font-size: 1.25rem; color: #9ca3af; cursor: pointer; padding: 0 0 0 0.5rem; }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        :host-context(.dark) .toast-item {
            background: #1e293b;
        }
        :host-context(.dark) .message {
            color: #f8fafc;
        }
    `]
})
export class ToastComponent {
    public toastService = inject(ToastService);

    getIcon(type: string) {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    }
}
