export type SectionType = 'hoy' | 'semana' | 'cuando_pueda' | 'completados';

export interface Item {
  id: string;
  texto: string;
  seccion: SectionType;
  categoria: string;
  creadoPor: string;
  creadoAt: number;
  completado: boolean;
  completadoPor?: string;
  order?: number;
}
