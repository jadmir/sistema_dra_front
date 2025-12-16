/**
 * Servicios SIEA - Sistema Integrado de Estadística Agraria
 * Exportación centralizada de todos los servicios
 */

import encuestasService from './encuestasService'
import encuestadoresService from './encuestadoresService'
import supervisoresService from './supervisoresService'
import { maquinariaService } from './maquinariaService'
import { fertilizantesService } from './fertilizantesService'
import { agroquimicosService } from './agroquimicosService'

export {
  encuestasService,
  encuestadoresService,
  supervisoresService,
  maquinariaService,
  fertilizantesService,
  agroquimicosService,
}

export default {
  encuestas: encuestasService,
  encuestadores: encuestadoresService,
  supervisores: supervisoresService,
  maquinaria: maquinariaService,
  fertilizantes: fertilizantesService,
  agroquimicos: agroquimicosService,
}
