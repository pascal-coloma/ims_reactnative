export type Notificacion = {
  tipo: 'despacho' | 'reasignacion' | 'alerta_stock' | 'sistema';
  titulo: string;
  mensaje: string;
};

const mockNotificaciones: Notificacion[] = [
  {
    tipo: 'despacho',
    titulo: 'Nuevo despacho',
    mensaje: 'Se ha creado el despacho DSP-5 con destino Hospital San Borja.',
  },
  {
    tipo: 'reasignacion',
    titulo: 'Reasignación de personal',
    mensaje: 'Enf. Camila Martínez ha sido reasignada al despacho DSP-3.',
  },
  {
    tipo: 'alerta_stock',
    titulo: 'Stock bajo mínimo',
    mensaje: 'Adrenalina tiene solo 3 unidades, por debajo del mínimo de 5.',
  },
  {
    tipo: 'sistema',
    titulo: 'Sistema',
    mensaje: 'Conexión con el servidor restablecida correctamente.',
  },
  {
    tipo: 'alerta_stock',
    titulo: 'Stock bajo mínimo',
    mensaje: 'Morfina tiene solo 2 unidades, por debajo del mínimo de 5.',
  },
  {
    tipo: 'despacho',
    titulo: 'Nuevo despacho',
    mensaje: 'Se ha creado el despacho DSP-6 con destino Clínica Las Condes.',
  },
];

export default mockNotificaciones;
