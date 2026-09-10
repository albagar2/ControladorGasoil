import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <li *ngFor="let item of items; let last = last" class="breadcrumb-item" [class.active]="last">
          <ng-container *ngIf="!last && item.url">
            <a [routerLink]="item.url" class="breadcrumb-link">
              <span *ngIf="item.icon" class="icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
            <span class="separator">/</span>
          </ng-container>
          <ng-container *ngIf="last">
            <span class="current-page">
              <span *ngIf="item.icon" class="icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </span>
          </ng-container>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      margin-bottom: 1.5rem;
    }

    .breadcrumb-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.88rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
    }

    .breadcrumb-link {
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;

      &:hover {
        color: #38bdf8;
      }
    }

    .separator {
      margin: 0 0.5rem;
      color: #475569;
    }

    .current-page {
      color: #f1f5f9;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .icon {
      font-size: 0.95rem;
    }
  `]
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
