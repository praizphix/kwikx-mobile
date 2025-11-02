import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ReceiptData {
  transactionId: string;
  type: 'deposit' | 'withdrawal' | 'exchange' | 'transfer';
  amount: number;
  currency: string;
  date: string;
  status: string;
  senderName?: string;
  senderAccount?: string;
  recipientName?: string;
  recipientAccount?: string;
  fee?: number;
  reference?: string;
}

export const generateReceiptHTML = (data: ReceiptData): string => {
  return `
    <div style="width: 400px; padding: 30px; background: white; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin: 0;">KwikX</h1>
        <p style="color: #666; margin: 5px 0;">Transaction Receipt</p>
      </div>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 20px 0; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Transaction ID:</span>
          <span style="font-weight: bold;">${data.transactionId}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Type:</span>
          <span style="font-weight: bold; text-transform: capitalize;">${data.type}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Amount:</span>
          <span style="font-weight: bold; font-size: 20px; color: #1e40af;">${data.amount} ${data.currency}</span>
        </div>
        ${data.fee ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Fee:</span>
          <span>${data.fee} ${data.currency}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Date:</span>
          <span>${new Date(data.date).toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Status:</span>
          <span style="padding: 4px 12px; border-radius: 12px; background: ${data.status === 'completed' ? '#10b981' : '#f59e0b'}; color: white; text-transform: capitalize;">${data.status}</span>
        </div>
        ${data.reference ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Reference:</span>
          <span>${data.reference}</span>
        </div>
        ` : ''}
      </div>

      ${data.senderName || data.recipientName ? `
      <div style="margin-top: 20px;">
        ${data.senderName ? `
        <div style="margin-bottom: 15px;">
          <p style="color: #666; margin: 0 0 5px 0;">From:</p>
          <p style="margin: 0; font-weight: bold;">${data.senderName}</p>
          ${data.senderAccount ? `<p style="margin: 0; color: #666; font-size: 14px;">${data.senderAccount}</p>` : ''}
        </div>
        ` : ''}
        ${data.recipientName ? `
        <div style="margin-bottom: 15px;">
          <p style="color: #666; margin: 0 0 5px 0;">To:</p>
          <p style="margin: 0; font-weight: bold;">${data.recipientName}</p>
          ${data.recipientAccount ? `<p style="margin: 0; color: #666; font-size: 14px;">${data.recipientAccount}</p>` : ''}
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
        <p>Thank you for using KwikX</p>
        <p>For support, contact: support@kwikx.com</p>
      </div>
    </div>
  `;
};

export const downloadReceiptAsPDF = async (data: ReceiptData): Promise<void> => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = generateReceiptHTML(data);
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`receipt-${data.transactionId}.pdf`);
  } finally {
    document.body.removeChild(tempDiv);
  }
};

export const printReceipt = async (data: ReceiptData): Promise<void> => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${data.transactionId}</title>
        <style>
          body { margin: 0; padding: 20px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${generateReceiptHTML(data)}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

export const generateReceipt = downloadReceiptAsPDF;

export const generateReceiptFilename = (transactionId: string): string => {
  return `receipt-${transactionId}.pdf`;
};
