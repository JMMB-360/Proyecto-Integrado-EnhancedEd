import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from '../theme.service';
import { Subscription } from 'rxjs';
import { Usuario } from '../entities/usuario/usuario';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.css'
})
export class LobbyComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  darkMode: boolean = false;
  userService: Usuario = new Usuario();

  constructor(private themeService: ThemeService) {
    if (this.themeService.darkMode === true) {
      this.darkMode = true;
    } else {
      this.darkMode = false;
    }
  }

  ngOnInit(): void {
    const usuario = Usuario.getUsuarioLogueado();
    this.subscription = this.themeService.temaOscuro$.subscribe(darkMode => {
      this.darkMode = darkMode;
    });
    if (usuario?.tema === 'oscuro') {
      this.darkMode = true;
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
