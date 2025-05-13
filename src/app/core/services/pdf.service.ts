import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private async agregarEncabezado(doc: jsPDF): Promise<number> {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;

    const logoPath = 'assets/logo.png';
    const img = new Image();
    
    return new Promise<number>((resolve) => {
      img.onload = () => {
        const imgWidth = 30;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, 'PNG', margin, margin, imgWidth, imgHeight);

        doc.setFontSize(14);
        doc.text('CLÍNICA CARDIOVASCULAR', margin + imgWidth + 10, margin + 7);
        
        doc.setFontSize(10);
        doc.text('Dirección: Av. Principal #123, Ciudad', margin + imgWidth + 10, margin + 14);
        doc.text('Teléfonos: (555) 123-4567 / (555) 765-4321', margin + imgWidth + 10, margin + 21);
        doc.text('Email: info@clinicacardiovascular.com', margin + imgWidth + 10, margin + 28);

        doc.setLineWidth(0.5);
        doc.line(margin, margin + imgHeight + 10, pageWidth - margin, margin + imgHeight + 10);

        resolve(margin + imgHeight + 20);
      };
      img.src = logoPath;
    });
  }

  async generarRecetaMedica(evolucion: any, paciente: any): Promise<void> {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    const startY: number = await this.agregarEncabezado(doc);

    // Título
    doc.setFontSize(18);
    doc.text('RECETA MÉDICA', pageWidth/2, startY + 10, { align: 'center' });

    // Datos del paciente
    doc.setFontSize(12);
    let currentY = startY + 25;
    doc.text(`Paciente: ${paciente.primer_nombre} ${paciente.apellido_paterno}`, margin, currentY);
    doc.text(`Cédula: ${paciente.cedula}`, margin, currentY + 7);
    doc.text(`Fecha: ${new Date(evolucion.fecha).toLocaleDateString()}`, margin, currentY + 14);
    currentY += 25;

    // Diagnósticos
    if (evolucion.diagnosticos?.length > 0) {
        doc.text('Diagnósticos:', margin, currentY);
        currentY += 8;
        evolucion.diagnosticos.forEach((diagnostico: any) => {
            const diagnosticoText = `• ${diagnostico.cie.NOMBRE}`;
            const lines = doc.splitTextToSize(diagnosticoText, (pageWidth/2) - (margin * 2) - 5);
            doc.text(lines, margin + 5, currentY);
            currentY += (lines.length * 7);
        });
    }

    // Línea divisoria vertical
    const middleX = pageWidth / 2;
    currentY += 10;
    doc.line(middleX, currentY, middleX, pageHeight - margin);

    // Prescripciones e Indicaciones
    doc.setFontSize(14);
    doc.text('Prescripción', margin, currentY + 10);
    doc.text('Indicaciones', middleX + margin, currentY + 10);
    
    if (evolucion.prescripciones?.length > 0) {
        // Tabla de medicamentos
        const medicamentosData = evolucion.prescripciones.map((p: any) => [
            p.nombre_generico,
            p.concentracion,
            p.forma_farmaceutica,
            p.cantidad
        ]);

        // @ts-ignore
        doc.autoTable({
            startY: currentY + 15,
            head: [['Medicamento', 'Concentración', 'Forma']],
            body: medicamentosData,
            margin: { left: margin },
            tableWidth: (pageWidth/2) - (margin * 2),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });

        // Tabla de indicaciones
        const indicacionesData = evolucion.prescripciones.map((p: any) => [
            p.nombre_generico,
            p.dosis,
            p.frecuencia,
            p.via_administracion,
            p.duracion_tratamiento,
            p.indicaciones_adicionales
        ]);

        // @ts-ignore
        doc.autoTable({
            startY: currentY + 15,
            head: [['Medicamento', 'Dosis', 'Frecuencia', 'Vía', 'Duración', 'Indicaciones']],
            body: indicacionesData,
            margin: { left: middleX + margin },
            tableWidth: (pageWidth/2) - (margin * 2),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });
    }


    // Firma del médico
    doc.setFontSize(12);
    doc.text('_____________________', pageWidth - 60, pageHeight - 15, { align: 'center' });
    doc.text('Firma del Médico', pageWidth - 60, pageHeight - 10, { align: 'center' });

    doc.save(`receta_${paciente.cedula}_${new Date().getTime()}.pdf`);
  }
  async generarCertificadoMedico(evolucion: any, paciente: any, datos: any): Promise<void> {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Agregar encabezado y obtener posición Y inicial
    const startY: number = await this.agregarEncabezado(doc);

    // Título
    doc.setFontSize(16);
    doc.text('CERTIFICADO MÉDICO', pageWidth / 2, startY + 10, { align: 'center' });

    // Fecha y datos del paciente
    let currentY = startY + 25;
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, currentY);
    currentY += 10;

    doc.text(`Paciente: ${paciente.primer_nombre} ${paciente.apellido_paterno}`, margin, currentY);
    currentY += 8;
    doc.text(`Cédula: ${paciente.cedula}`, margin, currentY);
    currentY += 8;


    // Diagnósticos
    if (evolucion.diagnosticos?.length > 0) {
        doc.text('Diagnóstico(s):', margin, currentY);
        currentY += 8;

        evolucion.diagnosticos.forEach((diagnostico: any) => {
            const diagnosticoText = `• ${diagnostico.cie.NOMBRE}`;
            const lines = doc.splitTextToSize(diagnosticoText, pageWidth - (margin * 2) - 5);
            doc.text(lines, margin + 5, currentY);
            currentY += (lines.length * 7);
        });
        currentY += 7;
    }

    // Motivo del reposo
    doc.text('Por medio de la presente certifico que el paciente:', margin, currentY);
    currentY += 10;

    const motivo = `Presenta ${evolucion.enfermedad_actual} que requiere un período de reposo para su adecuada recuperación. ` +
        `Se indica ${datos.tipoReposo === 'absoluto' ? 'reposo absoluto' : 'reposo relativo'} durante el período señalado.`;
    
    const motivoLines = doc.splitTextToSize(motivo, pageWidth - (margin * 2));
    doc.text(motivoLines, margin, currentY);
    currentY += (motivoLines.length * 7) + 15;

    // Duración del reposo
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + datos.diasReposo);

    doc.text('Tiempo de Reposo:', margin, currentY);
    currentY += 8;
    doc.text(`Desde: ${fechaInicio.toLocaleDateString()}`, margin + 5, currentY);
    currentY += 8;
    doc.text(`Hasta: ${fechaFin.toLocaleDateString()}`, margin + 5, currentY);
    currentY += 8;
    doc.text(`Total: ${datos.diasReposo} días`, margin + 5, currentY);
    currentY += 15;

    // Observaciones
    if (datos.observaciones) {
        doc.text('Observaciones:', margin, currentY);
        currentY += 8;
        const obsLines = doc.splitTextToSize(datos.observaciones, pageWidth - (margin * 2));
        doc.text(obsLines, margin, currentY);
        currentY += (obsLines.length * 7) + 10;
    }

    // Firma y sello
    currentY = pageHeight - 60;
    doc.setFontSize(12);
    
    // Línea de firma
    const firmaX = pageWidth / 2;
    doc.line(firmaX - 30, currentY, firmaX + 30, currentY);
    
    // Texto de firma
    doc.text('Firma y Sello del Médico', firmaX, currentY + 10, { align: 'center' });

    // Guardar PDF
    doc.save(`certificado_${paciente.cedula}_${new Date().getTime()}.pdf`);
}

private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    
    return edad;
}
}