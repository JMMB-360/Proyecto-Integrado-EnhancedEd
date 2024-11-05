import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Perfil, Usuario } from '../entities/usuario/usuario';
import { MenuComponent } from '../menu/menu.component';
import { ThemeService } from '../theme.service';
import { AlertService } from '../alert.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginComponent {

  form: FormGroup;
  userService: Usuario = new Usuario();

  constructor(private formBuilder: FormBuilder,
              private menuService: MenuComponent,
              private themeService: ThemeService,
              private alertService: AlertService) {
    this.form = this.formBuilder.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
    this.crearRoot();
  }

  async validar() {
    const usuario = this.form.value.usuario;
    const contrasena = this.form.value.contrasena;
    let resultado = await this.userService.login(usuario, contrasena);

    if (resultado) {
      Usuario.setUsuarioLogueado( await this.userService.buscarUsuarioPorUser(resultado.usuario));
      await this.menuService.iniciarSesion();
      await this.themeService.aplicarTema();
      this.menuService.ocultarMenu(false);
      if (usuario === "root") {
        this.alertService.showAlert('warning', 'root solo puede gestionar usuarios, si quiere crear documentos debe logearse con un usuario normal ⚠️', true);
      } else {
        this.alertService.showAlert('success', 'Login exitoso ✔️');
      }
      this.menuService.cambiarMenu('lobby');
    } else {
      this.alertService.showAlert('danger', 'Los datos no coinciden ❌');
    }
  }

  async crearRoot() {
    let resultado = await this.userService.buscarUsuarioPorUser("root");
    if (!resultado) {
      await this.userService.crearUsuario("11111111A","root","","root","root", Perfil.ADMINISTRADOR);
      const rootUser = await this.userService.buscarUsuarioPorUser("root");
      await this.userService.modificarTemaUsuario(rootUser.id, "claro");
    }
  }

  resetForm() {
    this.form.reset();
  }
}
