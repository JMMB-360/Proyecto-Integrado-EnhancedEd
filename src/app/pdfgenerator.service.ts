import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { Documento } from './entities/documento/documento';

@Injectable({
  providedIn: 'root'
})
export class PDFgeneratorService {

  constructor() { }

  generarPDF(documento: Documento): void {
    const contenidoHTML = this.crearContenidoHTML(documento);

    const options = {
      margin: 1,
      filename: documento.nombre,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(contenidoHTML).set(options).save();
  }

  private crearContenidoHTML(documento: Documento): HTMLElement {
    const contenedor = document.createElement('div');
  
    const titulo = document.createElement('h1');
    titulo.textContent = `${documento.nombre}`;
    titulo.style.pageBreakAfter = 'always';
    contenedor.appendChild(titulo);
    
    documento.secciones.forEach(seccion => {
      const seccionDiv = document.createElement('div');
      const tituloSeccion = document.createElement('h2');
      tituloSeccion.textContent = `${seccion.nombre}`;
      seccionDiv.appendChild(tituloSeccion);
      
      const contenidoSeccion = document.createElement('div');
      contenidoSeccion.innerHTML = seccion.contenido;
      contenidoSeccion.style.whiteSpace = 'pre-wrap';
      contenidoSeccion.style.wordBreak = 'break-word';
      contenidoSeccion.style.overflowWrap = 'break-word';
      
      const imagenes = contenidoSeccion.querySelectorAll('img');
      imagenes.forEach((img: HTMLImageElement) => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.classList.add('avoid-break');
      });

      seccionDiv.appendChild(contenidoSeccion);
      contenedor.appendChild(seccionDiv);
    });

    return contenedor;
  }
}
