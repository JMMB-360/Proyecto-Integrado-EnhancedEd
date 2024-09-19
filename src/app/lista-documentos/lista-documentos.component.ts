import { Component, OnInit } from '@angular/core';
import { Documento } from '../entities/documento/documento';
import { Usuario } from '../entities/usuario/usuario';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Seccion } from '../entities/seccion/seccion';
import { PdfService } from '../pdf-service.service';

@Component({
  selector: 'app-lista-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lista-documentos.component.html',
  styleUrl: './lista-documentos.component.css'
})
export class ListaDocumentosComponent implements OnInit {

  docForm: FormGroup;
  secForm: FormGroup;
  editSecForm: FormGroup;

  documentoMod: Documento = new Documento();
  listaDocumentos: Documento[] = [];
  listaSecciones: Seccion[] = [];
  docService: Documento = new Documento();
  userService: Usuario = new Usuario();
  secService: Seccion = new Seccion();

  idEditDoc: number = 0;
  idEditSec: number = 0;

  mostrarLista: boolean = true;
  mostrarModificarForm: boolean = false;
  mostrarModificarSecForm: boolean = false;
  recordatorio: boolean = false;

  constructor(private formBuilder: FormBuilder, private pdfService: PdfService) {
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
  }

  async ngOnInit() {
    const usaurio = await Usuario.getUsuarioLogueado() ?? new Usuario();
    const documentos = await this.docService.buscarDocumentosPorDni(usaurio.dni);
    this.listaDocumentos = documentos;
  }

  async generatePdf(nombre: string) {
    const documento = await this.docService.buscarDocumentoPorNombre(nombre);
    this.pdfService.generatePdf(documento);
  }

  async modificarDoc() {
    if(this.docForm.value.nombre != '' || this.docForm.value.nombre != null) {
      await this.docService.modificarDocumento(this.documentoMod.id, this.docForm.value.nombre, this.documentoMod.secciones);
      const index = this.listaDocumentos.findIndex(doc => doc.id === this.documentoMod.id);
      if (index !== -1) {
        this.listaDocumentos[index].nombre = this.docForm.value.nombre;
      }
      alert('Nombre actualizado ✔️​');
    } else {
      alert('El documento debe tener un nombre ❌');
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
        alert('El número de la sección ya está en uso ❌');
      } else if(numero === null || numero === '') {
        alert('La sección debe tener un número ❌');
      } else {
        this.listaSecciones.push(await this.secService.crearSeccion(nombre, numero, contenido, this.documentoMod.id));
        this.ordenarSecciones();
        this.recordatorio = true;
        alert('Sección añadida ✔️​');
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
        this.mostrarModificarSecForm = false;
        this.mostrarModificarForm = true;
      }
    } else {
      alert('La sección debe tener un título ❌');
    }
    this.ordenarSecciones();
  }

  eliminarDoc(id: number, nombre: string) {
    if(window.confirm("¿Desea eliminar este documento?: "+ nombre)) {
      this.docService.eliminarDocumento(id);
      const index = this.listaDocumentos.findIndex(sec => sec.id === id);
      if (index !== -1) {
        this.listaDocumentos.splice(index, 1);
      }
      alert('Documento eliminado ✔️​');
    }
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

  aplicarCambios() {
    // if(this.listaSecciones[0] != null) {
      
    // } else {
    //   alert('No hay ninguna sección añadida ❌');
    // }
    this.docService.modificarDocumento(this.documentoMod.id, this.docForm.value.nombre, this.listaSecciones);
    // this.recordatorio = false;
    this.modificarDoc();
    alert('Cambios aplicados ✔️​');
    this.docForm.reset();
    this.secForm.reset();
    this.listaSecciones = [];
    this.documentoMod = new Documento();
    this.mostrarModificarForm = false;
    this.mostrarLista = true;
  }

  async mostrarModificar(id: number, nombre: string) {

    this.documentoMod = await this.docService.buscarDocumentoPorNombre(nombre);

    this.docForm.patchValue({
      nombre: this.documentoMod.nombre
    });
    this.listaSecciones = this.documentoMod.secciones;
    this.mostrarLista = false;
    this.mostrarModificarForm = true;
    this.idEditDoc = id;
  }

  async mostrarModificarSec(id: number) {

    const seccion = await this.secService.buscarSeccionPorId(id);

    this.editSecForm.patchValue({
      nombre: seccion.nombre,
      numero: seccion.numero,
      contenido: seccion.contenido
    });
    this.mostrarModificarForm = false;
    this.mostrarModificarSecForm = true;
    this.idEditSec = id;
  }

  ordenarSecciones() {
    this.listaSecciones.sort((sec1, sec2) => sec1.numero - sec2.numero);
  }

  cancelarSecEdit() {
    this.editSecForm.reset();
    this.mostrarModificarSecForm = false;
    this.mostrarModificarForm = true;
  }

  resetSecForm() {this.secForm.reset();}
}
