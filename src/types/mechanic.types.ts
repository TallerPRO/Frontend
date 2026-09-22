// Mecánico del taller. Vive en ms-tallerpro-catalog (es un recurso del taller,
// como la bahía); jobs solo copia su id y nombre dentro de la orden.
export interface Mechanic {
  id: string;
  workshopId: string;
  rut: string; // normalizado por el backend: "12345678-5"
  name: string;
  email: string; // a este correo llega el aviso de trabajo asignado
  phone: string;
  active: boolean;
  updatedAt: string;
}

export interface MechanicDTO {
  rut: string;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
}
