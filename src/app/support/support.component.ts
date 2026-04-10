import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  supportOptions = [
    {
      title: 'WhatsApp',
      description: 'Asistencia técnica inmediata',
      icon: 'chat',
      color: '#25D366',
      link: 'https://wa.me/34606990974'
    },
    {
      title: 'Email',
      description: 'Consultas generales y reportes',
      icon: 'email',
      color: '#EA4335',
      link: 'mailto:controlgasoilfamiliar@gmail.com'
    },
    {
      title: 'Manual',
      description: 'Guía de uso rápido',
      icon: 'menu_book',
      color: '#4285F4',
      link: '/assets/manual.pdf'
    }
  ];
}
