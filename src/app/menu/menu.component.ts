import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { RegistroComponent } from '../registro/registro.component';
import { ListaDocumentosComponent } from '../lista-documentos/lista-documentos.component';
import { ListaUsuariosComponent } from '../lista-usuarios/lista-usuarios.component';
import { EditorComponent } from '../editor/editor.component';
import { Perfil, Usuario } from '../entities/usuario/usuario';
import { LobbyComponent } from '../lobby/lobby.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [LoginComponent, 
            RegistroComponent, 
            ListaDocumentosComponent, 
            ListaUsuariosComponent,
            EditorComponent,
            LobbyComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  
  userService: Usuario = new Usuario();
  logedUser: Usuario | null = new Usuario();
  menuActual: String = 'login';
  ocultarMenuNav: boolean = false;
  permisos: boolean = false;
  root: boolean = false;
  
  constructor() {
  }
  
  cambiarMenu(menu: String) {
    this.logedUser = Usuario.getUsuarioLogueado();
    if(this.logedUser?.perfil === Perfil.ADMINISTRADOR) {
      this.permisos = true;
    }
    if(this.logedUser?.usuario === "root") {
      this.root = true;
    }
    this.menuActual = menu;
  }

  cerrarSesion() {
    Usuario.setUsuarioLogueado(new Usuario());
    this.permisos = false;
    this.root = false;
    this.cambiarMenu('login');
  }

  ocultarMenu(valor: boolean) {
    this.ocultarMenuNav = valor;
  }

}
