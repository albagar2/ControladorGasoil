import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="thank-you-container">
      <div class="thank-you-card glass-card">
        <div class="success-icon">
          ✨
        </div>
        <div class="badge">¡Operación Completada!</div>
        <h1>¡Gracias por confiar en Garaje Familiar!</h1>
        <p class="description">
          Hemos recibido tu solicitud correctamente. Tu cuenta y vehículos están listos para comenzar a gestionar todos tus gastos de combustible y mantenimientos con total tranquilidad.
        </p>

        <div class="steps-box">
          <h3>🚀 Próximos Pasos Recomendados:</h3>
          <ul>
            <li>
              <span class="step-num">1</span>
              <span><strong>Registra tu primer vehículo</strong> en el panel de control.</span>
            </li>
            <li>
              <span class="step-num">2</span>
              <span><strong>Añade un repostaje</strong> para comenzar a generar estadísticas de consumo.</span>
            </li>
            <li>
              <span class="step-num">3</span>
              <span><strong>Invita a los miembros de tu familia</strong> para compartir la gestión del garaje.</span>
            </li>
          </ul>
        </div>

        <div class="sla-banner">
          <span class="sla-icon">⚡</span>
          <div>
            <strong>Compromiso de Respuesta:</strong>
            <p>Nuestro equipo de soporte familiar responderá cualquier duda en menos de 2 horas.</p>
          </div>
        </div>

        <div class="actions">
          <a routerLink="/dashboard" class="btn-primary">
            Ir al Panel Principal
          </a>
          <a routerLink="/casos-de-exito" class="btn-secondary">
            Ver Casos de Éxito
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .thank-you-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.5rem;
      background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.15), transparent 50%),
                  radial-gradient(circle at bottom right, rgba(79, 70, 229, 0.15), transparent 50%),
                  #0f172a;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      max-width: 620px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .success-icon {
      font-size: 3.5rem;
      margin-bottom: 0.5rem;
    }

    .badge {
      display: inline-block;
      padding: 0.35rem 1.25rem;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 1.25rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .description {
      color: #94a3b8;
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .steps-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: left;
      margin-bottom: 1.75rem;

      h3 {
        font-size: 1rem;
        color: #f1f5f9;
        margin-bottom: 1rem;
        font-weight: 700;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      li {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        color: #cbd5e1;
        font-size: 0.95rem;
      }

      .step-num {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        font-size: 0.85rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    }

    .sla-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(79, 70, 229, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 14px;
      padding: 1rem 1.25rem;
      text-align: left;
      margin-bottom: 2rem;

      .sla-icon {
        font-size: 1.75rem;
      }

      strong {
        color: #818cf8;
        font-size: 0.95rem;
      }

      p {
        margin: 0.25rem 0 0 0;
        color: #cbd5e1;
        font-size: 0.88rem;
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
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);

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
export class ThankYouComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setSeo({
      title: '¡Gracias! Registro Confirmado',
      description: 'Gracias por registrarte en Garaje Familiar. Accede a tu panel para gestionar vehículos y gastos.',
      url: '/gracias'
    });
  }
}
