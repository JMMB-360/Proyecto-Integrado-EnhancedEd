import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../entities/usuario/usuario';
import { Documento } from '../entities/documento/documento';
import { Seccion } from '../entities/seccion/seccion';

@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class EditorComponent {
  
  docForm: FormGroup;
  secForm: FormGroup;
  editSecForm: FormGroup;

  documento: Documento = new Documento();
  docService: Documento = new Documento();
  secService: Seccion = new Seccion();
  listaSecciones: Seccion[] = [];
  mostrarDocForm: boolean = true;
  mostrarSecForm: boolean = false;
  mostrarEditarSec: boolean = false;
  idEditSec: number = 0;

  constructor(private formBuilder: FormBuilder) {
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

  async guardarDoc() {
    const nombre = this.docForm.value.nombre;
    const secciones = this.docForm.value.secciones;
    const userId = await Usuario.getUsuarioLogueado()?.id;

    if(nombre != '' && nombre != null) {
      this.docService.crearDocumento(nombre, secciones, userId);
      alert('Documento guardado ✔️​');
      this.mostrarDocForm = false;
      this.mostrarSecForm = true;
      this.documento = await this.docService.buscarDocumentoPorNombre(this.docForm.value.nombre);
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

  aplicarSecs() {
    if(this.listaSecciones[0] != null) {
      this.docService.modificarDocumento(this.documento.id, this.documento.nombre, this.listaSecciones);
      this.listaSecciones = [];
      this.docForm.reset();
      this.secForm.reset();
      this.documento = new Documento();
      this.mostrarSecForm = false;
      this.mostrarDocForm = true;
      alert('Secciones aplicadas ✔️​');
    } else {
      alert('No hay ninguna sección añadida ❌');
    }
  }

  async mostrarModificar(id: number) {

    const seccion = await this.secService.buscarSeccionPorId(id);

    this.editSecForm.patchValue({
      nombre: seccion.nombre,
      numero: seccion.numero,
      contenido: seccion.contenido
    });
    this.mostrarSecForm = false;
    this.mostrarEditarSec = true;
    this.idEditSec = id;
  }

  ordenarSecciones() {
    this.listaSecciones.sort((sec1, sec2) => sec1.numero - sec2.numero);
  }

  cancelarEdit() {
    this.editSecForm.reset();
    this.mostrarEditarSec = false;
    this.mostrarSecForm = true;
  }

  resetSecForm() {this.secForm.reset();}
}