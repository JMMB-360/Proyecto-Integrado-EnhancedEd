import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../entities/usuario/usuario';
import { Documento } from '../entities/documento/documento';
import { Seccion } from '../entities/seccion/seccion';
import { MenuComponent } from '../menu/menu.component';
import { QuillModule } from 'ngx-quill';
import { Subscription } from 'rxjs';

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
              private menuService: MenuComponent) {
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
      if (newDocumento) {
        this.mostrarDocForm = false;
        this.mostrarSecForm = true;
        this.documento = await this.docService.buscarDocumentoPorNombre(this.docForm.value.nombre);
        this.documentoBackUp = JSON.parse(JSON.stringify(this.documento));
        this.cambios = false;
        
        this.docForm.valueChanges.subscribe(() => {
          this.cambios = true;
        });
      }
    } else {
      alert('El documento debe tener un nombre ❌');
    }
  }

  async modificarDoc() {
    if(this.docForm.value.nombre != '' || this.docForm.value.nombre != null) {
      await this.docService.modificarDocumento(this.documento.id, this.docForm.value.nombre, this.documento.secciones);
    } else {
      alert('El documento debe tener un nombre ❌');
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
        alert('El número de la sección ya está en uso ❌');
      } else if(numero === null || numero === '') {
        alert('La sección debe tener un número ❌');
      } else {
        this.listaSecciones.push(await this.secService.crearSeccion(nombre, numero, contenido, this.documento.id));
        this.ordenarSecciones();
        this.secForm.reset();
      }
    } else {
      alert('La sección debe tener un título ❌');
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
        alert('El número de la sección ya está en uso ❌');
      } else {
        this.listaSecciones.push(await this.secService.modificarSeccion(id, nombre, numero, contenido));
        this.ordenarSecciones();
        this.editSecForm.reset();
        this.mostrarEditarSec = false;
        this.mostrarSecForm = true;
      }
    } else {
      alert('La sección debe tener un título ❌');
    }
    this.ordenarSecciones();
  }

  async eliminarSec(id: number, nombre: string) {
    if(window.confirm("¿Desea eliminar esta sección?: "+ nombre)) {
      this.secService.eliminarSeccion(id);
      const index = this.listaSecciones.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaSecciones.splice(index, 1);
      }
      alert('Sección eliminada ✔️​');
    }
  }

  aplicar() {
    this.docService.modificarDocumento(this.documento.id, this.docForm.value.nombre, this.listaSecciones);
    alert('Secciones aplicadas ✔️​');
    this.emitirOcultarMenu(false);
    this.menuService.cambiarMenu('buscarDocumentos');
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

  cancelarEdit() {
    if (this.cambios) {
      if (window.confirm("Hay cambios sin confirmar, ¿desea continuar?")) {
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
      if(window.confirm("Hay cambios sin confirmar, ¿desea continuar?")) {
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
    this.menuService.cambiarMenu('buscarDocumentos');
  }

  resetSecForm() {
    this.secForm.reset();
  }

  emitirOcultarMenu(valor: boolean) {
    this.ocultarMenu.emit(valor);
  }
}