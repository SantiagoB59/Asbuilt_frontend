import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  
  menuMobileAbierto = false;

  toggleMenuMobile(): void {
    this.menuMobileAbierto = !this.menuMobileAbierto;
  }

  cerrarMenuMobile(): void {
    this.menuMobileAbierto = false;
  }
}
