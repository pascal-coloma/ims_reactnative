import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { FormCompleta } from '../types/types';

export const generatePDF = async (data: FormCompleta) => {
  const nombreCompleto = [
    data.primerNombre,
    data.segundoNombre,
    data.apellidoPaterno,
    data.apellidoMaterno,
  ]
    .filter(Boolean)
    .join(' ');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }

        h1 { font-size: 22px; margin-bottom: 4px; }
        .subtitle { font-size: 13px; color: #666; margin-bottom: 32px; }

        .section { margin-bottom: 24px; }
        .section-title {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 6px;
          margin-bottom: 12px;
        }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field label {
          font-size: 11px;
          color: #888;
          display: block;
          margin-bottom: 2px;
        }
        .field span { font-size: 14px; font-weight: 500; }

        .full { grid-column: 1 / -1; }

        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: bold;
        }
        .badge-rojo { background: #fee2e2; color: #b91c1c; }
        .badge-amarillo { background: #fef9c3; color: #854d0e; }
        .badge-verde { background: #dcfce7; color: #15803d; }

        .equipo-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .equipo-item {
          background: #f1f5f9;
          border-radius: 4px;
          padding: 3px 10px;
          font-size: 13px;
        }

        .obs-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          min-height: 60px;
        }
      </style>
    </head>
    <body>

      <h1>Ficha de Emergencia</h1>
      <p class="subtitle">Unidad: ${data.unidad} &nbsp;|&nbsp; Estado: ${data.estadoUnidad}</p>

      <div class="section">
        <div class="section-title">Datos del Paciente</div>
        <div class="grid">
          <div class="field full">
            <label>Nombre completo</label>
            <span>${nombreCompleto}</span>
          </div>
          <div class="field">
            <label>RUT</label>
            <span>${data.rut}</span>
          </div>
          <div class="field">
            <label>Edad</label>
            <span>${data.edad} años</span>
          </div>
          <div class="field">
            <label>Teléfono</label>
            <span>${data.telefono}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Traslado</div>
        <div class="grid">
          <div class="field">
            <label>Origen</label>
            <span>${data.direccionOrigen}</span>
          </div>
          <div class="field">
            <label>Destino</label>
            <span>${data.direccionDestino}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Emergencia</div>
        <div class="grid">
          <div class="field">
            <label>Tipo</label>
            <span>${data.tipoEmergencia}</span>
          </div>
          <div class="field">
            <label>Prioridad</label>
            <span class="badge badge-${data.prioridad.toLowerCase()}">${data.prioridad}</span>
          </div>
          <div class="field full">
            <label>Equipo asignado</label>
            <div class="equipo-list">
              ${data.equipoAsignado.map((e) => `<span class="equipo-item">${e}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Observaciones</div>
        <div class="obs-box">${data.observaciones ?? 'Sin observaciones.'}</div>
      </div>

    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
};
