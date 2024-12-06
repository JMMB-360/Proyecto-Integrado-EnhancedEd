import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Usuario } from '../entities/usuario/usuario';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService } from '../alert.service';
import { ConfirmService } from '../confirm.service';
import { MenuComponent } from '../menu/menu.component';

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
  editUserPassForm: FormGroup;

  listaUsuario: Usuario[] = [];
  userService: Usuario = new Usuario();
  usuarioOriginal: Usuario = new Usuario();
  idEditUser: number = 0;
  usuario: string = '';

  verContrasena: boolean = false;
  showInfo: boolean = false;
  showInfoUser: boolean = false;
  mostrarLista: boolean = true;
  mostrarModificarForm: boolean = false;
  mostrarPassForm: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder, 
              private alertService: AlertService, 
              private confirmService: ConfirmService,
              public menuService: MenuComponent) {
    this.editUserForm = this.formBuilder.group({
      dni: ['', [Validators.required, this.dniValidator]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      usuario: [{value: '', disabled: true}, Validators.required],
      perfil: ['', Validators.required]
    });
    this.editUserPassForm = this.formBuilder.group({
      contrasena: ['', [Validators.required, this.passwordValidator]]
    });
  }

  async ngOnInit() {
    await this.ordenarListaUsuarios();
    if(this.menuService.edit) {
      this.mostrarLista = false;
      this.mostrarModificarForm = true;
      const userId = Usuario.logedUser?.id ?? -1;
      const userUser = Usuario.logedUser?.usuario ?? '';
      await this.mostrarModificar(userId, userUser);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async modificar(id: number) {
    if (this.editUserForm.invalid) {
      return;
    }
    const dni = this.editUserForm.value.dni;
    const nombre = this.editUserForm.value.nombre;
    const apellidos = this.editUserForm.value.apellidos;
    const usuario = this.usuario;
    const perfil = this.editUserForm.value.perfil;

    await this.userService.modificarUsuario(id, dni, nombre, apellidos, usuario, perfil);
    const index = this.listaUsuario.findIndex(user => user.id === this.idEditUser);
    if (index !== -1) {
      this.listaUsuario[index].dni = this.editUserForm.value.dni;
      this.listaUsuario[index].nombre = this.editUserForm.value.nombre;
      this.listaUsuario[index].apellidos = this.editUserForm.value.apellidos;
      this.listaUsuario[index].usuario = this.usuario;
      this.listaUsuario[index].perfil = this.editUserForm.value.perfil;
    }
    await this.ordenarListaUsuarios();
    this.alertService.showAlert('success', 'Usuario modificado correctamente ✔️');
    this.editUserForm.reset();
    this.emitirOcultarMenu(false);
    this.mostrarModificarForm = false;
    this.mostrarLista = true;
    this.toLobby();
  }

  async modificarPass(id: number) {
    this.editUserPassForm.markAllAsTouched();
    if (this.editUserPassForm.invalid) {
      return;
    } else {//!!!!!!!!!!!!!!!!!!!!!!!!!
      const confirmacion = await this.confirmService.ask('Cambiar contraseña', '¿Desea cambiar la contraseña?, el cambio no será revertido cancelando la modificación del usuario');
      if(confirmacion) {
        const contra = this.editUserPassForm.value.contrasena;
        await this.userService.modificarUsuarioPass(id, contra);
        this.salirPassEdit();
        this.alertService.showAlert('success', 'Contraseña modificada correctamente ✔️');
      }
    }
  }

  async eliminar(id: number, nombre: string, apellidos: string) {
    const confirmacion = await this.confirmService.ask('Eliminar usuario', '¿Desea eliminar este usuario?: '+ nombre + ' ' + apellidos);
    if(confirmacion) {
      this.userService.eliminarUsuario(id);
      const index = this.listaUsuario.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaUsuario.splice(index, 1);
      }
      this.alertService.showAlert('success', 'Usuario eliminado ✔️');
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
    setTimeout(() => {
      this.usuarioOriginal = JSON.parse(JSON.stringify(usuario));
    }, 50);

    this.editUserForm.patchValue({
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      usuario: usuario.usuario,
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
  }

  mostrarEditPass() {
    this.showInfoUser = false;
    this.mostrarModificarForm = false;
    this.mostrarPassForm = true;
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

  mostrarContra() {
    this.verContrasena = !this.verContrasena;
  }

  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  toggleInfoUser() {
    this.showInfoUser = !this.showInfoUser;
  }

  async cancelarEdit() {
    if (this.editUserForm.value.dni === this.usuarioOriginal.dni &&
        this.editUserForm.value.perfil === this.usuarioOriginal.perfil &&
        this.editUserForm.value.nombre === this.usuarioOriginal.nombre &&
        this.editUserForm.value.apellidos === this.usuarioOriginal.apellidos) 
    {
      this.salir();
    } else {
      const confirmacion = await this.confirmService.ask('Cancelar cambios', 'Hay cambios sin confirmar que serán descartados, ¿desea continuar?');
      if (confirmacion) {
        this.salir();
      }
    }
  }

  salirPassEdit() {
    this.editUserPassForm.reset();
    this.showInfoUser = false;
    this.mostrarPassForm = false;
    this.mostrarModificarForm = true;
  }

  salir() {
    this.editUserForm.reset();
    this.mostrarModificarForm = false;
    this.emitirOcultarMenu(false);
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.mostrarLista = true;
    this.toLobby();
  }

  toLobby() {
    if (this.menuService.edit) {
      this.menuService.edit = false;
      this.ocultarMenu.emit(false);
      this.menuService.cambiarMenu('lobby');
    }
  }

  emitirOcultarMenu(valor: boolean) {
    setTimeout(() => {
      this.ocultarMenu.emit(valor);
    });
  }
}
