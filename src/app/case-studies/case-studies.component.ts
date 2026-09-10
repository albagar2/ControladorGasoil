import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../core/services/seo.service';

interface CaseStudy {
  id: string;
  family: string;
  location: string;
  vehicles: string;
  savings: string;
  quote: string;
  details: string[];
  metrics: { label: string; value: string }[];
}

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="case-studies-container">
      <header class="header">
        <div class="badge">Casos de Éxito Reales</div>
        <h1>Cómo Familias Reales Ahorran hasta 480€/Año en Combustible</h1>
        <p class="subtitle">
          Descubre historias reales de familias que han unificado el control de sus vehículos, revisiones de ITV y gastos de gasoil con Garaje Familiar.
        </p>
      </header>

      <div class="case-grid">
        <div *ngFor="let item of caseStudies" class="case-card glass-card">
          <div class="card-header">
            <div>
              <h2>{{ item.family }}</h2>
              <span class="location">📍 {{ item.location }}</span>
            </div>
            <div class="savings-tag">
              Ahorro de {{ item.savings }}
            </div>
          </div>

          <p class="quote">"{{ item.quote }}"</p>

          <div class="metrics-grid">
            <div *ngFor="let m of item.metrics" class="metric-box">
              <span class="m-value">{{ m.value }}</span>
              <span class="m-label">{{ m.label }}</span>
            </div>
          </div>

          <div class="details-list">
            <h4>Puntos Clave del Ahorro:</h4>
            <ul>
              <li *ngFor="let detail of item.details">
                <span class="check">✓</span> {{ detail }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="cta-banner glass-card">
        <h2>¿Quieres optimizar los gastos de tu garaje familiar?</h2>
        <p>Regístrate en menos de 2 minutos y comienza a controlar cada litro y cada euro.</p>
        <div class="cta-buttons">
          <a routerLink="/register" class="btn-primary">Empieza Gratis Ahora</a>
          <a routerLink="/login" class="btn-secondary">Iniciar Sesión</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .case-studies-container {
      min-height: 100vh;
      padding: 4rem 1.5rem;
      background: #0f172a;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      max-width: 750px;
      margin: 0 auto 3.5rem auto;

      .badge {
        display: inline-block;
        padding: 0.35rem 1.25rem;
        background: rgba(79, 70, 229, 0.15);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 1.25rem;
      }

      h1 {
        font-size: 2.5rem;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 1rem;
        line-height: 1.2;
      }

      .subtitle {
        color: #94a3b8;
        font-size: 1.1rem;
        line-height: 1.6;
      }
    }

    .case-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;

      h2 {
        font-size: 1.35rem;
        font-weight: 700;
        margin: 0 0 0.25rem 0;
        color: #ffffff;
      }

      .location {
        font-size: 0.85rem;
        color: #94a3b8;
      }
    }

    .savings-tag {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .quote {
      font-style: italic;
      color: #e2e8f0;
      font-size: 0.98rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
      padding-left: 0.75rem;
      border-left: 3px solid #6366f1;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .metric-box {
      background: rgba(15, 23, 42, 0.6);
      border-radius: 12px;
      padding: 0.85rem;
      text-align: center;

      .m-value {
        display: block;
        font-size: 1.25rem;
        font-weight: 800;
        color: #38bdf8;
      }

      .m-label {
        font-size: 0.78rem;
        color: #94a3b8;
      }
    }

    .details-list {
      h4 {
        font-size: 0.9rem;
        color: #cbd5e1;
        margin-bottom: 0.75rem;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      li {
        font-size: 0.88rem;
        color: #94a3b8;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .check {
        color: #10b981;
        font-weight: bold;
      }
    }

    .cta-banner {
      text-align: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(16, 185, 129, 0.1));
      border: 1px solid rgba(99, 102, 241, 0.3);

      h2 {
        font-size: 1.8rem;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 0.75rem;
      }

      p {
        color: #cbd5e1;
        font-size: 1.05rem;
        margin-bottom: 1.75rem;
      }
    }

    .cta-buttons {
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
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5, #3b82f6);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);

      &:hover {
        transform: translateY(-2px);
      }
    }

    .btn-secondary {
      background: rgba(51, 65, 85, 0.8);
      color: #ffffff;

      &:hover {
        background: rgba(71, 85, 105, 1);
      }
    }
  `]
})
export class CaseStudiesComponent implements OnInit {
  private seoService = inject(SeoService);

  public caseStudies: CaseStudy[] = [
    {
      id: 'familia-garcia',
      family: 'Familia García Martínez',
      location: 'Madrid',
      vehicles: '2 coches (Diésel y Híbrido)',
      savings: '480 € / año',
      quote: 'Controlar los repostajes de ambos coches en la app nos hizo ver que repostábamos en la gasolinera más cara de nuestro barrio sin darnos cuenta.',
      details: [
        'Comparativa directa de precios de gasoil en tiempo real.',
        'Aviso preventivo de cambio de aceite evitando avería grave.',
        'Organización centralizada de facturas en Google Drive.'
      ],
      metrics: [
        { label: 'Reducción de consumo', value: '-12%' },
        { label: 'Tiempo ahorrado/mes', value: '3 horas' }
      ]
    },
    {
      id: 'familia-lopez',
      family: 'Familia López Fernández',
      location: 'Barcelona',
      vehicles: '3 vehículos (Padres e Hijo)',
      savings: '350 € / año',
      quote: 'Antes perdíamos los tickets y nunca sabíamos exactamente cuánto gastaba cada conductor. Ahora cada repostaje se registra en 5 segundos.',
      details: [
        'Reparto equitativo de gastos de combustible entre conductores.',
        'Recordatorio automático de renovación de seguro e ITV.',
        'Historial accesible desde cualquier smartphone.'
      ],
      metrics: [
        { label: 'Control de tickets', value: '100%' },
        { label: 'Alertas de ITV a tiempo', value: '4 / 4' }
      ]
    }
  ];

  ngOnInit(): void {
    this.seoService.setSeo({
      title: 'Casos de Éxito y Historias de Ahorro Familiar',
      description: 'Descubre cómo familias reales ahorran en combustible y mantenimiento con Garaje Familiar.',
      url: '/casos-de-exito'
    });
  }
}
