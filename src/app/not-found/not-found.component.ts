import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-card glass-card">
        <div class="error-badge">Error 404</div>
        <div class="illustration">
          <span class="car-icon">🚗💨</span>
          <span class="sign-icon">🚧</span>
        </div>
        <h1>Página no encontrada</h1>
        <p class="subtitle">
          Parece que te has desviado de la ruta. La dirección que buscas no existe o ha sido movida.
        </p>

        <div class="quick-links">
          <h3>Enlaces de interés rápido:</h3>
          <div class="link-grid">
            <a routerLink="/" class="link-pill">
              <span class="icon">🏠</span> Inicio
            </a>
            <a routerLink="/login" class="link-pill">
              <span class="icon">🔐</span> Iniciar Sesión
            </a>
            <a routerLink="/casos-de-exito" class="link-pill">
              <span class="icon">🏆</span> Casos de Éxito
            </a>
            <a routerLink="/privacidad" class="link-pill">
              <span class="icon">🛡️</span> Privacidad
            </a>
          </div>
        </div>

        <div class="actions">
          <a routerLink="/" class="btn-primary">
            Volver al Inicio
          </a>
          <a routerLink="/dashboard" class="btn-secondary">
            Ir a Mi Panel
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: radial-gradient(circle at top right, rgba(79, 70, 229, 0.15), transparent 50%),
                  radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.1), transparent 50%),
                  #0f172a;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      max-width: 580px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .error-badge {
      display: inline-block;
      padding: 0.35rem 1rem;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 1.5rem;
    }

    .illustration {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: center;
      gap: 1rem;

      .car-icon {
        animation: drive 2.5s ease-in-out infinite alternate;
      }
    }

    @keyframes drive {
      0% { transform: translateX(-15px) rotate(-2deg); }
      100% { transform: translateX(15px) rotate(2deg); }
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.75rem;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .quick-links {
      margin-bottom: 2.5rem;
      text-align: left;

      h3 {
        font-size: 0.95rem;
        color: #cbd5e1;
        margin-bottom: 1rem;
        font-weight: 600;
      }
    }

    .link-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .link-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(51, 65, 85, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      color: #e2e8f0;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(79, 70, 229, 0.3);
        border-color: rgba(99, 102, 241, 0.5);
        color: #ffffff;
        transform: translateY(-2px);
      }
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;

      @media (max-width: 480px) {
        flex-direction: column;
      }
    }

    .btn-primary, .btn-secondary {
      padding: 0.85rem 1.75rem;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      font-size: 1rem;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5, #3b82f6);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);

      &:hover {
        opacity: 0.95;
        transform: translateY(-2px);
      }
    }

    .btn-secondary {
      background: rgba(51, 65, 85, 0.8);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(71, 85, 105, 1);
        color: #ffffff;
      }
    }
  `]
})
export class NotFoundComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setSeo({
      title: 'Página No Encontrada (404)',
      description: 'La página solicitada no existe o ha sido movida en Garaje Familiar.',
      url: '/404'
    });
  }
}
