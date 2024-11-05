import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../entities/usuario/usuario';
import { Documento } from '../entities/documento/documento';
import { Seccion } from '../entities/seccion/seccion';
import { MenuComponent } from '../menu/menu.component';
import { QuillModule } from 'ngx-quill';
import { Subscription } from 'rxjs';
import { AlertService } from '../alert.service';
import { ConfirmService } from '../confirm.service';

@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  imports: [ReactiveFormsModule, QuillModule]
})
export class EditorComponent implements OnInit {

  @Output() ocultarMenu = new EventEmitter<boolean>();

  toolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
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
  
  listaSecciones: Seccion[] = [];

  mostrarDocForm: boolean = true;
  mostrarSecForm: boolean = false;
  mostrarEditarSec: boolean = false;
  cambiosDeAntes: boolean = false;
  cambios: boolean = false;

  idEditSec: number = 0;
  
  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder,
              private menuService: MenuComponent,
              private alertService: AlertService,
              private confirmService: ConfirmService) {
    this.docForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      secciones: [[]]
    });
    this.secForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      numero: [null, Validators.required],
      contenido: ['']
    });
    this.editSecForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      numero: [null, Validators.required],
      contenido: ['']
    });
    setTimeout(() => {
      this.subscriptions.add(
        this.secForm.valueChanges.subscribe(() => {
          this.cambios = true;
        })
      );
      this.subscriptions.add(
        this.editSecForm.valueChanges.subscribe(() => {
          this.cambios = true;
        })
      );
    }, 1000);
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
        this.cambios = false;
        
        this.docForm.valueChanges.subscribe(() => {
          this.cambios = true;
        });
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

    if(nombre != '' || nombre != null) {
      await this.listaSecciones.forEach(sec => {
        if(sec.numero === numero) {
          numeroRepetido = true;
        }
      });
      
      if(numeroRepetido) {
        this.alertService.showAlert('danger', 'El número de la sección ya está en uso ❌');
      } else if(numero === null || numero === '') {
        this.alertService.showAlert('danger', 'La sección debe tener un número ❌');
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
        this.alertService.showAlert('danger', 'El número de la sección ya está en uso ❌');
      } else {
        const respuesta = await this.secService.modificarSeccion(id, nombre, numero, contenido);
        if(respuesta.nombre) {
          this.listaSecciones.push(respuesta);
          this.ordenarSecciones();
          this.editSecForm.reset();
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
    const confirmacion = await this.confirmService.ask('Eliminar sección', '¿Desea eliminar esta sección?: '+ nombre);
    if(confirmacion) {
      this.secService.eliminarSeccion(id);
      const index = this.listaSecciones.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaSecciones.splice(index, 1);
      }
      this.alertService.showAlert('success', 'Sección eliminada ✔️');
    }
  }

  aplicar() {
    this.docService.modificarDocumento(this.documento.id, this.docForm.value.nombre, this.listaSecciones);
    this.alertService.showAlert('success', 'Secciones aplicadas ✔️');
    this.emitirOcultarMenu(false);
    this.menuService.cambiarMenu('lobby');
  }

  async mostrarModificar(id: number) {

    const seccion = await this.secService.buscarSeccionPorId(id);

    if (this.cambios) {
      this.cambiosDeAntes = true;
    }

    this.editSecForm.patchValue({
      nombre: seccion.nombre,
      numero: seccion.numero,
      contenido: seccion.contenido
    });
    this.mostrarSecForm = false;
    this.mostrarEditarSec = true;
    this.idEditSec = id;
    setTimeout(() => {
      this.cambios = false;
    }, 10);
  }

  ordenarSecciones() {
    this.listaSecciones.sort((sec1, sec2) => sec1.numero - sec2.numero);
  }

  async cancelarEdit() {
    if (this.cambios) {
      const confirmacion = await this.confirmService.ask('Cancelar modificación', 'Hay cambios sin confirmar y se perderán, ¿desea continuar?');
      if (confirmacion) {
        this.editSecForm.reset();
        this.mostrarEditarSec = false;
        this.mostrarSecForm = true;
      }
    } else {
      this.editSecForm.reset();
      this.mostrarEditarSec = false;
      this.mostrarSecForm = true;
    }
    if (!this.cambiosDeAntes) {
      setTimeout(() => {
        this.cambios = false;
      }, 10);
    }
  }

  async salir() {
    if(this.cambios === true) {
      const confirmacion = await this.confirmService.ask('Salir', 'Hay cambios sin confirmar y se perderán, ¿desea continuar?');
      if(confirmacion) {
        await this.docService.modificarDocumento(this.documentoBackUp.id, this.documentoBackUp.nombre, this.documentoBackUp.secciones);
        await this.listaSecciones.forEach(sec => {
          this.secService.eliminarSeccionDefinitivo(sec.id);
        });
        this.confirmar();
      }
    } else {
      this.confirmar();
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

  resetSecForm() {
    this.secForm.reset();
  }

  emitirOcultarMenu(valor: boolean) {
    this.ocultarMenu.emit(valor);
  }
}