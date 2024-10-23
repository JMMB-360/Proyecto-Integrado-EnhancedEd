import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { RegistroComponent } from '../registro/registro.component';
import { ListaDocumentosComponent } from '../lista-documentos/lista-documentos.component';
import { ListaUsuariosComponent } from '../lista-usuarios/lista-usuarios.component';
import { EditorComponent } from '../editor/editor.component';
import { Perfil, Usuario } from '../entities/usuario/usuario';
import { LobbyComponent } from '../lobby/lobby.component';
import { ThemeService } from '../theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule,
            LoginComponent, 
            RegistroComponent, 
            ListaDocumentosComponent, 
            ListaUsuariosComponent,
            EditorComponent,
            LobbyComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();
  
  userService: Usuario = new Usuario();
  logedUser: Usuario | null = new Usuario();
  menuActual: String = 'login';
  darkMode: boolean = false;
  ocultarMenuNav: boolean = true;
  permisos: boolean = false;
  root: boolean = false;
  
  constructor(private renderer: Renderer2, private themeService: ThemeService) {
  }

  ngOnInit(): void {
    this.subscription = this.themeService.temaOscuro$.subscribe(darkMode => {
      this.darkMode = !darkMode;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  cambiarMenu(menu: String) {
    this.menuActual = menu;
    setTimeout(() => {
      if(menu === 'lobby') {
        this.cambiarThemeIcon();
      }
    }, 10);
  }

  async iniciarSesion() {
    this.logedUser = await Usuario.getUsuarioLogueado();
    if (this.logedUser?.perfil === Perfil.ADMINISTRADOR) {
      this.permisos = true;
    }
    if (this.logedUser?.usuario === "root") {
      this.root = true;
    }
  }

  cerrarSesion() {
    Usuario.setUsuarioLogueado(new Usuario());
    this.permisos = false;
    this.root = false;
    this.logedUser = new Usuario();
    this.themeService.reset();
    this.ocultarMenu(true);
    this.cambiarMenu('login');
  }

  ocultarMenu(valor: boolean) {
    this.ocultarMenuNav = valor;
  }

  async cambiarTema() {
    await this.themeService.cambiarTema(!this.darkMode);
    this.cambiarThemeIcon();
    this.darkMode = !this.darkMode;
  }

  cambiarThemeIcon() {
    if (this.darkMode) {
      this.renderer.removeClass(document.getElementById('themeIcon'), 'fa-moon');
      this.renderer.addClass(document.getElementById('themeIcon'), 'fa-sun');
    } else {
      this.renderer.removeClass(document.getElementById('themeIcon'), 'fa-sun');
      this.renderer.addClass(document.getElementById('themeIcon'), 'fa-moon');
    }
  }

}
