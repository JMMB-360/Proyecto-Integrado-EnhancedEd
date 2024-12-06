import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Usuario } from '../entities/usuario/usuario';
import { Documento } from '../entities/documento/documento';
import { Seccion } from '../entities/seccion/seccion';
import { MenuComponent } from '../menu/menu.component';
import { QuillModule } from 'ngx-quill';
import { Subscription } from 'rxjs';
import { AlertService } from '../alert.service';
import { ConfirmService } from '../confirm.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  imports: [ReactiveFormsModule, QuillModule, CommonModule]
})
export class EditorComponent implements OnInit {

  @Output() ocultarMenu = new EventEmitter<boolean>();

  toolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ];
  
  docForm: FormGroup;
  secForm: FormGroup;
  editSecForm: FormGroup;

  documento: Documento = new Documento();
  documentoBackUp: Documento = new Documento();
  docService: Documento = new Documento();
  secService: Seccion = new Seccion();
  seccionOriginal: Seccion = new Seccion();
  
  listaSecciones: Seccion[] = [];

  showInfo: boolean = false;
  mostrarDocForm: boolean = true;
  mostrarSecForm: boolean = false;
  mostrarEditarSec: boolean = false;

  idEditSec: number = 0;
  
  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder,
              private menuService: MenuComponent,
              private alertService: AlertService,
              private confirmService: ConfirmService) {
    this.docForm = this.formBuilder.group({
      nombre: ['', [Validators.required, this.nameValidator]],
      secciones: [[]]
    });
    this.secForm = this.formBuilder.group({
      nombre: ['', [Validators.required, this.nameValidator]],
      numero: [null, Validators.required],
      contenido: ['']
    });
    this.editSecForm = this.formBuilder.group({
      nombre: ['', [Validators.required, this.nameValidator]],
      numero: [null, Validators.required],
      contenido: ['']
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.emitirOcultarMenu(true);
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async crearDoc() {
    const nombre = this.docForm.value.nombre;
    const secciones = this.docForm.value.secciones;
    const userId = await Usuario.getUsuarioLogueado()?.id;

    if(nombre != '' && nombre != null) {
      let newDocumento = await this.docService.crearDocumento(nombre, secciones, userId, true);
      if (newDocumento === 'OK') {
        this.mostrarDocForm = false;
        this.mostrarSecForm = true;
        this.alertService.showAlert('success', 'Documento creado ✔️');
        this.documento = await this.docService.buscarDocumentoPorNombre(this.docForm.value.nombre);
        this.documentoBackUp = JSON.parse(JSON.stringify(this.documento));

      } else if(newDocumento === 'ECode03') {
        this.alertService.showAlert('danger', 'El nombre '+ nombre +' ya está en uso ❌');
      } else {
        this.alertService.showAlert('danger', 'Error: Respuesta inesperada del servidor ❌');
      }
    } else {
      this.alertService.showAlert('danger', 'El documento debe tener un nombre ❌');
    }
  }

  async modificarDoc() {
    if(this.docForm.value.nombre != '' || this.docForm.value.nombre != null) {
      await this.docService.modificarDocumento(this.documento.id, this.docForm.value.nombre, this.documento.secciones);
    } else {
      this.alertService.showAlert('danger', 'El documento debe tener un nombre ❌');
    }
  }

  async anadirSec() {
    const nombre = this.secForm.value.nombre;
    const numero = this.secForm.value.numero;
    const contenido = this.secForm.value.contenido;
    let numeroRepetido = false;

    if(nombre) {
      await this.listaSecciones.forEach(sec => {
        if(sec.numero === numero) {
          numeroRepetido = true;
        }
      });
      
      if(numeroRepetido) {
        this.alertService.showAlert('danger', 'El índice de la sección ya está en uso ❌');
      } else if(numero === null || numero === '') {
        this.alertService.showAlert('danger', 'La sección debe tener un índice ❌');
      } else {
        const respuesta = await this.secService.crearSeccion(nombre, numero, contenido, this.documento.id);
        if(respuesta.nombre) {
          this.listaSecciones.push(respuesta);
          this.ordenarSecciones();
          this.secForm.reset();
        } else if(respuesta === 'ECode04') {
          this.alertService.showAlert('danger', 'El título ya está en uso ❌');
        } else if(respuesta === 'ECode02') {
          this.alertService.showAlert('danger', 'Error: Respuesta inesperada del servidor ❌');
        }
      }
    } else {
      this.alertService.showAlert('danger', 'La sección debe tener un título ❌');
    }
  }

  async modificarSec(id: number) {
    const nombre = this.editSecForm.value.nombre;
    const numero = this.editSecForm.value.numero;
    const contenido = this.editSecForm.value.contenido;
    let numeroRepetido = false;

    if(nombre != '' && nombre != null) {
      const index = this.listaSecciones.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaSecciones.splice(index, 1);
      }
      await this.listaSecciones.forEach(sec => {
        if(sec.numero === numero) {
          numeroRepetido = true;
        }
      });
      if(numeroRepetido) {
        this.alertService.showAlert('danger', 'El índice de la sección ya está en uso ❌');
      } else {
        const respuesta = await this.secService.modificarSeccion(id, nombre, numero, contenido);
        if(respuesta.nombre) {
          this.listaSecciones.push(respuesta);
          this.ordenarSecciones();
          this.editSecForm.reset();
          this.alertService.showAlert('success', 'Sección modificada correctamente ✔️');
          this.mostrarEditarSec = false;
          this.mostrarSecForm = true;
        } else if(respuesta === 'ECode04') {
          this.alertService.showAlert('danger', 'El título ya está en uso ❌');
        } else if(respuesta === 'ECode02') {
          this.alertService.showAlert('danger', 'Error: Respuesta inesperada del servidor ❌');
        }
      }
    } else {
      this.alertService.showAlert('danger', 'La sección debe tener un título ❌');
    }
    this.ordenarSecciones();
  }

  async eliminarSec(id: number, nombre: string) {
    const confirmacion = await this.confirmService.ask('Eliminar sección', '¿Desea eliminar esta sección?: '+ nombre +', no podrá recuperarla');
    if(confirmacion) {
      this.secService.eliminarSeccion(id);
      const index = this.listaSecciones.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaSecciones.splice(index, 1);
      }
      this.alertService.showAlert('success', 'Sección eliminada ✔️');
    }
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const namePattern = /^[0-9\p{L}\s]+$/u;
    const valid = namePattern.test(control.value);
    return valid ? null : { invalidName: true };
  }

  async aplicar() {
    if(!this.secForm.value.nombre && !this.secForm.value.contenido && !this.secForm.value.numero) {
      this.continuar();
    } else {
      const confirmacion = await this.confirmService.ask('Aplicar secciones', 'Hay una sección sin añadir y no se aplicará, ¿desea continuar?');
      if(confirmacion) {
        this.continuar();
      }
    }
  }

  continuar() {
    this.docService.modificarDocumento(this.documento.id, this.docForm.value.nombre, this.listaSecciones);
    if(this.listaSecciones.length > 0) {
      this.alertService.showAlert('success', 'Secciones aplicadas ✔️');
    }
    this.emitirOcultarMenu(false);
    this.menuService.cambiarMenu('lobby');
  }

  async mostrarModificar(id: number) {

    const seccion = await this.secService.buscarSeccionPorId(id);
    setTimeout(() => {
      this.seccionOriginal = JSON.parse(JSON.stringify(seccion));
    }, 50);

    this.editSecForm.patchValue({
      nombre: seccion.nombre,
      numero: seccion.numero,
      contenido: seccion.contenido
    });
    this.mostrarSecForm = false;
    this.mostrarEditarSec = true;
    this.idEditSec = id;
  }
  
  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  ordenarSecciones() {
    this.listaSecciones.sort((sec1, sec2) => sec1.numero - sec2.numero);
  }

  async cancelarEdit() {
    if (this.editSecForm.value.nombre === this.seccionOriginal.nombre &&
        this.editSecForm.value.numero === this.seccionOriginal.numero &&
        this.editSecForm.value.contenido === this.seccionOriginal.contenido) 
    {
      this.editSecForm.reset();
      this.mostrarEditarSec = false;
      this.mostrarSecForm = true;
    } else {
      const confirmacion = await this.confirmService.ask('Cancelar modificación', 'Hay cambios sin confirmar y se perderán, ¿desea continuar?');
      if (confirmacion) {
        this.editSecForm.reset();
        this.mostrarEditarSec = false;
        this.mostrarSecForm = true;
      }
    }
  }

  async salir() {
    let seccionCambiada = false;
    this.documentoBackUp.secciones.sort((a, b) => a.numero - b.numero).forEach((seccionOriginal, index) => {
      const seccionMod = this.listaSecciones[index];
      if (seccionOriginal?.nombre !== seccionMod?.nombre ||
          seccionOriginal?.numero !== seccionMod?.numero ||
          seccionOriginal?.contenido !== seccionMod?.contenido
      ) {
        seccionCambiada = true;
      }
    });
    if (seccionCambiada === false && this.listaSecciones.length < 1 &&
        this.docForm.value.nombre === this.documentoBackUp.nombre &&
        !this.secForm.value.nombre && !this.secForm.value.numero && !this.secForm.value.contenido) 
    {
      this.confirmar();
    } else {
      const confirmacion = await this.confirmService.ask('Salir', 'Hay secciones o cambios sin aplicar y se perderán, ¿desea continuar?');
      if(confirmacion) {
        await this.docService.modificarDocumento(this.documentoBackUp.id, this.documentoBackUp.nombre, this.documentoBackUp.secciones);
        await this.listaSecciones.forEach(sec => {
          this.secService.eliminarSeccionDefinitivo(sec.id);
        });
        this.confirmar();
      }
    }
  }
  confirmar() {
    this.documentoBackUp = new Documento();
    this.docForm.reset();
    this.secForm.reset();
    this.listaSecciones = [];
    this.emitirOcultarMenu(false);
    this.menuService.cambiarMenu('lobby');
  }

  async resetSecForm() {
    const confirmacion = await this.confirmService.ask('Reiniciar sección', '¿Deseas reiniciar la sección? Se perderá todo el trabajo realizado');
    if (confirmacion) {
      this.secForm.reset();
    }
  }

  emitirOcultarMenu(valor: boolean) {
    this.ocultarMenu.emit(valor);
  }
}