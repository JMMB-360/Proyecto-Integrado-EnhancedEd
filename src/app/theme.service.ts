import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from './entities/usuario/usuario';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private temaOscuroSubject = new BehaviorSubject<boolean>(false);
  temaOscuro$ = this.temaOscuroSubject.asObservable();
  userService: Usuario = new Usuario();
  darkMode: boolean = false;

  async cambiarTema(darkMode: boolean) {
    const usuario = Usuario.getUsuarioLogueado();
    this.temaOscuroSubject.next(darkMode);
    if (usuario) {
      if (darkMode) {
        await this.userService.modificarTemaUsuario(usuario.id, 'oscuro');
      } else {
        await this.userService.modificarTemaUsuario(usuario.id, 'claro');
      }
    }
    setTimeout(() => {
      this.aplicarTema();
    }, 10);
  }

  aplicarTema() {
    const usuario = Usuario.getUsuarioLogueado();
    if(usuario?.tema === 'oscuro') {
      document.documentElement.setAttribute('data-theme', 'oscuro');
      this.darkMode = true;
    } else {
      document.documentElement.setAttribute('data-theme', 'claro');
      this.darkMode = false;
    }
  }

  reset() {
    document.documentElement.setAttribute('data-theme', 'claro');
    this.darkMode = false;
  }
}
