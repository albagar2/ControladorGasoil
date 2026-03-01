import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-receipt-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="modal-overlay" (click)="close.emit()">
            <div class="modal-content" (click)="$event.stopPropagation()">
                <div class="modal-header">
                    <h3>Visualizar Ticket</h3>
                    <button class="close-btn" (click)="close.emit()">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <img [src]="receiptUrl" alt="Ticket de repostaje" class="receipt-img">
                </div>
                <div class="modal-footer">
                    <a [href]="receiptUrl" target="_blank" class="btn-download">
                        <span class="material-icons">open_in_new</span>
                        Abrir en nueva pestaña
                    </a>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(5px);
            z-index: 11000;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        .modal-content {
            background: var(--card-bg);
            border-radius: 16px;
            width: 90%; max-width: 600px;
            max-height: 90vh;
            display: flex; flex-direction: column;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .modal-header {
            padding: 16px 20px;
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .modal-body {
            flex: 1; overflow-y: auto; padding: 10px;
            display: flex; justify-content: center; background: #000;
        }
        .receipt-img {
            max-width: 100%; height: auto; object-fit: contain;
        }
        .modal-footer {
            padding: 16px 20px; text-align: right;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .close-btn {
            background: none; border: none; color: var(--text-primary); cursor: pointer;
        }
        .btn-download {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 20px; background: var(--primary-color);
            color: white; border-radius: 8px; text-decoration: none;
            font-weight: 500; transition: transform 0.2s;
        }
        .btn-download:hover { transform: translateY(-2px); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `]
})
export class ReceiptModalComponent {
    @Input() receiptUrl: string = '';
    @Output() close = new EventEmitter<void>();
}
