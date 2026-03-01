import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-table-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="table-card fade-in">
      <div class="table-header">
        <h2>{{ title }}</h2>
        <div style="display: flex; gap: 1rem;">
          <ng-content select="[card-actions]"></ng-content>
        </div>
      </div>
      <div class="table-responsive">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class TableCardComponent {
    @Input() title: string = '';
}
