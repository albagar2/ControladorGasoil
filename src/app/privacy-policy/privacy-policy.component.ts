import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="privacy-container">
      <div class="glass-card">
        <header class="header">
          <a routerLink="/" class="back-link">← Volver al Inicio</a>
          <h1>Política de Privacidad y Protección de Datos</h1>
          <p class="updated">Última actualización: 10 de Septiembre de 2026</p>
        </header>

        <section class="content">
          <div class="highlight-box">
            🛡️ <strong>Compromiso de Privacidad Familiar:</strong> Tus datos de vehículos, tickets y consumo son estrictamente privados y pertenencia exclusiva de tu familia. No vendemos ni compartimos tu información con terceros.
          </div>

          <h2>1. Responsable del Tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos recabados en este sitio web es **Garaje Familiar - Control de Gastos**. Para cualquier consulta relativa a la protección de datos, puedes contactarnos en: <code>privacidad&#64;controlgasoilfamiliar.com</code>.
          </p>

          <h2>2. Datos que Recopilamos</h2>
          <ul>
            <li><strong>Datos de cuenta:</strong> Nombre, dirección de correo electrónico y contraseña encriptada (mediante bcrypt).</li>
            <li><strong>Datos de vehículos:</strong> Marca, modelo, matrícula, año, tipo de combustible y kilometraje.</li>
            <li><strong>Datos de repostajes y mantenimientos:</strong> Fechas, importes, litros, ubicación de la estación y fotografías/tickets almacenados de forma segura en Google Drive o Supabase.</li>
          </ul>

          <h2>3. Finalidad del Tratamiento</h2>
          <p>
            Los datos personales facilitados se utilizan únicamente para ofrecer las funcionalidades del servicio: cálculo de consumos medios, gráficos estadísticos familiares, recordatorios automáticos de ITV y sincronización de facturas.
          </p>

          <h2>4. Almacenamiento y Seguridad</h2>
          <p>
            Toda la información se almacena en servidores seguros con cifrado SSL/TLS. Las contraseñas se almacenan mediante algoritmos de hash unidireccionales y el acceso a los datos está restringido exclusivamente a los miembros de tu unidad familiar.
          </p>

          <h2>5. Derechos del Usuario (RGPD)</h2>
          <p>
            Tienes derecho a acceder, rectificar, suprimir, limitar o solicitar la portabilidad de tus datos en cualquier momento directamente desde tu panel de usuario o enviando un correo electrónico a nuestro equipo.
          </p>
        </section>

        <footer class="footer-actions">
          <a routerLink="/" class="btn-primary">Aceptar y Continuar</a>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .privacy-container {
      min-height: 100vh;
      padding: 3rem 1.5rem;
      background: #0f172a;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      max-width: 850px;
      width: 100%;
    }

    .header {
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1.5rem;

      .back-link {
        color: #818cf8;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 1rem;

        &:hover {
          text-decoration: underline;
        }
      }

      h1 {
        font-size: 2rem;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 0.5rem;
      }

      .updated {
        font-size: 0.85rem;
        color: #94a3b8;
      }
    }

    .content {
      line-height: 1.7;

      h2 {
        font-size: 1.3rem;
        color: #f1f5f9;
        margin-top: 1.75rem;
        margin-bottom: 0.75rem;
        font-weight: 700;
      }

      p {
        color: #cbd5e1;
        font-size: 0.98rem;
        margin-bottom: 1rem;
      }

      ul {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
        color: #cbd5e1;

        li {
          margin-bottom: 0.5rem;
        }
      }

      code {
        background: rgba(15, 23, 42, 0.8);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        color: #38bdf8;
        font-family: monospace;
      }
    }

    .highlight-box {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 1.25rem;
      color: #34d399;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .footer-actions {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }

    .btn-primary {
      display: inline-block;
      padding: 0.85rem 2rem;
      background: linear-gradient(135deg, #4f46e5, #3b82f6);
      color: #ffffff;
      font-weight: 700;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }
  `]
})
export class PrivacyPolicyComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setSeo({
      title: 'Política de Privacidad y Protección de Datos',
      description: 'Conoce cómo protegemos tus datos familiares y de vehículos en Garaje Familiar.',
      url: '/privacidad'
    });
  }
}
