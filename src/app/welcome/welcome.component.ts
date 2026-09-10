import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SeoService } from '../core/services/seo.service';
import { AuthService } from '../core/services/auth.service';
import { MobileStickyCtaComponent } from '../shared/components/mobile-sticky-cta/mobile-sticky-cta.component';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileStickyCtaComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  private router = inject(Router);
  private seoService = inject(SeoService);
  private authService = inject(AuthService);

  public faqs: FaqItem[] = [
    {
      question: '¿Cómo ayuda Garaje Familiar a ahorrar dinero en combustible?',
      answer: 'Nuestra aplicación calcula en tiempo real el consumo medio de tu vehículo y compara automáticamente los precios oficiales del gasoil en gasolineras cercanas, permitiéndote repostar siempre en la opción más económica.',
      open: true
    },
    {
      question: '¿Es posible compartir un vehículo entre varios miembros de la familia?',
      answer: '¡Sí! Puedes crear tu grupo familiar e invitar a conductores. Cada conductor podrá registrar repostajes y revisiones, asignándose automáticamente los gastos.',
      open: false
    },
    {
      question: '¿Cómo se guardan las facturas y tickets de las revisiones?',
      answer: 'Los tickets y facturas se suben y organizan automáticamente en carpetas mensuales en Google Drive y almacenamiento en la nube seguro, evitando que se traspapelen.',
      open: false
    },
    {
      question: '¿Recibiré avisos para las revisiones de ITV y cambios de aceite?',
      answer: 'Sí, el sistema envía notificaciones automáticas por correo electrónico y avisos en el panel de control semanas antes de que venza la ITV o el mantenimiento programado.',
      open: false
    }
  ];

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Set SEO Meta & Structured Data
    this.seoService.setSeo({
      title: 'Control de Gastos de Combustible y Vehículos Familiares',
      description: 'Gestiona la flota de vehículos de tu familia, controla repostajes, facturas de mantenimiento y ahorra en diésel.',
      url: '/'
    });

    // Inject FAQ Schema JSON-LD
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": this.faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    };
    this.seoService.injectJsonLd(faqSchema, 'faq-json-ld');
  }

  public toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  public startDemo(): void {
    this.authService.loginDemo().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
