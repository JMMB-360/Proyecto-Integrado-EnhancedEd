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
  perfiles: Perfil[] = [Perfil.ADMINISTRADOR, Perfil.PROFESOR];
  menuActual: String = 'login';
  permisos: boolean = false;
  root: boolean = false;
  
  constructor() {
  }
  
  cambiarMenu(menu: String) {
    if(this.logedUser?.nombre === '') {
      this.logedUser = Usuario.getUsuarioLogueado();
      if(this.logedUser?.perfil === Perfil.ADMINISTRADOR) {
        this.permisos = true;
      }
      if(this.logedUser?.nombre === "root") {
        this.root = true;
      }
    }
    this.menuActual = menu;
  }

  cerrarSesion() {
    Usuario.setUsuarioLogueado(new Usuario());
    this.menuActual = 'login';
    this.permisos = false;
    this.root = false;
  }

}
