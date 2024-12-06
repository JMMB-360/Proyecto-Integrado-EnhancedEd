import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { Documento } from './entities/documento/documento';

@Injectable({
  providedIn: 'root'
})
export class PDFgeneratorService {

  options: any;

  constructor() { }

  generarPDF(documento: Documento): void {

    this.options = {
      margin: [20, 20, 20, 20],
      autoPaging: 'text',
      filename: documento.nombre,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        allowTaint: true,
        letterRendering: true,
        logging: false,
        scale: 2,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    const contenidoHTML = this.crearContenidoHTML(documento);

    html2pdf()
      .from(contenidoHTML)
      .set(this.options)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(10);
          pdf.text(
            `Página ${i} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      })
      .save();
  }

  private crearContenidoHTML(documento: Documento): HTMLElement {
    const contenedor = document.createElement('div');
  
      // Div Portada
      const portadaDiv = document.createElement('div');
      portadaDiv.style.pageBreakAfter = 'always';
      portadaDiv.style.width = '100%';
      portadaDiv.style.margin = '0';
      portadaDiv.style.padding = '0';
      portadaDiv.style.textAlign = 'center';
      portadaDiv.style.height = '100vh';
      portadaDiv.style.maxHeight = '100vh';

      // Título
      const titulo = document.createElement('h1');
      titulo.textContent = `${documento.nombre}`;
      titulo.style.fontFamily = 'Arial, sans-serif';
      titulo.style.textAlign = 'left';
      titulo.style.fontSize = '4rem';
      titulo.style.color = '#333';
      titulo.style.margin = '0';
      titulo.style.marginBottom = '20%';
      portadaDiv.appendChild(titulo);

      // Logo
      const logo = document.createElement('img');
      logo.src = '../assets/IESA-Logo.png';
      logo.style.width = '50%';
      portadaDiv.appendChild(logo);

    contenedor.appendChild(portadaDiv);
    
      // Secciones
      documento.secciones.forEach(seccion => {
        const seccionDiv = document.createElement('div');
        seccionDiv.style.marginBottom = '60px';
        
        // Título sección
        const tituloSeccion = document.createElement('h2');
        tituloSeccion.textContent = seccion.nombre;
        tituloSeccion.style.fontFamily = 'Arial, sans-serif';
        tituloSeccion.style.fontSize = '2.5rem';
        tituloSeccion.style.color = '#444';
        tituloSeccion.style.borderBottom = '2px solid #ddd';
        tituloSeccion.style.marginBottom = '10px';
        seccionDiv.appendChild(tituloSeccion);
        
        // Contenido sección
        const contenidoSeccion = document.createElement('div');
        contenidoSeccion.innerHTML = seccion.contenido;
        contenidoSeccion.style.lineHeight = '1.6';
        contenidoSeccion.style.whiteSpace = 'pre-wrap';
        contenidoSeccion.style.wordBreak = 'break-word';
        contenidoSeccion.style.overflowWrap = 'break-word';
        contenidoSeccion.style.pageBreakInside = 'avoid';
        
        // Estilos para todas las imágenes
        const imagenes = contenidoSeccion.querySelectorAll('img');
        imagenes.forEach((img: HTMLImageElement) => {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.pageBreakInside = 'avoid';
        });

        seccionDiv.appendChild(contenidoSeccion);
        contenedor.appendChild(seccionDiv);
      });

    return contenedor;
  }
}
