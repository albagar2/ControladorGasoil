import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    darkMode = signal<boolean>(
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    constructor() {
        effect(() => {
            const isDark = this.darkMode();
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }

    toggleDarkMode() {
        this.darkMode.update(v => !v);
    }
}
