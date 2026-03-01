import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../../core/services/search.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent {
    public searchService = inject(SearchService);

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            this.searchService.toggle();
        }
        if (event.key === 'Escape' && this.searchService.isOpen()) {
            this.searchService.close();
        }
    }
}
