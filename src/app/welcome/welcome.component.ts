import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
    constructor(private router: Router) { }

    ngOnInit() {
        if (localStorage.getItem('token')) {
            this.router.navigate(['/dashboard']);
        }
    }
}
