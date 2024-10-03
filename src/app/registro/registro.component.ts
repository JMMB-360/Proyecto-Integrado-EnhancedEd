import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Perfil, Usuario } from '../entities/usuario/usuario';
import { Subscription } from 'rxjs';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit, OnDestroy {

  @Output() ocultarMenu = new EventEmitter<boolean>();

  form: FormGroup;
  perfil = Perfil;
  usuario: string = '';
  userService: Usuario = new Usuario();
  cambios: boolean = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder, private menuService: MenuComponent) {
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

  async crear() {
    if (this.form.invalid) {
      if (this.form.get('dni')?.hasError('required') || this.form.get('dni')?.hasError('invalidDni')) {
        alert('DNI incorrecto ❌');
      } else
      if (this.form.get('contrasena')?.hasError('required') || this.form.get('contrasena')?.hasError('invalidPassword')) {
        alert('La contraseña debe contener al menos 8 caracteres, una letra minúscula, una letra mayúscula, un número y un carácter especial ❌');
      } else {
        alert('Faltan campos por rellenar ❌');
      }
      return;
    }
    const dni = this.form.value.dni;
    const nombre = this.form.value.nombre;
    const apellidos = this.form.value.apellidos;
    const usuario = this.usuario;
    const contrasena = this.form.value.contrasena;
    const perfil = this.form.value.perfil;

    const resultado = await this.userService.crearUsuario(dni, nombre, apellidos, usuario, contrasena, perfil);
    alert(resultado);
    this.salir();
  }

  cancelar() {
    if (this.cambios) {
      if (window.confirm("Se cancelará la creación del usuario, ¿desea continuar?")) {
        this.salir();
      }
    } else {
      this.salir();
    }
  }

  salir() {
    this.form.reset();
    this.emitirOcultarMenu(false);
    this.menuService.cambiarMenu('lobby');
  }

  emitirOcultarMenu(valor: boolean) {
    this.ocultarMenu.emit(valor);
  }

}
