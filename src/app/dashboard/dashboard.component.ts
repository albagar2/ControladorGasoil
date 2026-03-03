import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../core/services/data.service';
import { ExportService } from '../core/services/export.service';
import { EmailService } from '../core/services/email.service';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { ToastService } from '../core/services/toast.service';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { SearchComponent } from '../shared/components/search/search.component';
import { SearchService } from '../core/services/search.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ToastComponent,
        SearchComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    public dataService = inject(DataService);
    public themeService = inject(ThemeService);
    private exportService = inject(ExportService);
    private emailService = inject(EmailService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    public searchService = inject(SearchService);

    isMobileMenuOpen = false;
    activeTab: string = 'resumen';

    ngOnInit(): void {
        this.dataService.loadAllData();
        this.updateActiveTab(this.router.url);

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.updateActiveTab(event.urlAfterRedirects);
        });
    }

    private updateActiveTab(url: string) {
        const parts = url.split('/');
        this.activeTab = parts[parts.length - 1] || 'resumen';
        this.cdr.detectChanges();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    toggleMobileMoreMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }


    closeMobileMenu() {
        this.isMobileMenuOpen = false;
    }

    exportData() {
        if (!confirm('¿Quieres descargar el informe de gastos?')) return;

        const vehicles = this.dataService.vehicles();
        const refuels = this.dataService.refuels();
        const maints = this.dataService.maintenances();

        this.exportService.generateCostReport(vehicles, refuels, maints);
    }

    emailReport() {
        if (!confirm('¿Quieres enviar el informe de gastos actual a tu correo?')) return;

        const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
        let email = '';
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                email = user.email;
            } catch (e) { }
        }

        if (!email) {
            this.toastService.error('No se pudo determinar tu correo para enviar el informe.');
            return;
        }

        this.dataService.loading.set(true);
        const currentMonth = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });

        this.emailService.sendMonthlyReport({
            to: email,
            reportUrl: 'https://ejemplo.com/informe.pdf', // Example placeholder URL
            month: currentMonth
        }).subscribe({
            next: () => {
                this.toastService.success(`Informe del mes enviado correctamente a ${email}`);
                this.dataService.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error enviando informe', err);
                this.toastService.error('Error enviando el informe por correo.');
                this.dataService.loading.set(false);
            }
        });
    }
}

