import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Perfil, Usuario } from '../entities/usuario/usuario';
import { MenuComponent } from '../menu/menu.component';

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
              private menuService: MenuComponent) {
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
      alert('Login exitoso ✔️​');
      this.menuService.ocultarMenu(false);
      this.menuService.cambiarMenu('lobby');
      if (usuario === "root") {
        alert("root solo puede gestionar usuarios, si quiere crear documentos debe crear un usuario antes ⚠️");
      }
    } else {
      alert('Los datos no coinciden ❌');
    }
  }

  async crearRoot() {
    let resultado = await this.userService.buscarUsuarioPorUser("root");
    if (!resultado) {
      await this.userService.crearUsuario("11111111A","root","","root","root", Perfil.ADMINISTRADOR);
    }
  }

  resetForm() {
    this.form.reset();
  }
}
