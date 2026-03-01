import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="modal-overlay" *ngIf="show">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="close.emit()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <ng-content select="[modal-body]"></ng-content>
        </div>
        <div class="modal-footer">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
    @Input() show: boolean = false;
    @Input() title: string = '';
    @Output() close = new EventEmitter<void>();
}
