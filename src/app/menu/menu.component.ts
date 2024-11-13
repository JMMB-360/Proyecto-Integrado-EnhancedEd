import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { RegistroComponent } from '../registro/registro.component';
import { ListaDocumentosComponent } from '../lista-documentos/lista-documentos.component';
import { ListaUsuariosComponent } from '../lista-usuarios/lista-usuarios.component';
import { EditorComponent } from '../editor/editor.component';
import { AlertComponent } from '../alert/alert.component';
import { Perfil, Usuario } from '../entities/usuario/usuario';
import { LobbyComponent } from '../lobby/lobby.component';
import { ThemeService } from '../theme.service';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ConfirmService } from '../confirm.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule,
            LoginComponent, 
            RegistroComponent, 
            ListaDocumentosComponent, 
            ListaUsuariosComponent,
            EditorComponent,
            LobbyComponent,
            AlertComponent,
            ConfirmComponent],
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
  userSubMenu: boolean = false;
  permisos: boolean = false;
  edit: boolean = false;
  root: boolean = false;
  
  constructor(private themeService: ThemeService,
              private confirmService: ConfirmService) {
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
  }

  async iniciarSesion() {
    this.logedUser = await Usuario.getUsuarioLogueado();
    if (this.logedUser?.perfil === Perfil.ADMINISTRADOR) {
      this.permisos = true;
    }
    if (this.logedUser?.usuario === "root") {
      this.root = true;
    }
    if (this.logedUser?.tema === 'oscuro') {
      this.darkMode = true;
    } else {
      this.darkMode = false;
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
    this.darkMode = !this.darkMode;
  }

  toggleSubMenu() {
    this.userSubMenu = !this.userSubMenu;
  }

  editUser() {
    this.userSubMenu = false;
    this.edit = true;
    this.cambiarMenu('buscarUsuarios');
  }

  async deleteUser() {
    this.userSubMenu = false;
    const confirmacion = await this.confirmService.ask('Eliminar usuario', '¿Desea eliminar su usuario?');
    if(confirmacion) {
      const userId = this.logedUser?.id ?? -1;
      await this.userService.eliminarUsuario(userId);
      this.cerrarSesion();
    }
  }

}
