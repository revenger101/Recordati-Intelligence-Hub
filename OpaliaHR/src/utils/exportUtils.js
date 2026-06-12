import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId, filename = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const buttons = element.querySelectorAll('button, .header-actions, .filter-group-premium');
    buttons.forEach(b => b.style.display = 'none');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);

    buttons.forEach(b => b.style.display = 'flex');
  } catch (err) {
    console.error('PDF Export Error:', err);
  }
};

export const exportMasterPDF = async (containerId, filename = 'OpaliaHR_Full_Report.pdf') => {
   const container = document.getElementById(containerId);
   if (!container) return;

   const pdf = new jsPDF('p', 'mm', 'a4');
   const elements = container.children;
   const pdfWidth = pdf.internal.pageSize.getWidth();
   const pdfHeight = pdf.internal.pageSize.getHeight();

   for (let i = 0; i < elements.length; i++) {
      const canvas = await html2canvas(elements[i], {
         scale: 2,
         useCORS: true,
         backgroundColor: '#0f172a',
         logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      if (i > 0) pdf.addPage();
      
      // Calculate aspect ratio to fit A4
      const imgWidth = pdfWidth - 20; // 10mm margin
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
      
      // Add page number
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`Page ${i + 1} / ${elements.length} - Nexus AI Generated Report`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });
   }

   pdf.save(filename);
};
