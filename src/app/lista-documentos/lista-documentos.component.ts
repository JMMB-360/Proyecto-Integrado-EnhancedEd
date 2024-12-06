import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Documento } from '../entities/documento/documento';
import { Usuario } from '../entities/usuario/usuario';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Seccion } from '../entities/seccion/seccion';
import { PDFgeneratorService } from '../pdfgenerator.service';
import { QuillModule } from 'ngx-quill';
import { Subscription } from 'rxjs';
import { AlertService } from '../alert.service';
import { ConfirmService } from '../confirm.service';

@Component({
  selector: 'app-lista-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QuillModule],
  templateUrl: './lista-documentos.component.html',
  styleUrl: './lista-documentos.component.css'
})
export class ListaDocumentosComponent implements OnInit {

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

  listaDocumentos: Documento[] = [];
  listaSecciones: Seccion[] = [];
  seccionesNuevas: Seccion[] = [];
  seccionesCopia: Seccion[] = [];
  seccionesEliminadas: Seccion[] = [];

  docService: Documento = new Documento();
  documentoMod: Documento = new Documento();
  documentoBackUp: Documento = new Documento();
  userService: Usuario = new Usuario();
  usuario: Usuario = new Usuario();
  secService: Seccion = new Seccion();
  seccionOriginal: Seccion = new Seccion();

  idEditDoc: number = 0;
  idEditSec: number = 0;

  showInfo: boolean = false;
  deleteSec: boolean = false;
  mostrarLista: boolean = true;
  mostrarModificarForm: boolean = false;
  mostrarModificarSecForm: boolean = false;

  nombreOriginal: string = "";
  
  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder, 
              private pdfService: PDFgeneratorService, 
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

