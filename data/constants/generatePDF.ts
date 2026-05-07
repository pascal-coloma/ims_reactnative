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
      <meta charset="UTF-8"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          color: #1a1a2e;
          padding: 16px;
          background: white;
        }

        /* HEADER */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 2px solid #1a3a6b;
          padding: 8px 12px;
          margin-bottom: 6px;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo-box {
          background: #1a3a6b;
          color: white;
          font-size: 18px;
          font-weight: 900;
          padding: 4px 10px;
          letter-spacing: 2px;
          border-radius: 2px;
        }
        .logo-sub {
          font-size: 8px;
          color: #1a3a6b;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header-title {
          font-size: 13px;
          font-weight: 900;
          color: #1a3a6b;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-align: right;
        }
        .header-folio {
          font-size: 9px;
          color: #666;
          text-align: right;
        }

        /* LAYOUT */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 6px;
        }

        /* SECTIONS */
        .section {
          border: 1px solid #1a3a6b;
        }
        .section-title {
          background: #1a3a6b;
          color: white;
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 3px 8px;
        }
        .section-body {
          padding: 6px 8px;
        }

        /* FIELDS */
        .field-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 4px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 3px;
        }
        .field-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .field-label {
          font-size: 8px;
          font-weight: bold;
          color: #1a3a6b;
          text-transform: uppercase;
          white-space: nowrap;
          min-width: 60px;
        }
        .field-value {
          font-size: 10px;
          color: #1a1a1a;
          flex: 1;
          border-bottom: 1px solid #aaa;
          min-height: 14px;
          padding-left: 2px;
        }

        .field-row-inline {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 4px;
        }

        /* TABLA SIGNOS VITALES */
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
        }
        th {
          background: #e8edf5;
          color: #1a3a6b;
          font-weight: bold;
          text-align: center;
          padding: 3px 2px;
          border: 1px solid #1a3a6b;
          font-size: 8px;
        }
        td {
          border: 1px solid #aab;
          text-align: center;
          padding: 4px 2px;
          height: 18px;
          font-size: 9px;
        }
        tr:nth-child(even) td { background: #f5f7fb; }

        /* CONDICION BADGES */
        .condicion-row {
          display: flex;
          gap: 12px;
          padding: 6px 8px;
          align-items: center;
        }
        .badge-check {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: bold;
        }
        .checkbox {
          width: 12px;
          height: 12px;
          border: 1.5px solid #1a3a6b;
          display: inline-block;
          border-radius: 2px;
        }

        /* CRONOLOGIA */
        .crono-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .crono-cell {
          border: 1px solid #aab;
          padding: 4px 6px;
        }
        .crono-label {
          font-size: 7px;
          font-weight: bold;
          color: #1a3a6b;
          text-transform: uppercase;
        }
        .crono-value {
          font-size: 11px;
          min-height: 16px;
          border-bottom: 1px solid #aaa;
          margin-top: 2px;
        }

        /* EQUIPO */
        .equipo-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 6px 8px;
        }
        .equipo-item {
          background: #e8edf5;
          border: 1px solid #1a3a6b;
          border-radius: 3px;
          padding: 2px 8px;
          font-size: 9px;
          color: #1a3a6b;
          font-weight: bold;
        }

        /* OBSERVACIONES */
        .obs-box {
          min-height: 40px;
          padding: 6px 8px;
          font-size: 10px;
          border-top: 1px solid #e0e0e0;
          color: #333;
        }

        /* FIRMA */
        .firma-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          margin-top: 6px;
        }
        .firma-box {
          border: 1px solid #1a3a6b;
          padding: 6px 8px;
        }
        .firma-label {
          font-size: 8px;
          font-weight: bold;
          color: #1a3a6b;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .firma-line {
          border-top: 1px solid #aaa;
          font-size: 8px;
          color: #888;
          padding-top: 2px;
        }

        .full-section {
          border: 1px solid #1a3a6b;
          margin-bottom: 6px;
        }
      </style>
    </head>
    <body>

      <!-- HEADER -->
      <div class="header">
        <div class="header-logo">
          <div class="logo-box">IMS</div>
          <div class="logo-sub">Ambulancias</div>
        </div>
        <div class="header-title">
          Ficha Prehospitalaria
          <div class="header-folio">Fecha: ${new Date().toLocaleDateString('es-CL')} &nbsp;|&nbsp; Unidad: ${data.unidad}</div>
        </div>
      </div>

      <!-- MAIN GRID -->
      <div class="main-grid">

        <!-- COLUMNA IZQUIERDA -->
        <div>
          <!-- Datos Paciente -->
          <div class="section" style="margin-bottom:6px">
            <div class="section-title">Datos del Paciente</div>
            <div class="section-body">
              <div class="field-row">
                <span class="field-label">Nombre</span>
                <span class="field-value">${nombreCompleto}</span>
              </div>
              <div class="field-row-inline">
                <div class="field-row">
                  <span class="field-label">RUT</span>
                  <span class="field-value">${data.rut}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Edad</span>
                  <span class="field-value">${data.edad} años</span>
                </div>
              </div>
              <div class="field-row">
                <span class="field-label">Fono</span>
                <span class="field-value">${data.telefono}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Dirección</span>
                <span class="field-value">${data.direccionOrigen}</span>
              </div>
            </div>
          </div>

          <!-- Antecedentes -->
          <div class="section" style="margin-bottom:6px">
            <div class="section-title">Antecedentes Médicos y Cuadro Clínico</div>
            <div class="section-body">
              <div class="field-row">
                <span class="field-label">DG:</span>
                <span class="field-value">${data.tipoEmergencia}</span>
              </div>
              <div class="field-row">
                <span class="field-label">ANT. MORB:</span>
                <span class="field-value">&nbsp;</span>
              </div>
              <div class="field-row">
                <span class="field-label">Alergias:</span>
                <span class="field-value">&nbsp;</span>
              </div>
              <div class="field-row">
                <span class="field-label">MC:</span>
                <span class="field-value">&nbsp;</span>
              </div>
            </div>
          </div>

          <!-- Condición -->
          <div class="section" style="margin-bottom:6px">
            <div class="section-title">Condición</div>
            <div class="condicion-row">
              <div class="badge-check">
                <span class="checkbox"></span> Estable
              </div>
              <div class="badge-check">
                <span class="checkbox"></span> Inestable
              </div>
            </div>
          </div>

          <!-- Medicamentos -->
          <div class="section">
            <div class="section-title">Medicamentos</div>
            <table>
              <thead>
                <tr>
                  <th>Fármaco</th>
                  <th>Dilución</th>
                  <th>Dosis</th>
                  <th>ML/HR</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- COLUMNA DERECHA -->
        <div>
          <!-- Equipo Interventor -->
          <div class="section" style="margin-bottom:6px">
            <div class="section-title">Equipo Interventor</div>
            <div class="equipo-list">
