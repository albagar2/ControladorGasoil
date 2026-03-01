import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'control-gasoil-familiar';

    constructor(private router: Router) { }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
    }
}
