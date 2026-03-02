import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    darkMode = signal<boolean>(
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && this.mediaQuery.matches)
    );

    constructor() {
        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.darkMode.set(e.matches);
            }
        });

        effect(() => {
            const isDark = this.darkMode();

            // Only save to localStorage if it's explicitly set or we want to persist the current state
            // For "follow system", we could avoid saving, but the toggle method currently sets it.
            // Let's keep the persistence for now if toggled.
            if (localStorage.getItem('theme')) {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            }

            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }

    toggleDarkMode() {
        this.darkMode.update(v => !v);
        // Once toggled, we force it into localStorage to remember the manual choice
        localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
    }

    resetToSystem() {
        localStorage.removeItem('theme');
        this.darkMode.set(this.mediaQuery.matches);
    }
}
