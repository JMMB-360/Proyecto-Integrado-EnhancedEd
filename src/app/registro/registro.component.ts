import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Perfil, Usuario } from '../entities/usuario/usuario';
import { Subscription } from 'rxjs';
import { MenuComponent } from '../menu/menu.component';
import { AlertService } from '../alert.service';
import { ConfirmService } from '../confirm.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit, OnDestroy {

  @Output() ocultarMenu = new EventEmitter<boolean>();

  form: FormGroup;
  perfil = Perfil;
  usuario: string = '';
  notLogged: boolean = false;
  showInfoPass: boolean = false;
  showInfoUser: boolean = false;
  verContrasena: boolean = false;
  userService: Usuario = new Usuario();
  loggedUser: Usuario | null = new Usuario();
  
  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder, 
              private menuService: MenuComponent,
              private alertService: AlertService,
              private confirmService: ConfirmService) {
    this.form = this.formBuilder.group({
      dni: ['', [Validators.required, this.dniValidator]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      usuario: [{value: '', disabled: true}, Validators.required],
      contrasena: ['', [Validators.required, this.passwordValidator]],
      perfil: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.subscriptions.add(
      this.form.get('nombre')?.valueChanges.subscribe(() => this.updateUsuario())
    );
    this.subscriptions.add(
      this.form.get('apellidos')?.valueChanges.subscribe(() => this.updateUsuario())
    );
    this.subscriptions.add(
      this.form.get('dni')?.valueChanges.subscribe(() => this.updateUsuario())
    );

    await this.updateUsuario();
    setTimeout(() => {
      this.emitirOcultarMenu(true);
    });

    this.loggedUser = Usuario.getUsuarioLogueado() ?? null;
    if(this.loggedUser === null) {
      this.notLogged = true;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  updateUsuario() {
    const nombre = this.form.get('nombre')?.value || '';
    const apellidos = this.form.get('apellidos')?.value || '';
    const dni = this.form.get('dni')?.value || '';

    const nombrePart = nombre ? nombre.charAt(0).toLowerCase() : '';
    const apellidosPart = apellidos ? apellidos.split(' ').map((a: string) => a.substring(0, 3).toLowerCase()).join('') : '';
    const dniPart = dni ? dni.slice(-4, -1) : '';

    this.usuario = `${nombrePart}${apellidosPart}${dniPart}`;

    this.form.get('usuario')?.setValue(this.usuario, { emitEvent: false });
    this.form.value.usuario = this.usuario;
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

  mostrarContra() {
    this.verContrasena = !this.verContrasena;
  }

  toggleInfoPass() {
    this.showInfoPass = !this.showInfoPass;
  }
  toggleInfoUser() {
    this.showInfoUser = !this.showInfoUser;
  }

  async crear() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const dni = this.form.value.dni;
    const nombre = this.form.value.nombre;
    const apellidos = this.form.value.apellidos;
    const usuario = this.usuario;
    const contrasena = this.form.value.contrasena;
    const perfil = this.form.value.perfil;

    const respuesta = await this.userService.crearUsuario(dni, nombre, apellidos, usuario, contrasena, perfil);
    if(respuesta === 'ECode01') {
      this.alertService.showAlert('danger', 'El DNI ya existe ❌');
      return;
    } else if(respuesta === 'OK') {
      this.alertService.showAlert('success', 'Usuario creado correctamente ✔️');
    } else if(respuesta === 'ECode02') {
      this.alertService.showAlert('danger', 'Error: Respuesta inesperada del servidor ❌');
      return;
    }
    const userId = await this.userService.buscarUsuarioPorUser(usuario);
    await this.userService.modificarTemaUsuario(userId.id, 'claro');
    this.salir();
  }

  async cancelar() {
    if (this.usuario === '' || this.usuario === null &&
        this.form.value.perfil === '' || this.form.value.perfil === null &&
        this.form.value.contrasena === '' || this.form.value.contrasena === null) 
    {
      this.salir();
    } else {
      const confirmacion = await this.confirmService.ask('Cancelar registro', 'Se cancelará el registro del usuario, ¿Desea continuar?');
      if (confirmacion) {
        this.salir();
      }
    }
  }

  salir() {
    this.form.reset();
    if(this.notLogged) {
      this.menuService.cambiarMenu('login');
    } else {
      this.emitirOcultarMenu(false);
      this.menuService.cambiarMenu('lobby');
    }
  }

  emitirOcultarMenu(valor: boolean) {
    this.ocultarMenu.emit(valor);
  }

}