  async ngOnInit() {
    this.usuario = await Usuario.getUsuarioLogueado() ?? new Usuario();
    this.actualizarLista();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async generatePdf(nombre: string) {
    const documento = await this.docService.buscarDocumentoPorNombre(nombre);
    documento.secciones.sort((sec1: Seccion, sec2: Seccion) => sec1.numero - sec2.numero);
    this.pdfService.generarPDF(documento);
  }

  async modificarDoc() {
    if(this.docForm.value.nombre != '' || this.docForm.value.nombre != null) {
      await this.docService.modificarDocumento(this.documentoMod.id, this.docForm.value.nombre, this.listaSecciones);
      
      const index = this.listaDocumentos.findIndex(doc => doc.id === this.documentoMod.id);
      if (index !== -1) {
        this.listaDocumentos[index].nombre = this.docForm.value.nombre;
      }
    } else {
      this.alertService.showAlert('danger', 'El documento debe tener un nombre ❌');
    }
  }

  async anadirSec() {
    const nombre = this.secForm.value.nombre;
    const numero = this.secForm.value.numero;
    const contenido = this.secForm.value.contenido;
    let numeroRepetido = false;

    if(nombre != '' && nombre != null) {
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
        const seccionNueva = await this.secService.crearSeccion(nombre, numero, contenido, this.documentoMod.id);
        if(seccionNueva.nombre) {
          this.listaSecciones.push(seccionNueva);
          this.seccionesNuevas.push(seccionNueva);
          this.ordenarSecciones();
          this.secForm.reset();
        } else if(seccionNueva === 'ECode04') {
          this.alertService.showAlert('danger', 'El título ya está en uso ❌');
        } else if(seccionNueva === 'ECode02') {
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
          this.editSecForm.reset();
          this.alertService.showAlert('success', 'Sección modificada correctamente ✔️');
          this.mostrarModificarSecForm = false;
          this.mostrarModificarForm = true;
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

  async eliminarDoc(id: number, nombre: string) {
    const confirmacion = await this.confirmService.ask('Eliminar documento', '¿Desea eliminar este documento?: '+ nombre);
    if(confirmacion) {
      this.docService.eliminarDocumento(id);
      const index = this.listaDocumentos.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaDocumentos.splice(index, 1);
      }
      this.alertService.showAlert('success', 'Documento eliminado ✔️');
    }
  }

  async eliminarSec(id: number, nombre: string) {
    const confirmacion = await this.confirmService.ask('Eliminar sección', '¿Desea eliminar esta sección?: '+ nombre +', la puede recuperar al cancelar los cambios');
    if(confirmacion) {
      const seccionAEliminar = await this.secService.buscarSeccionPorId(id);
      this.seccionesEliminadas.push(seccionAEliminar);
      const index = this.listaSecciones.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaSecciones.splice(index, 1);
      }
      this.alertService.showAlert('success', 'Sección eliminada ✔️');
      this.deleteSec = true;
    }
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const namePattern = /^[0-9\p{L}\s]+$/u;
    const valid = namePattern.test(control.value);
    return valid ? null : { invalidName: true };
  }

  async aplicarCambios() {
    if(!this.secForm.value.nombre && !this.secForm.value.contenido && !this.secForm.value.numero) {
      this.continuar();
    } else {
      const confirmacion = await this.confirmService.ask('Aplicar cambios', 'Hay una sección sin añadir y no se aplicará, ¿desea continuar?');
      if(confirmacion) {
        this.continuar();
      }
    }
  }
  async continuar() {
    if(this.deleteSec) {
      await this.seccionesEliminadas.forEach((seccionEliminada) => {
        this.secService.eliminarSeccion(seccionEliminada.id);
      });
    }
    await this.modificarDoc();
    await this.actualizarLista();
    this.alertService.showAlert('success', 'Cambios aplicados ✔️');
    this.salir();
  }

  async mostrarModificar(id: number, nombre: string) {
    this.nombreOriginal = nombre;
    this.documentoMod = await this.docService.buscarDocumentoPorNombre(nombre);
    this.documentoBackUp = JSON.parse(JSON.stringify(this.documentoMod));// Copia independiente de la BD

    this.docForm.patchValue({
      nombre: this.documentoMod.nombre
    });

    this.listaSecciones = this.documentoMod.secciones;
    this.mostrarLista = false;
    this.emitirOcultarMenu(true);
    this.mostrarModificarForm = true;
    this.idEditDoc = id;
    this.ordenarSecciones();
  }

  async mostrarModificarSec(id: number) {

    const seccion = await this.secService.buscarSeccionPorId(id);
    setTimeout(() => {
      this.seccionOriginal = JSON.parse(JSON.stringify(seccion));
    }, 50);

    this.editSecForm.patchValue({
      nombre: seccion.nombre,
      numero: seccion.numero,
      contenido: seccion.contenido
    });

    this.mostrarModificarForm = false;
    this.mostrarModificarSecForm = true;
    this.idEditSec = id;
  }

  async actualizarLista() {
    const dni = this.usuario.dni;
    try {
      const documentos: any[] = await this.docService.buscarDocumentosPorDni(dni);
    
      this.listaDocumentos = documentos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
    }
  }

  ordenarSecciones() {
    this.listaSecciones.sort((sec1, sec2) => sec1.numero - sec2.numero);
  }

  async resetSecForm() {
    const confirmacion = await this.confirmService.ask('Reiniciar sección', '¿Deseas reiniciar la sección? Se perderá todo el trabajo realizado');
    if (confirmacion) {
      this.secForm.reset();
    }
  }
  
  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  async duplicarDocumento(nombre: string) {
    const documento: Documento = await this.docService.buscarDocumentoPorNombre(nombre);
    let numCopia = 1;
    let documentoDuplicado: Documento = await this.docService.buscarDocumentoPorNombre(nombre+"_copia"+numCopia, true);

    while (documentoDuplicado) {
      numCopia++;
      documentoDuplicado = await this.docService.buscarDocumentoPorNombre(nombre+"_copia"+numCopia, true);
    }
    await this.docService.crearDocumento(nombre+"_copia"+numCopia, [], this.usuario.id);
    documentoDuplicado = await this.docService.buscarDocumentoPorNombre(nombre+"_copia"+numCopia, true);

    const numSecciones = documento.secciones.length;
    if (numSecciones > 0) {
      const promesas = documento.secciones.map(sec => {
        return this.secService.crearSeccion(sec.nombre, sec.numero, sec.contenido, documentoDuplicado.id);
      });
      const seccionesCreadas = await Promise.all(promesas);
      let seccionesDuplicadas: Seccion[] = seccionesCreadas.sort((a, b) => a.numero - b.numero);
      await this.docService.modificarDocumento(documentoDuplicado.id, documentoDuplicado.nombre, seccionesDuplicadas);
    }
    await this.actualizarLista();
  }

  async cancelarSecEdit() {
    if (this.editSecForm.value.nombre === this.seccionOriginal.nombre &&
        this.editSecForm.value.numero === this.seccionOriginal.numero &&
        this.editSecForm.value.contenido === this.seccionOriginal.contenido) 
    {
      this.editSecForm.reset();
      this.mostrarModificarSecForm = false;
      this.mostrarModificarForm = true;
    } else {
      const confirmacion = await this.confirmService.ask('Cancelar modificación', 'Hay cambios sin confirmar y se perderán, ¿desea continuar?');
      if (confirmacion) {
        this.editSecForm.reset();
        this.mostrarModificarSecForm = false;
        this.mostrarModificarForm = true;
      }
    }
  }
  
  async cancelarCambios() {
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
    if (seccionCambiada === false && this.seccionesNuevas.length < 1 &&
        this.docForm.value.nombre === this.documentoBackUp.nombre &&
        !this.secForm.value.nombre && !this.secForm.value.numero && !this.secForm.value.contenido)
    {
      this.salir();
    } else {
      const confirmacion = await this.confirmService.ask('Cancelar modificación', 'Hay cambios sin aplicar y se perderán, ¿desea continuar?');
      if(confirmacion) {
        await this.docService.modificarDocumento(this.documentoBackUp.id, this.documentoBackUp.nombre, this.documentoBackUp.secciones);
        await this.seccionesNuevas.forEach(sec => {
          this.secService.eliminarSeccionDefinitivo(sec.id);
        });
        this.salir();
      }
    }
  }

  salir() {
    this.docForm.reset();
    this.secForm.reset();
    this.listaSecciones = [];
    this.documentoMod = new Documento();
    this.documentoBackUp = new Documento();
    this.mostrarModificarForm = false;
    this.emitirOcultarMenu(false);
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.mostrarLista = true;
  }

  emitirOcultarMenu(valor: boolean) {
    setTimeout(() => {
      this.ocultarMenu.emit(valor);
    });
  }
}
