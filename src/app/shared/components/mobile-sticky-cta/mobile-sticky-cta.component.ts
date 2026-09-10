import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mobile-sticky-cta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mobile-sticky-bar">
      <div class="bar-content">
        <div class="bar-info">
          <span class="pulse-dot"></span>
          <span>Ahorra en Combustible</span>
        </div>
        <div class="bar-actions">
          <a routerLink="/register" class="btn-cta">
            Empieza Gratis 🚀
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-sticky-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.75rem 1.25rem;
      box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.5);

      @media (max-width: 768px) {
        display: block;
      }
    }

    .bar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 500px;
      margin: 0 auto;
    }

    .bar-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }

    .btn-cta {
      padding: 0.6rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5, #3b82f6);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
      display: inline-block;

      &:active {
        transform: scale(0.97);
      }
    }
  `]
})
export class MobileStickyCtaComponent {}
