import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Usuario } from '../entities/usuario/usuario';
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

  @Output() ocultarMenu = new EventEmitter<boolean>();

  editUserForm: FormGroup;

  listaUsuario: Usuario[] = [];
  userService: Usuario = new Usuario();
  idEditUser: number = 0;
  usuario: string = '';

  cambios: boolean = false;
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
    this.ordenarListaUsuarios();
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
    await this.ordenarListaUsuarios();
    alert("Usuario modificado correctamente ✔️");
    this.editUserForm.reset();
    this.emitirOcultarMenu(false);
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
    this.emitirOcultarMenu(true);
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
    setTimeout(() => {
      this.subscriptions.add(
        this.editUserForm.valueChanges.subscribe(() => {
          this.cambios = true;
        })
      );
    }, 1000);
  }

  async ordenarListaUsuarios() {
    try {
      const usuarios: any[] = await this.userService.buscarTodosLosUsuarios();
      this.listaUsuario = usuarios.sort((a, b) => {
        const comparacion = a.nombre.localeCompare(b.nombre);
        if (comparacion === 0) {
          return a.apellidos.localeCompare(b.apellidos);
        }
        return comparacion;
      });
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }

  cancelarEdit() {
    if (this.cambios) {
      if (window.confirm("Hay cambios sin confirmar, ¿desea continuar?")) {
        this.salir();
      }
    } else {
      this.salir();
    }
  }

  salir() {
    this.editUserForm.reset();
    this.mostrarModificarForm = false;
    this.emitirOcultarMenu(false);
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.cambios = false;
    this.mostrarLista = true;
  }

  emitirOcultarMenu(valor: boolean) {
    setTimeout(() => {
      this.ocultarMenu.emit(valor);
    });
  }
}
