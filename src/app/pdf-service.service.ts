import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export interface Seccion {
  nombre: string;
  numero: number;
  contenido: string;
}

export interface Documento {
  nombre: string;
  secciones: Seccion[];
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generatePdf(documento: Documento) {
    const docDefinition = this.createDocDefinition(documento);
    pdfMake.createPdf(docDefinition).download(`${documento.nombre}.pdf`);
  }

  private createDocDefinition(documento: Documento): any {
    // Ordenar las secciones por su número
    const seccionesOrdenadas = documento.secciones.sort((a, b) => a.numero - b.numero);
  
    // Crear el índice con números y enlaces a las páginas
    const indice = seccionesOrdenadas.map((seccion, index) => {
      return { text: `${seccion.nombre}`, linkToPage: index + 3, style: 'indexItem' };
    });
  
    // Crear el contenido de las secciones
    const secciones = seccionesOrdenadas.map(seccion => {
      return [
        { text: `${seccion.numero}. ${seccion.nombre}`, style: 'sectionHeader', pageBreak: 'before' },
        { text: seccion.contenido }
      ];
    });
  
    return {
      content: [
        { text: documento.nombre, style: 'header', pageBreak: 'after' },
        { text: 'Índice', style: 'subheader' },
        { ol: indice, style: 'indexList' },
        ...secciones.flat()
      ],
      styles: {
        header: {
          fontSize: 38,
          bold: true,
          margin: [0, 0, 0, 20]
        },
        subheader: {
          fontSize: 24,
          bold: true,
          margin: [0, 10, 0, 10]
        },
        sectionHeader: {
          fontSize: 18,
          bold: true,
          margin: [0, 10, 0, 10]
        },
        indexList: {
          fontSize: 14,
          margin: [0, 0, 0, 10]
        },
        indexItem: {
          margin: [0, 0, 0, 5]
        }
      }
    };
  }
}