${(data.equipoAsignado ?? []).map((e) => `<span class="equipo-item">${e}</span>`).join('')}            </div>
            <div class="section-body">
              <div class="field-row">
                <span class="field-label">U. HOSP (E)</span>
                <span class="field-value">${data.direccionDestino}</span>
              </div>
              <div class="field-row">
                <span class="field-label">U. HOSP (R)</span>
                <span class="field-value">&nbsp;</span>
              </div>
            </div>
          </div>

          <!-- Signos Vitales -->
          <div class="section" style="margin-bottom:6px">
            <div class="section-title">Signos Vitales</div>
            <table>
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>PA</th>
                  <th>PAM</th>
                  <th>FC</th>
                  <th>RITMO</th>
                  <th>FR</th>
                  <th>SAT O2</th>
                  <th>FIO2</th>
                  <th>T°</th>
                  <th>HGT</th>
                  <th>GCS</th>
                  <th>EVA</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Cronología -->
          <div class="section">
            <div class="section-title">Cronología</div>
            <div class="crono-grid">
              <div class="crono-cell">
                <div class="crono-label">Término de Atención</div>
                <div class="crono-value">&nbsp;</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Firma</div>
                <div class="crono-value">&nbsp;</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Llegada QTH1</div>
                <div class="crono-value">&nbsp;</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Salida QTH1</div>
                <div class="crono-value">&nbsp;</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Condición</div>
                <div class="crono-value">&nbsp;</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Llegada QTH2</div>
                <div class="crono-value">&nbsp;</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Tipo Móvil</div>
                <div class="crono-value">${data.unidad}</div>
              </div>
              <div class="crono-cell">
                <div class="crono-label">Salida QTH2</div>
                <div class="crono-value">&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN INFERIOR: Terapia Ventilatoria + Evolución -->
      <div class="main-grid">
        <div class="full-section">
          <div class="section-title">Terapia Ventilatoria</div>
          <table>
            <thead>
              <tr>
                <th>Horario</th>
                <th>MODO</th>
                <th>FIO2</th>
                <th>PEEP</th>
                <th>VT</th>
                <th>P. INSP</th>
                <th>R IE</th>
                <th>PMAX/PMED</th>
                <th>VME/VTE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
              <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
            </tbody>
          </table>
        </div>

        <div class="full-section">
          <div class="section-title">Evolución Clínica y Procedimientos</div>
          <div style="padding: 6px 8px; min-height: 60px;">
            <div class="field-row" style="margin-bottom:2px">
              <span class="field-label">Fecha</span>
              <span class="field-value">${new Date().toLocaleDateString('es-CL')}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Folio (Interno)</span>
              <span class="field-value">&nbsp;</span>
            </div>
            <div style="min-height: 40px; border: 1px solid #e0e0e0; margin-top: 6px; padding: 4px;">
              ${data.observaciones ?? ''}
            </div>
          </div>
        </div>
      </div>

      <!-- FIRMAS -->
      <div class="firma-row">
        <div class="firma-box">
          <div class="firma-label">Médico Receptor</div>
          <div class="firma-line">Nombre y firma</div>
        </div>
        <div class="firma-box">
          <div class="firma-label">Prioridad</div>
          <div style="font-size:16px; font-weight:900; color:#1a3a6b; text-align:center; padding: 4px 0;">${data.prioridad.toUpperCase()}</div>
        </div>
        <div class="firma-box">
          <div class="firma-label">Estado Unidad</div>
          <div style="font-size:11px; padding: 4px 0;">${data.estadoUnidad}</div>
        </div>
      </div>

    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
};