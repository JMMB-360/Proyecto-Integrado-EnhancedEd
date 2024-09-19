import { Component, OnInit } from '@angular/core';
import { Perfil, Usuario } from '../entities/usuario/usuario';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.css'
})
export class ListaUsuariosComponent implements OnInit {

  editUserForm: FormGroup;

  listaUsuario: Usuario[] = [];
  userService: Usuario = new Usuario();
  idEditUser: number = 0;
  usuario: string = '';

  mostrarLista: boolean = true;
  mostrarModificarForm: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder) {
    this.editUserForm = this.formBuilder.group({
      dni: ['', [Validators.required, this.dniValidator]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      usuario: [{value: '', disabled: true}, Validators.required],
      contrasena: ['', [Validators.required, this.passwordValidator]],
      perfil: ['', Validators.required]
    });
  }

  async ngOnInit() {
    const usuarios = await this.userService.buscarTodosLosUsuarios();
    this.listaUsuario = usuarios;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async modificar(id: number) {
    if (this.editUserForm.invalid) {
      if (this.editUserForm.get('dni')?.hasError('required') || this.editUserForm.get('dni')?.hasError('invalidDni')) {
        alert('DNI incorrecto ❌');
      } else
      if (this.editUserForm.get('contrasena')?.hasError('required') || this.editUserForm.get('contrasena')?.hasError('invalidPassword')) {
        alert('La contraseña debe contener al menos 8 caracteres, una letra minúscula, una letra mayúscula, un número y un carácter especial ❌');
      } else {
        alert('Faltan campos por rellenar ❌');
      }
      return;
    }
    const dni = this.editUserForm.value.dni;
    const nombre = this.editUserForm.value.nombre;
    const apellidos = this.editUserForm.value.apellidos;
    const usuario = this.usuario;
    const contrasena = this.editUserForm.value.contrasena;
    const perfil = this.editUserForm.value.perfil;

    await this.userService.modificarUsuario(id, dni, nombre, apellidos, usuario, contrasena, perfil);
    const index = this.listaUsuario.findIndex(user => user.id === this.idEditUser);
      if (index !== -1) {
        this.listaUsuario[index].dni = this.editUserForm.value.dni;
        this.listaUsuario[index].nombre = this.editUserForm.value.nombre;
        this.listaUsuario[index].apellidos = this.editUserForm.value.apellidos;
        this.listaUsuario[index].usuario = this.usuario;
        this.listaUsuario[index].perfil = this.editUserForm.value.perfil;
      }
    alert("Usuario modificado correctamente ✔️");
    this.editUserForm.reset();
    this.mostrarModificarForm = false;
    this.mostrarLista = true;
  }

  async eliminar(id: number, nombre: string, apellidos: string) {
    if(window.confirm("¿Desea eliminar este usuario?: "+ nombre + " " + apellidos)) {
      this.userService.eliminarUsuario(id);
      const index = this.listaUsuario.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaUsuario.splice(index, 1);
      }
      alert('Usuario eliminado ✔️​');
    }
  }

  updateUsuario() {
    const nombre = this.editUserForm.get('nombre')?.value || '';
    const apellidos = this.editUserForm.get('apellidos')?.value || '';
    const dni = this.editUserForm.get('dni')?.value || '';

    const nombrePart = nombre ? nombre.charAt(0).toLowerCase() : '';
    const apellidosPart = apellidos ? apellidos.split(' ').map((a: string) => a.substring(0, 3).toLowerCase()).join('') : '';
    const dniPart = dni ? dni.slice(-4, -1) : '';

    this.usuario = `${nombrePart}${apellidosPart}${dniPart}`;

    this.editUserForm.get('usuario')?.setValue(this.usuario, { emitEvent: false });
    this.editUserForm.value.usuario = this.usuario;
  }

  dniValidator(control: AbstractControl): ValidationErrors | null {
    const dniPattern = /^[0-9]{8}[A-Za-z]$/;
    const valid = dniPattern.test(control.value);
    return valid ? null : { invalidDni: true };
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const valid = passwordPattern.test(control.value);
    return valid ? null : { invalidPassword: true };
  }

  async mostrarModificar(id: number, user: string) {

    const usuario = await this.userService.buscarUsuarioPorUser(user);

    this.editUserForm.patchValue({
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      usuario: usuario.usuario,
      contrasena: usuario.contrasena,
      perfil: usuario.perfil
    });
    this.mostrarLista = false;
    this.mostrarModificarForm = true;
    this.idEditUser = id;

    if (usuario.usuario != "root") {
      this.subscriptions.add(
        this.editUserForm.get('nombre')?.valueChanges.subscribe(() => this.updateUsuario())
      );
      this.subscriptions.add(
        this.editUserForm.get('apellidos')?.valueChanges.subscribe(() => this.updateUsuario())
      );
      this.subscriptions.add(
        this.editUserForm.get('dni')?.valueChanges.subscribe(() => this.updateUsuario())
      );
      this.updateUsuario();
    } else {
      this.usuario = "root";
    }
  }

  cancelarEdit() {
    this.editUserForm.reset();
    this.mostrarModificarForm = false;
    this.mostrarLista = true;
  }
}
