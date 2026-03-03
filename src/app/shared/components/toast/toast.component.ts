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
                <div class="icon-container">
                    <svg *ngIf="toast.type === 'success'" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <svg *ngIf="toast.type === 'error'" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <svg *ngIf="toast.type === 'warning'" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                    <svg *ngIf="toast.type === 'info'" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <span class="message">{{ formatMessage(toast.message) }}</span>
                <button class="close-btn">
                    <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                </button>
            </div>
        </div>
    `,
    styles: [`
        .toast-container {
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            pointer-events: none;
        }
        .toast-item {
            pointer-events: auto;
            min-width: 320px;
            max-width: 480px;
            padding: 0.85rem 1rem;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            border: 1px solid rgba(255, 255, 255, 0.3);
            position: relative;
            overflow: hidden;
        }
        .toast-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5px;
        }
        .toast-item.success::before { background: #10b981; }
        .toast-item.error::before { background: #ef4444; }
        .toast-item.warning::before { background: #f59e0b; }
        .toast-item.info::before { background: #3b82f6; }

        .icon-container {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
        }
        .icon-container svg { width: 22px; height: 22px; fill: currentColor; }
        
        .success .icon-container { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .error .icon-container { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .warning .icon-container { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        .info .icon-container { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }

        .message { font-weight: 500; font-size: 0.9rem; color: #1f2937; flex: 1; line-height: 1.4; }

        .close-btn { 
            background: none; 
            border: none; 
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af; 
            cursor: pointer; 
            padding: 0;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .close-btn:hover { background: rgba(0,0,0,0.05); color: #4b5563; }
        .close-btn svg { width: 16px; height: 16px; fill: currentColor; }

        @keyframes slideIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        :host-context(.dark) .toast-item {
            background: rgba(31, 41, 55, 0.9);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        :host-context(.dark) .message { color: #f9fafb; }
        :host-context(.dark) .close-btn:hover { background: rgba(255,255,255,0.1); }
    `]
})
export class ToastComponent {
    public toastService = inject(ToastService);

    formatMessage(message: string): string {
        // Mejorar estética de mensajes técnicos
        if (message.includes('192.168.') && message.includes('4200')) {
            return 'Enlace de red generado: Ya puedes conectar tu móvil.';
        }
        if (message.includes('Http failure response for')) {
            return 'Error de conexión: Verifica que el servidor está encendido.';
        }
        return message;
    }
}
