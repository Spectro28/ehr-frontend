import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}
  isSecretary(): boolean {
    return this.authService.isSecretary();
  }

  isDoctor(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'DOCTOR';
  }

  isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'ADMIN';
  }
}