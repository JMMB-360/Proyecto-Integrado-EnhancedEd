import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../entities/usuario/usuario';
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
  }

  async validar() {
    const usuario = this.form.value.usuario;
    const contrasena = this.form.value.contrasena;
    
    const resultado = await this.userService.login(usuario, contrasena);
    if (resultado) {
      Usuario.setUsuarioLogueado( await this.userService.buscarUsuarioPorUser(resultado.usuario));
      this.menuService.cambiarMenu('lobby');
      alert('Login exitoso ✔️​');
    } else if(usuario === "root") {
      Usuario.setUsuarioLogueado(new Usuario("","root"));
      alert('Login exitoso ✔️​');
      alert("root solo puede gestionar usuarios ⚠️");
      this.menuService.cambiarMenu('lobby');
    } else {
      alert('Los datos no coinciden ❌');
    }
  }

  resetForm() {
    this.form.reset();
  }
}
