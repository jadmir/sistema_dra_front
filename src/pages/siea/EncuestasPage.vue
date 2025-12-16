<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col-12 col-md-6">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="assignment" size="md" class="q-mr-sm" />
            Encuestas SIEA
          </div>
          <div class="text-subtitle2 text-grey-7">Sistema Integrado de Estadística Agraria</div>
        </div>
        <div class="col-12 col-md-6 text-right q-mt-sm q-mt-md-none">
          <q-btn
            label="Nueva Encuesta"
            icon="add"
            color="primary"
            @click="dialogNuevo = true"
            :loading="loading"
          />
          <q-btn
            label="Actualizar"
            icon="refresh"
            color="secondary"
            @click="cargarEncuestas"
            :loading="loading"
            class="q-ml-sm"
          />
        </div>
      </div>

      <!-- KPIs -->
      <div v-if="estadisticas" class="row q-col-gutter-md q-mb-md">
        <div class="col-6 col-sm-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <div class="text-h6 text-weight-bold text-primary">
                {{ estadisticas.total }}
              </div>
              <div class="text-caption text-grey-7">Total Encuestas</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <div class="text-h6 text-weight-bold text-orange">
                {{ estadisticas.pendientes }}
              </div>
              <div class="text-caption text-grey-7">Pendientes</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <div class="text-h6 text-weight-bold text-positive">
                {{ estadisticas.validadas }}
              </div>
              <div class="text-caption text-grey-7">Validadas</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card flat bordered>
            <q-card-section class="text-center">
              <div class="text-h6 text-weight-bold text-negative">
                {{ estadisticas.rechazadas }}
              </div>
              <div class="text-caption text-grey-7">Rechazadas</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.tipo_formulario"
                :options="tiposFormulario"
                label="Tipo Formulario"
                outlined
                dense
                clearable
              />
            </div>
            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.estado"
                :options="estados"
                label="Estado"
                outlined
                dense
                clearable
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.encuestador_id"
                :options="encuestadoresOptions"
                label="Encuestador"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="filtros.provincia" label="Provincia" outlined dense clearable />
            </div>
            <div class="col-12 col-md-2">
              <q-btn
                label="Filtrar"
                icon="search"
                color="primary"
                @click="aplicarFiltros"
                :loading="loading"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card flat bordered>
        <q-table
          :rows="encuestas"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          :pagination="paginacion"
          @request="onRequest"
        >
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.codigo_encuesta }}</div>
              <q-badge
                :color="getColorTipo(props.row.tipo_formulario)"
                :label="props.row.tipo_formulario"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-encuestador="props">
            <q-td :props="props">
              <div class="text-weight-medium">
                {{ props.row.encuestador?.nombres }} {{ props.row.encuestador?.apellidos }}
              </div>
              <div class="text-caption text-grey-7">DNI: {{ props.row.encuestador?.dni }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge
                :color="getColorEstado(props.row.estado)"
                :label="props.row.estado"
                class="text-capitalize"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn icon="visibility" color="primary" size="sm" flat round @click="ver(props.row)">
                <q-tooltip>Ver</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.estado === 'pendiente'"
                icon="check"
                color="positive"
                size="sm"
                flat
                round
                @click="validar(props.row)"
              >
                <q-tooltip>Validar</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.estado === 'pendiente'"
                icon="close"
                color="negative"
                size="sm"
                flat
                round
                @click="rechazar(props.row)"
              >
                <q-tooltip>Rechazar</q-tooltip>
              </q-btn>
              <q-btn icon="edit" color="secondary" size="sm" flat round @click="editar(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Dialog: Ver Detalles -->
      <q-dialog v-model="dialogVer" maximized>
        <q-card>
          <q-card-section class="bg-primary text-white row items-center">
            <div class="text-h6">
              Detalle de Encuesta - {{ getTituloFormulario(encuestaActual?.tipo_formulario) }}
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section v-if="encuestaActual">
            <div class="row q-col-gutter-md">
              <!-- Información General -->
              <div class="col-12">
                <div class="text-h6 text-primary q-mb-md">Información General</div>
              </div>
              <div class="col-12 col-md-3">
                <q-field label="Código" stack-label borderless dense>
                  <template v-slot:control>
                    <span class="text-weight-bold">{{ encuestaActual.codigo_encuesta }}</span>
                  </template>
                </q-field>
              </div>
              <div class="col-12 col-md-3">
                <q-field label="Tipo de Formulario" stack-label borderless dense>
                  <template v-slot:control>
                    <q-badge color="indigo" :label="encuestaActual.tipo_formulario" />
                  </template>
                </q-field>
              </div>
              <div class="col-12 col-md-3">
                <q-field label="Fecha" stack-label borderless dense>
                  <template v-slot:control>
                    {{ new Date(encuestaActual.fecha_encuesta).toLocaleDateString('es-ES') }}
                  </template>
                </q-field>
              </div>
              <div class="col-12 col-md-3">
                <q-field label="Estado" stack-label borderless dense>
                  <template v-slot:control>
                    <q-badge
                      :color="getColorEstado(encuestaActual.estado)"
                      :label="encuestaActual.estado"
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-12 col-md-6">
                <q-field label="Encuestador" stack-label borderless dense>
                  <template v-slot:control>
                    {{ encuestaActual.encuestador?.nombres }}
                    {{ encuestaActual.encuestador?.apellidos }}
                  </template>
                </q-field>
              </div>
              <div class="col-12 col-md-6">
                <q-field label="Supervisor" stack-label borderless dense>
                  <template v-slot:control>
                    {{ encuestaActual.supervisor?.nombres }}
                    {{ encuestaActual.supervisor?.apellidos }}
                  </template>
                </q-field>
              </div>

              <!-- Datos del Formulario -->
              <div class="col-12 q-mt-md">
                <q-separator />
                <div class="text-h6 text-primary q-my-md">Datos de la Encuesta</div>
              </div>

              <!-- Mostrar datos según tipo de formulario -->
              <template v-if="encuestaActual.tipo_formulario === 'F-1' && datosJson">
                <div class="col-12">
                  <q-card flat bordered>
                    <q-card-section class="bg-blue-1">
                      <div class="text-subtitle1 text-weight-bold">
                        F-1: Precios de Alquiler de Maquinaria
                      </div>
                      <div class="text-caption">
                        Año: {{ datosJson.anio_referencia }} | Mes: {{ datosJson.mes_referencia }}
                      </div>
                    </q-card-section>
                    <q-card-section v-if="datosJson.sectores">
                      <div
                        v-for="(sector, index) in datosJson.sectores"
                        :key="index"
                        class="q-mb-md q-pa-md bg-grey-2 rounded-borders"
                      >
                        <div class="text-weight-bold q-mb-sm">
                          Sector {{ index + 1 }}: {{ sector.sector_estadistico }}
                        </div>
                        <div class="row q-col-gutter-sm text-caption">
                          <div class="col-6 col-md-3">
                            Tractor 18-40 HP: S/ {{ sector.tractor_18_p }}
                          </div>
                          <div class="col-6 col-md-3">
                            Tractor >40 HP: S/ {{ sector.tractor_h_p }}
                          </div>
                          <div class="col-6 col-md-3">Suradora: S/ {{ sector.suradora }}</div>
                          <div class="col-6 col-md-3">Cosechadora: S/ {{ sector.cosechadora }}</div>
                          <div class="col-6 col-md-3">
                            M.O. Hombres: S/ {{ sector.mano_obra_hombres }}
                          </div>
                          <div class="col-6 col-md-3">
                            M.O. Mujeres: S/ {{ sector.mano_obra_mujeres }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>

              <template v-else-if="encuestaActual.tipo_formulario === 'F-4' && datosJson">
                <div class="col-12">
                  <q-card flat bordered>
                    <q-card-section class="bg-green-1">
                      <div class="text-subtitle1 text-weight-bold">
                        F-4: Precios de Fertilizantes y Abonos
                      </div>
                      <div class="text-caption">
                        Año: {{ datosJson.anio_referencia }} | Mes:
                        {{ datosJson.mes_referencia }}
                      </div>
                    </q-card-section>
                    <q-card-section>
                      <div class="q-gutter-md">
                        <!-- Nitrogenados -->
                        <div v-if="datosJson.nitrogenados?.length > 0">
                          <div class="text-weight-bold text-primary q-mb-sm">Nitrogenados</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.nitrogenados" :key="idx">
                                <td>{{ prod.nombre }}</td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Fosfatados -->
                        <div v-if="datosJson.fosfatados?.length > 0">
                          <div class="text-weight-bold text-primary q-mb-sm">Fosfatados</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.fosfatados" :key="idx">
                                <td>{{ prod.nombre }}</td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Potásicos -->
                        <div v-if="datosJson.potasicos?.length > 0">
                          <div class="text-weight-bold text-primary q-mb-sm">Potásicos</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.potasicos" :key="idx">
                                <td>{{ prod.nombre }}</td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Compuestos -->
                        <div v-if="datosJson.compuestos?.length > 0">
                          <div class="text-weight-bold text-primary q-mb-sm">Compuestos</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.compuestos" :key="idx">
                                <td>{{ prod.nombre }}</td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Orgánicos -->
                        <div v-if="datosJson.organicos?.length > 0">
                          <div class="text-weight-bold text-primary q-mb-sm">Orgánicos</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.organicos" :key="idx">
                                <td>{{ prod.nombre }}</td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>

              <template v-else-if="encuestaActual.tipo_formulario === 'F-6' && datosJson">
                <div class="col-12">
                  <q-card flat bordered>
                    <q-card-section class="bg-red-1">
                      <div class="text-subtitle1 text-weight-bold">
                        F-6: Precios de Agroquímicos
                      </div>
                      <div class="text-caption">
                        Año: {{ datosJson.anio_referencia }} | Mes:
                        {{ datosJson.mes_referencia }}
                      </div>
                    </q-card-section>
                    <q-card-section>
                      <div class="q-gutter-md">
                        <!-- Acaricidas -->
                        <div v-if="datosJson.acaricidas?.length > 0">
                          <div class="text-weight-bold text-red q-mb-sm">Acaricidas</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.acaricidas" :key="idx">
                                <td>
                                  {{ prod.nombre }}
                                  <q-badge
                                    v-if="prod.noRegistrado"
                                    color="orange"
                                    label="NO REGISTRADO SENASA"
                                    class="q-ml-sm"
                                  />
                                </td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Adherentes -->
                        <div v-if="datosJson.adherentes?.length > 0">
                          <div class="text-weight-bold text-red q-mb-sm">Adherentes</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.adherentes" :key="idx">
                                <td>
                                  {{ prod.nombre }}
                                  <q-badge
                                    v-if="prod.noRegistrado"
                                    color="orange"
                                    label="NO REGISTRADO SENASA"
                                    class="q-ml-sm"
                                  />
                                </td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Fungicidas -->
                        <div v-if="datosJson.fungicidas?.length > 0">
                          <div class="text-weight-bold text-red q-mb-sm">Fungicidas</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.fungicidas" :key="idx">
                                <td>
                                  {{ prod.nombre }}
                                  <q-badge
                                    v-if="prod.noRegistrado"
                                    color="orange"
                                    label="NO REGISTRADO SENASA"
                                    class="q-ml-sm"
                                  />
                                </td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Herbicidas -->
                        <div v-if="datosJson.herbicidas?.length > 0">
                          <div class="text-weight-bold text-red q-mb-sm">Herbicidas</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.herbicidas" :key="idx">
                                <td>
                                  {{ prod.nombre }}
                                  <q-badge
                                    v-if="prod.noRegistrado"
                                    color="orange"
                                    label="NO REGISTRADO SENASA"
                                    class="q-ml-sm"
                                  />
                                </td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Insecticidas -->
                        <div v-if="datosJson.insecticidas?.length > 0">
                          <div class="text-weight-bold text-red q-mb-sm">Insecticidas</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.insecticidas" :key="idx">
                                <td>
                                  {{ prod.nombre }}
                                  <q-badge
                                    v-if="prod.noRegistrado"
                                    color="orange"
                                    label="NO REGISTRADO SENASA"
                                    class="q-ml-sm"
                                  />
                                </td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Nutrientes Foliares -->
                        <div v-if="datosJson.nutrientes?.length > 0">
                          <div class="text-weight-bold text-red q-mb-sm">Nutrientes Foliares</div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.nutrientes" :key="idx">
                                <td>
                                  {{ prod.nombre }}
                                  <q-badge
                                    v-if="prod.noRegistrado"
                                    color="orange"
                                    label="NO REGISTRADO SENASA"
                                    class="q-ml-sm"
                                  />
                                </td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>

                        <!-- Reguladores de Crecimiento -->
                        <div v-if="datosJson.reguladores?.length > 0">
                          <div class="text-weight-bold text-red q-mb-sm">
                            Reguladores de Crecimiento
                          </div>
                          <q-markup-table dense flat bordered>
                            <thead>
                              <tr class="bg-grey-3">
                                <th>Producto</th>
                                <th>Envase</th>
                                <th>Precio 1</th>
                                <th>Precio 2</th>
                                <th>Precio 3</th>
                                <th>Promedio</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(prod, idx) in datosJson.reguladores" :key="idx">
                                <td>
                                  {{ prod.nombre }}
                                  <q-badge
                                    v-if="prod.noRegistrado"
                                    color="orange"
                                    label="NO REGISTRADO SENASA"
                                    class="q-ml-sm"
                                  />
                                </td>
                                <td>{{ prod.envase }}</td>
                                <td>S/ {{ prod.precio1 }}</td>
                                <td>S/ {{ prod.precio2 }}</td>
                                <td>S/ {{ prod.precio3 }}</td>
                                <td class="text-weight-bold">S/ {{ prod.precio_promedio }}</td>
                              </tr>
                            </tbody>
                          </q-markup-table>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>

              <template v-else-if="encuestaActual.tipo_formulario === 'F-14' && datosJson">
                <div class="col-12">
                  <q-card flat bordered>
                    <q-card-section class="bg-amber-1">
                      <div class="text-subtitle1 text-weight-bold">
                        F-14: Precios de Transporte de Productos
                      </div>
                      <div class="text-caption">
                        Región: {{ datosJson.region }} | Provincia: {{ datosJson.provincia }} |
                        Distrito:
                        {{ datosJson.distrito }}
                      </div>
                      <div class="text-caption">
                        Año: {{ datosJson.anio_referencia }} | Mes:
                        {{ datosJson.mes_referencia }}
                      </div>
                    </q-card-section>
                    <q-card-section>
                      <!-- Dentro de la región -->
                      <div v-if="datosJson.rutas_dentro?.length > 0" class="q-mb-md">
                        <div class="text-weight-bold text-green q-mb-sm">Dentro de la región</div>
                        <q-markup-table dense flat bordered>
                          <thead>
                            <tr class="bg-grey-3">
                              <th>Tipo</th>
                              <th>Origen</th>
                              <th>Destino</th>
                              <th>Vía</th>
                              <th>Producto</th>
                              <th>U.M.</th>
                              <th>Precio Mín.</th>
                              <th>Precio Máx.</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(ruta, idx) in datosJson.rutas_dentro" :key="idx">
                              <td>{{ ruta.tipo }}</td>
                              <td>{{ ruta.origen }}</td>
                              <td>{{ ruta.destino }}</td>
                              <td>{{ ruta.via }}</td>
                              <td>{{ ruta.producto }}</td>
                              <td>{{ ruta.unidad_medida }}</td>
                              <td>S/ {{ ruta.precio_minimo }}</td>
                              <td>S/ {{ ruta.precio_maximo }}</td>
                            </tr>
                          </tbody>
                        </q-markup-table>
                      </div>

                      <!-- Fuera de la región -->
                      <div v-if="datosJson.rutas_fuera?.length > 0">
                        <div class="text-weight-bold text-orange q-mb-sm">Fuera de la región</div>
                        <q-markup-table dense flat bordered>
                          <thead>
                            <tr class="bg-grey-3">
                              <th>Tipo</th>
                              <th>Origen</th>
                              <th>Destino</th>
                              <th>Vía</th>
                              <th>Producto</th>
                              <th>U.M.</th>
                              <th>Precio Mín.</th>
                              <th>Precio Máx.</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(ruta, idx) in datosJson.rutas_fuera" :key="idx">
                              <td>{{ ruta.tipo }}</td>
                              <td>{{ ruta.origen }}</td>
                              <td>{{ ruta.destino }}</td>
                              <td>{{ ruta.via }}</td>
                              <td>{{ ruta.producto }}</td>
                              <td>{{ ruta.unidad_medida }}</td>
                              <td>S/ {{ ruta.precio_minimo }}</td>
                              <td>S/ {{ ruta.precio_maximo }}</td>
                            </tr>
                          </tbody>
                        </q-markup-table>
                      </div>

                      <div
                        v-if="!datosJson.rutas_dentro?.length && !datosJson.rutas_fuera?.length"
                        class="text-center text-grey-6 q-pa-md"
                      >
                        No hay rutas registradas en esta encuesta
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>

              <!-- Observaciones -->
              <div class="col-12 q-mt-md" v-if="encuestaActual.observaciones">
                <q-separator />
                <div class="text-h6 text-primary q-my-md">Observaciones</div>
                <q-card flat bordered>
                  <q-card-section>
                    {{ encuestaActual.observaciones }}
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Dialog: Validar -->
      <q-dialog v-model="dialogValidar">
        <q-card style="min-width: 400px">
          <q-card-section class="bg-positive text-white">
            <div class="text-h6">Validar Encuesta</div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="observaciones"
              label="Observaciones"
              type="textarea"
              outlined
              rows="3"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Cancelar" color="grey" flat v-close-popup />
            <q-btn label="Validar" color="positive" @click="confirmarValidar" :loading="loading" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialog: Rechazar -->
      <q-dialog v-model="dialogRechazar">
        <q-card style="min-width: 400px">
          <q-card-section class="bg-negative text-white">
            <div class="text-h6">Rechazar Encuesta</div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="observaciones"
              label="Motivo del rechazo (requerido)"
              type="textarea"
              outlined
              rows="3"
              :rules="[(val) => !!val || 'El motivo es requerido']"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Cancelar" color="grey" flat v-close-popup />
            <q-btn
              label="Rechazar"
              color="negative"
              @click="confirmarRechazar"
              :loading="loading"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialog: Nueva/Editar Encuesta -->
      <q-dialog v-model="dialogNuevo" persistent>
        <q-card style="min-width: 600px; max-width: 800px">
          <q-card-section class="bg-primary text-white row items-center">
            <div class="text-h6">
              {{ modoEdicion ? 'Editar Encuesta' : 'Nueva Encuesta' }}
            </div>
            <q-space />
            <q-btn icon="close" flat round dense @click="cerrarDialog" />
          </q-card-section>

          <!-- Banner de estado de catálogos -->
          <q-banner v-if="!modoEdicion" class="bg-blue-1 q-pa-sm">
            <template v-slot:avatar>
              <q-icon name="info" color="primary" />
            </template>
            <div class="text-caption">
              <strong>Catálogos de productos cargados:</strong>
              <div class="q-mt-xs">
                📦 Fertilizantes:
                <q-badge
                  :color="fertilizantesDisponibles.length > 0 ? 'positive' : 'grey'"
                  :label="fertilizantesDisponibles.length"
                  class="q-ml-xs"
                />
                <q-tooltip v-if="fertilizantesDisponibles.length === 0">
                  No hay fertilizantes activos en la BD. Contacte al administrador.
                </q-tooltip>
              </div>
              <div class="q-mt-xs">
                🧪 Agroquímicos:
                <q-badge
                  :color="agroquimicosDisponibles.length > 0 ? 'positive' : 'grey'"
                  :label="agroquimicosDisponibles.length"
                  class="q-ml-xs"
                />
                <q-tooltip v-if="agroquimicosDisponibles.length === 0">
                  No hay agroquímicos activos en la BD. Contacte al administrador.
                </q-tooltip>
              </div>
            </div>
          </q-banner>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <!-- Código -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.codigo_encuesta"
                  label="Código de Encuesta *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'El código es requerido']"
                  hint="Ej: ENC-2024-001"
                />
              </div>

              <!-- Tipo de Formulario -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.tipo_formulario"
                  :options="tiposFormulario"
                  label="Tipo de Formulario *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'El tipo es requerido']"
                />
              </div>

              <!-- Encuestador -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.encuestador_id"
                  :options="encuestadoresOptions"
                  label="Encuestador *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'El encuestador es requerido']"
                />
              </div>

              <!-- Supervisor -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.supervisor_id"
                  :options="supervisoresOptions"
                  label="Supervisor *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'El supervisor es requerido']"
                />
              </div>

              <!-- Fecha -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.fecha_encuesta"
                  label="Fecha de Encuesta *"
                  type="date"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'La fecha es requerida']"
                />
              </div>

              <!-- Estado (solo en edición) -->
              <div v-if="modoEdicion" class="col-12 col-md-6">
                <q-select
                  v-model="form.estado"
                  :options="estados"
                  label="Estado"
                  outlined
                  dense
                  disable
                />
              </div>

              <!-- Ubicación -->
              <div class="col-12 col-md-4">
                <q-input v-model="form.provincia" label="Provincia *" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.canton" label="Cantón" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.parroquia" label="Parroquia" outlined dense />
              </div>

              <!-- Coordenadas GPS -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.latitud"
                  label="Latitud"
                  outlined
                  dense
                  type="number"
                  step="0.000001"
                  hint="Ej: -0.123456"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.longitud"
                  label="Longitud"
                  outlined
                  dense
                  type="number"
                  step="0.000001"
                  hint="Ej: -78.123456"
                />
              </div>

              <!-- Separador -->
              <div class="col-12">
                <q-separator class="q-my-md" />
                <div class="text-h6 text-primary q-mb-md">
                  <q-icon name="description" />
                  {{ getTituloFormulario(form.tipo_formulario) }}
                </div>
              </div>

              <!-- Formulario F-1: PRECIOS DE ALQUILER DE MAQUINARIA AGRÍCOLA -->
              <template v-if="form.tipo_formulario === 'F-1'">
                <!-- Año y Mes de Referencia -->
                <div class="col-12">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Año y mes de referencia</div>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="datosFormulario.anio_referencia"
                    label="Año *"
                    outlined
                    dense
                    type="number"
                    :min="2000"
                    :max="new Date().getFullYear()"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="datosFormulario.mes_referencia"
                    :options="mesesOptions"
                    label="Mes *"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>

                <!-- Sectores Estadísticos y Precios -->
                <div class="col-12">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm q-mt-md">
                    Información de precios de alquiler
                  </div>
                  <q-banner class="bg-blue-1 q-mb-md">
                    <template v-slot:avatar>
                      <q-icon name="info" color="primary" />
                    </template>
                    Registre los precios por sector estadístico. Puede agregar múltiples sectores.
                  </q-banner>
                </div>

                <!-- Botón agregar sector -->
                <div class="col-12">
                  <q-btn
                    label="Agregar Sector"
                    icon="add"
                    color="primary"
                    size="sm"
                    @click="agregarSector"
                  />
                </div>

                <!-- Lista de sectores -->
                <div
                  v-for="(sector, index) in datosFormulario.sectores"
                  :key="index"
                  class="col-12"
                >
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-grey-2">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">Sector {{ index + 1 }}</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            icon="delete"
                            color="negative"
                            size="sm"
                            flat
                            round
                            @click="eliminarSector(index)"
                          >
                            <q-tooltip>Eliminar sector</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section>
                      <div class="row q-col-gutter-sm">
                        <!-- Sector Estadístico -->
                        <div class="col-12">
                          <q-input
                            v-model="sector.sector_estadistico"
                            label="Sector Estadístico *"
                            outlined
                            dense
                            hint="Nombre del sector"
                          />
                        </div>

                        <!-- TRACTOR / HORA -->
                        <div class="col-12">
                          <div class="text-subtitle2 text-weight-medium q-mt-sm q-mb-xs">
                            2. TRACTOR / HORA ($/)*
                          </div>
                        </div>
                        <div class="col-6 col-md-3">
                          <q-input
                            v-model.number="sector.tractor_18_p"
                            label="18 P"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>
                        <div class="col-6 col-md-3">
                          <q-input
                            v-model.number="sector.tractor_h_p"
                            label="H-P"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>
                        <div class="col-6 col-md-3">
                          <q-input
                            v-model.number="sector.tractor_h_c"
                            label="H-C"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>
                        <div class="col-6 col-md-3">
                          <q-input
                            v-model.number="sector.tractor_h_p_2"
                            label="H-P"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>

                        <!-- OTRA MAQUINARIA / HORA -->
                        <div class="col-12">
                          <div class="text-subtitle2 text-weight-medium q-mt-sm q-mb-xs">
                            3. OTRA MAQUINARIA / HORA ($/)
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <q-input
                            v-model.number="sector.suradora"
                            label="Suradora"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>
                        <div class="col-6 col-md-4">
                          <q-input
                            v-model.number="sector.cosechadora"
                            label="Cosechadora"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>
                        <div class="col-6 col-md-4">
                          <q-input
                            v-model.number="sector.trilladora"
                            label="Trilladora"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>

                        <!-- MANO OBRA/DÍA -->
                        <div class="col-12">
                          <div class="text-subtitle2 text-weight-medium q-mt-sm q-mb-xs">
                            4. MANO OBRA/DÍA ($/) **
                          </div>
                        </div>
                        <div class="col-6 col-md-6">
                          <q-input
                            v-model.number="sector.mano_obra_hombres"
                            label="Hombres"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>
                        <div class="col-6 col-md-6">
                          <q-input
                            v-model.number="sector.mano_obra_mujeres"
                            label="Mujeres"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>

                        <!-- YUNTA DIA -->
                        <div class="col-12">
                          <div class="text-subtitle2 text-weight-medium q-mt-sm q-mb-xs">
                            5. YUNTA DÍA ($/) ***
                          </div>
                        </div>
                        <div class="col-12">
                          <q-input
                            v-model.number="sector.yunta_dia"
                            label="Yunta por día"
                            outlined
                            dense
                            type="number"
                            step="0.01"
                            prefix="$"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Resumen de Precios -->
                <div class="col-12 q-mt-md">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Resumen de Precios</div>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="datosFormulario.precio_promedio"
                    label="Precio Promedio ($)"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    prefix="$"
                    readonly
                    hint="Calculado automáticamente"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="datosFormulario.precio_maximo"
                    label="Precio Máximo ($)"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    prefix="$"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="datosFormulario.precio_minimo"
                    label="Precio Mínimo ($)"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    prefix="$"
                  />
                </div>

                <!-- Notas al pie -->
                <div class="col-12">
                  <q-banner class="bg-orange-1 q-mt-md">
                    <div class="text-caption">
                      <strong>*</strong>Hora/Tractor, incluye tractorista<br />
                      <strong>**</strong>Sin incluir almuerzo<br />
                      <strong>***</strong>Incluye operador
                    </div>
                  </q-banner>
                </div>
              </template>

              <!-- Formulario F-4: PRECIOS DE FERTILIZANTES Y ABONOS ORGÁNICOS -->
              <template v-if="form.tipo_formulario === 'F-4'">
                <!-- Año y Mes de Referencia -->
                <div class="col-12">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Año y mes de referencia</div>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="datosFormulario.anio_referencia"
                    label="Año *"
                    outlined
                    dense
                    type="number"
                    :min="2000"
                    :max="new Date().getFullYear()"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="datosFormulario.mes_referencia"
                    :options="mesesOptions"
                    label="Mes *"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>

                <!-- Banner informativo -->
                <div class="col-12">
                  <q-banner class="bg-blue-1 q-my-md">
                    <template v-slot:avatar>
                      <q-icon name="info" color="primary" />
                    </template>
                    Agregue solo los productos que desee registrar. Ingrese el nombre, envase y
                    precios de 3 casas comerciales.
                  </q-banner>
                </div>

                <!-- 1. FERTILIZANTES QUÍMICOS NITROGENADOS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-primary text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">1. FERTILIZANTES QUÍMICOS NITROGENADOS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="primary"
                            size="sm"
                            @click="agregarProductoF4('nitrogenados')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.nitrogenados?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.nitrogenados"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF4('nitrogenados', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-4">
                            <q-select
                              v-model="producto.producto"
                              :options="fertilizantesPorCategoria('nitrogenados')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Fertilizante *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="
                                (val) => onSeleccionarFertilizante(producto, val)
                              "
                            >
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.nitrogenados.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 2. FERTILIZANTES QUÍMICOS FOSFATADOS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-primary text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">2. FERTILIZANTES QUÍMICOS FOSFATADOS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="primary"
                            size="sm"
                            @click="agregarProductoF4('fosfatados')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.fosfatados?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.fosfatados"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF4('fosfatados', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-4">
                            <q-select
                              v-model="producto.producto"
                              :options="fertilizantesPorCategoria('fosfatados')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Fertilizante *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="
                                (val) => onSeleccionarFertilizante(producto, val)
                              "
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay fertilizantes fosfatados
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.fosfatados.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 3. FERTILIZANTES QUÍMICOS POTÁSICOS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-primary text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">3. FERTILIZANTES QUÍMICOS POTÁSICOS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="primary"
                            size="sm"
                            @click="agregarProductoF4('potasicos')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.potasicos?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.potasicos"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF4('potasicos', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-4">
                            <q-select
                              v-model="producto.producto"
                              :options="fertilizantesPorCategoria('potasicos')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Fertilizante *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="
                                (val) => onSeleccionarFertilizante(producto, val)
                              "
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay fertilizantes potásicos
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.potasicos.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 4. FERTILIZANTES QUÍMICOS COMPUESTOS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-primary text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">4. FERTILIZANTES QUÍMICOS COMPUESTOS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="primary"
                            size="sm"
                            @click="agregarProductoF4('compuestos')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.compuestos?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.compuestos"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF4('compuestos', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-4">
                            <q-select
                              v-model="producto.producto"
                              :options="fertilizantesPorCategoria('compuestos')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Fertilizante *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="
                                (val) => onSeleccionarFertilizante(producto, val)
                              "
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay fertilizantes compuestos
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.compuestos.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 5. ABONOS ORGÁNICOS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-primary text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">5. ABONOS ORGÁNICOS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="primary"
                            size="sm"
                            @click="agregarProductoF4('organicos')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.organicos?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.organicos"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF4('organicos', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-4">
                            <q-select
                              v-model="producto.producto"
                              :options="fertilizantesPorCategoria('organicos')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Fertilizante *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="
                                (val) => onSeleccionarFertilizante(producto, val)
                              "
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay fertilizantes orgánicos
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-3">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF4(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.organicos.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>

              <!-- Formulario F-6: PRECIOS DE PRINCIPALES AGROQUÍMICOS -->
              <template v-if="form.tipo_formulario === 'F-6'">
                <!-- Año y Mes de Referencia -->
                <div class="col-12">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">Año y mes de referencia</div>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="datosFormulario.anio_referencia"
                    label="Año *"
                    outlined
                    dense
                    type="number"
                    :min="2000"
                    :max="new Date().getFullYear()"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="datosFormulario.mes_referencia"
                    :options="mesesOptions"
                    label="Mes *"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>

                <!-- Banner informativo -->
                <div class="col-12">
                  <q-banner class="bg-blue-1 q-my-md">
                    <template v-slot:avatar>
                      <q-icon name="info" color="primary" />
                    </template>
                    Agregue solo los productos que desee registrar. Ingrese el nombre, envase y
                    precios de 3 casas comerciales.
                  </q-banner>
                  <q-banner class="bg-orange-1">
                    <strong>*Productos no registrados en SENASA</strong>
                  </q-banner>
                </div>

                <!-- 1. ACARICIDAS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-red text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">1. ACARICIDAS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="red"
                            size="sm"
                            @click="agregarProductoF6('acaricidas')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.acaricidas?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.acaricidas"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF6('acaricidas', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-3">
                            <q-select
                              v-model="producto.producto"
                              :options="agroquimicosPorCategoria('acaricidas')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Agroquímico *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="(val) => onSeleccionarAgroquimico(producto, val)"
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay acaricidas
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                          <div class="col-12">
                            <q-checkbox
                              v-model="producto.noRegistrado"
                              label="Producto NO registrado en SENASA *"
                              color="orange"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.acaricidas.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 2. ADHERENTES -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-red text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">2. ADHERENTES</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="red"
                            size="sm"
                            @click="agregarProductoF6('adherentes')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.adherentes?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.adherentes"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF6('adherentes', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-3">
                            <q-select
                              v-model="producto.producto"
                              :options="agroquimicosPorCategoria('adherentes')"
                              option-label="nombre"
                              option-value="id"
                              label="Buscar Agroquímico *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="(val) => onSeleccionarAgroquimico(producto, val)"
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay adherentes
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                          <div class="col-12">
                            <q-checkbox
                              v-model="producto.noRegistrado"
                              label="Producto NO registrado en SENASA *"
                              color="orange"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.adherentes.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 3. FUNGICIDAS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-red text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">3. FUNGICIDAS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="red"
                            size="sm"
                            @click="agregarProductoF6('fungicidas')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.fungicidas?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.fungicidas"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF6('fungicidas', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-3">
                            <q-select
                              v-model="producto.producto"
                              :options="agroquimicosPorCategoria('fungicidas')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Agroquímico *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="(val) => onSeleccionarAgroquimico(producto, val)"
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay fungicidas
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                          <div class="col-12">
                            <q-checkbox
                              v-model="producto.noRegistrado"
                              label="Producto NO registrado en SENASA *"
                              color="orange"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.fungicidas.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 4. HERBICIDAS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-red text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">4. HERBICIDAS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="red"
                            size="sm"
                            @click="agregarProductoF6('herbicidas')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.herbicidas?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.herbicidas"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF6('herbicidas', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-3">
                            <q-select
                              v-model="producto.producto"
                              :options="agroquimicosPorCategoria('herbicidas')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Agroquímico *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="(val) => onSeleccionarAgroquimico(producto, val)"
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay herbicidas
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                          <div class="col-12">
                            <q-checkbox
                              v-model="producto.noRegistrado"
                              label="Producto NO registrado en SENASA *"
                              color="orange"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.herbicidas.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 5. INSECTICIDAS -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-red text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">5. INSECTICIDAS</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="red"
                            size="sm"
                            @click="agregarProductoF6('insecticidas')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.insecticidas?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.insecticidas"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF6('insecticidas', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-3">
                            <q-select
                              v-model="producto.producto"
                              :options="agroquimicosPorCategoria('insecticidas')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Agroquímico *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="(val) => onSeleccionarAgroquimico(producto, val)"
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay insecticidas
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                          <div class="col-12">
                            <q-checkbox
                              v-model="producto.noRegistrado"
                              label="Producto NO registrado en SENASA *"
                              color="orange"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.insecticidas.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 6. NUTRIENTES FOLIARES -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-red text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">6. NUTRIENTES FOLIARES</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="red"
                            size="sm"
                            @click="agregarProductoF6('nutrientes')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.nutrientes?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.nutrientes"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF6('nutrientes', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-3">
                            <q-select
                              v-model="producto.producto"
                              :options="agroquimicosPorCategoria('nutrientes')"
                              option-label="nombre"
                              option-value="id"
                              label="Buscar Agroquímico *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="(val) => onSeleccionarAgroquimico(producto, val)"
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay nutrientes foliares
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                          <div class="col-12">
                            <q-checkbox
                              v-model="producto.noRegistrado"
                              label="Producto NO registrado en SENASA *"
                              color="orange"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.nutrientes.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- 7. REGULADORES DE CRECIMIENTO -->
                <div class="col-12">
                  <q-card flat bordered class="q-mt-md">
                    <q-card-section class="bg-red text-white">
                      <div class="row items-center">
                        <div class="col">
                          <div class="text-weight-bold">7. REGULADORES DE CRECIMIENTO</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            label="Agregar Producto"
                            icon="add"
                            color="white"
                            text-color="red"
                            size="sm"
                            @click="agregarProductoF6('reguladores')"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section v-if="datosFormulario.reguladores?.length > 0">
                      <div
                        v-for="(producto, index) in datosFormulario.reguladores"
                        :key="index"
                        class="q-mb-md"
                      >
                        <div class="row q-col-gutter-sm">
                          <div class="col-12">
                            <div class="text-weight-medium">Producto {{ index + 1 }}</div>
                            <q-btn
                              icon="delete"
                              color="negative"
                              size="sm"
                              flat
                              round
                              @click="eliminarProductoF6('reguladores', index)"
                              class="float-right"
                            >
                              <q-tooltip>Eliminar producto</q-tooltip>
                            </q-btn>
                          </div>

                          <div class="col-12 col-md-3">
                            <q-select
                              v-model="producto.producto"
                              :options="agroquimicosPorCategoria('reguladores')"
                              option-label="nombre_comercial"
                              option-value="id"
                              label="Buscar Agroquímico *"
                              outlined
                              dense
                              clearable
                              use-input
                              input-debounce="300"
                              @filter="(val, update) => update()"
                              @update:model-value="(val) => onSeleccionarAgroquimico(producto, val)"
                            >
                              <template v-slot:no-option>
                                <q-item>
                                  <q-item-section class="text-grey">
                                    No hay reguladores de crecimiento
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                  <q-item-section>
                                    <q-item-label>{{ scope.opt.nombre_comercial }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </template>
                              <template v-slot:selected>
                                <div v-if="producto.producto">
                                  {{ producto.producto.nombre_comercial }} ({{
                                    producto.producto.codigo
                                  }})
                                </div>
                              </template>
                            </q-select>
                            <div v-if="producto.nombre" class="text-caption text-positive q-mt-xs">
                              ✓ {{ producto.nombre }}
                            </div>
                          </div>
                          <div class="col-12 col-md-2">
                            <q-input
                              v-model="producto.envase"
                              label="Envase Comercial *"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio1"
                              label="Casa 1 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio2"
                              label="Casa 2 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio3"
                              label="Casa 3 ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              @update:model-value="calcularPromedioF6(producto)"
                            />
                          </div>
                          <div class="col-6 col-md-2">
                            <q-input
                              v-model.number="producto.precio_promedio"
                              label="Promedio ($)"
                              outlined
                              dense
                              type="number"
                              step="0.01"
                              prefix="$"
                              readonly
                              filled
                              class="bg-grey-2"
                            />
                          </div>
                          <div class="col-12">
                            <q-checkbox
                              v-model="producto.noRegistrado"
                              label="Producto NO registrado en SENASA *"
                              color="orange"
                            />
                          </div>
                        </div>
                        <q-separator
                          v-if="index < datosFormulario.reguladores.length - 1"
                          class="q-mt-md"
                        />
                      </div>
                    </q-card-section>

                    <q-card-section v-else>
                      <div class="text-center text-grey-6">
                        No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </template>
              <!-- Formulario F-14: Precios de Transporte de Productos -->
              <template v-if="form.tipo_formulario === 'F-14'">
                <!-- Ubicación Política -->
                <div class="col-12">
                  <div class="text-subtitle1 text-weight-bold text-primary q-mt-sm q-mb-sm">
                    I. Ubicación política
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="datosFormulario.region" label="1. Región *" outlined dense />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="datosFormulario.provincia"
                    label="2. Provincia *"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="datosFormulario.distrito"
                    label="3. Distrito *"
                    outlined
                    dense
                  />
                </div>

                <!-- Año y Mes de Referencia -->
                <div class="col-12">
                  <div class="text-subtitle1 text-weight-bold text-primary q-mt-md q-mb-sm">
                    II. Año y mes de referencia
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="datosFormulario.anio_referencia"
                    label="Año *"
                    outlined
                    dense
                    type="number"
                    :min="2020"
                    :max="2030"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="datosFormulario.mes_referencia"
                    :options="[
                      'Enero',
                      'Febrero',
                      'Marzo',
                      'Abril',
                      'Mayo',
                      'Junio',
                      'Julio',
                      'Agosto',
                      'Septiembre',
                      'Octubre',
                      'Noviembre',
                      'Diciembre',
                    ]"
                    label="Mes *"
                    outlined
                    dense
                  />
                </div>

                <!-- Información de precios de transporte -->
                <div class="col-12">
                  <div class="text-subtitle1 text-weight-bold text-primary q-mt-md q-mb-sm">
                    III. Información de precios de transporte de productos
                  </div>
                </div>

                <!-- Tabla DENTRO DE LA REGIÓN -->
                <div class="col-12">
                  <q-card flat bordered>
                    <q-card-section class="bg-amber-1 q-pa-sm">
                      <div class="row items-center">
                        <div class="text-body2 text-weight-bold">Dentro de la región:</div>
                        <q-space />
                        <q-btn
                          label="Agregar fila"
                          icon="add"
                          color="primary"
                          size="sm"
                          dense
                          @click="agregarRutaDentro"
                        />
                      </div>
                    </q-card-section>

                    <q-separator />

                    <div class="q-pa-sm">
                      <q-markup-table flat dense>
                        <thead>
                          <tr class="bg-grey-3">
                            <th class="text-left" style="width: 80px">Tipo</th>
                            <th class="text-left" style="width: 150px">Origen</th>
                            <th class="text-left" style="width: 150px">Destino</th>
                            <th class="text-left" style="width: 100px">Vía</th>
                            <th class="text-left" style="width: 200px">
                              Producto<br /><small>(Agrícola, Agroindustrial, Pecuario)</small>
                            </th>
                            <th class="text-left" style="width: 100px">Unidad de medida</th>
                            <th class="text-left" style="width: 120px">
                              Precio con IGV<br /><small>(S/ x UM) - Mínimo</small>
                            </th>
                            <th class="text-left" style="width: 120px">
                              Precio con IGV<br /><small>(S/ x UM) - Máximo</small>
                            </th>
                            <th style="width: 50px"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(ruta, index) in datosFormulario.rutas_dentro || []"
                            :key="'dentro-' + index"
                          >
                            <td>
                              <q-select
                                v-model="ruta.tipo"
                                :options="['Carga', 'Pasajeros', 'Mixto']"
                                dense
                                borderless
                              />
                            </td>
                            <td>
                              <q-input v-model="ruta.origen" dense borderless />
                            </td>
                            <td>
                              <q-input v-model="ruta.destino" dense borderless />
                            </td>
                            <td>
                              <q-select
                                v-model="ruta.via"
                                :options="['a. Terrestre', 'b. Fluvial', 'c. Aéreo']"
                                dense
                                borderless
                              />
                            </td>
                            <td>
                              <q-input v-model="ruta.producto" dense borderless />
                            </td>
                            <td>
                              <q-input v-model="ruta.unidad_medida" dense borderless />
                            </td>
                            <td>
                              <q-input
                                v-model.number="ruta.precio_minimo"
                                type="number"
                                step="0.01"
                                dense
                                borderless
                              />
                            </td>
                            <td>
                              <q-input
                                v-model.number="ruta.precio_maximo"
                                type="number"
                                step="0.01"
                                dense
                                borderless
                              />
                            </td>
                            <td>
                              <q-btn
                                icon="delete"
                                color="red"
                                flat
                                round
                                dense
                                size="sm"
                                @click="eliminarRutaDentro(index)"
                              >
                                <q-tooltip>Eliminar</q-tooltip>
                              </q-btn>
                            </td>
                          </tr>
                          <tr
                            v-if="
                              !datosFormulario.rutas_dentro ||
                              datosFormulario.rutas_dentro.length === 0
                            "
                          >
                            <td colspan="9" class="text-center text-grey-6 q-pa-md">
                              No hay rutas registradas. Haga clic en "Agregar fila" para comenzar.
                            </td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </div>
                  </q-card>
                </div>

                <!-- Tabla FUERA DE LA REGIÓN -->
                <div class="col-12 q-mt-md">
                  <q-card flat bordered>
                    <q-card-section class="bg-amber-1 q-pa-sm">
                      <div class="row items-center">
                        <div class="text-body2 text-weight-bold">Fuera de la región:</div>
                        <q-space />
                        <q-btn
                          label="Agregar fila"
                          icon="add"
                          color="primary"
                          size="sm"
                          dense
                          @click="agregarRutaFuera"
                        />
                      </div>
                    </q-card-section>

                    <q-separator />

                    <div class="q-pa-sm">
                      <q-markup-table flat dense>
                        <thead>
                          <tr class="bg-grey-3">
                            <th class="text-left" style="width: 80px">Tipo</th>
                            <th class="text-left" style="width: 150px">Origen</th>
                            <th class="text-left" style="width: 150px">Destino</th>
                            <th class="text-left" style="width: 100px">Vía</th>
                            <th class="text-left" style="width: 200px">
                              Producto<br /><small>(Agrícola, Agroindustrial, Pecuario)</small>
                            </th>
                            <th class="text-left" style="width: 100px">Unidad de medida</th>
                            <th class="text-left" style="width: 120px">
                              Precio con IGV<br /><small>(S/ x UM) - Mínimo</small>
                            </th>
                            <th class="text-left" style="width: 120px">
                              Precio con IGV<br /><small>(S/ x UM) - Máximo</small>
                            </th>
                            <th style="width: 50px"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(ruta, index) in datosFormulario.rutas_fuera || []"
                            :key="'fuera-' + index"
                          >
                            <td>
                              <q-select
                                v-model="ruta.tipo"
                                :options="['Carga', 'Pasajeros', 'Mixto']"
                                dense
                                borderless
                              />
                            </td>
                            <td>
                              <q-input v-model="ruta.origen" dense borderless />
                            </td>
                            <td>
                              <q-input v-model="ruta.destino" dense borderless />
                            </td>
                            <td>
                              <q-select
                                v-model="ruta.via"
                                :options="['a. Terrestre', 'b. Fluvial', 'c. Aéreo']"
                                dense
                                borderless
                              />
                            </td>
                            <td>
                              <q-input v-model="ruta.producto" dense borderless />
                            </td>
                            <td>
                              <q-input v-model="ruta.unidad_medida" dense borderless />
                            </td>
                            <td>
                              <q-input
                                v-model.number="ruta.precio_minimo"
                                type="number"
                                step="0.01"
                                dense
                                borderless
                              />
                            </td>
                            <td>
                              <q-input
                                v-model.number="ruta.precio_maximo"
                                type="number"
                                step="0.01"
                                dense
                                borderless
                              />
                            </td>
                            <td>
                              <q-btn
                                icon="delete"
                                color="red"
                                flat
                                round
                                dense
                                size="sm"
                                @click="eliminarRutaFuera(index)"
                              >
                                <q-tooltip>Eliminar</q-tooltip>
                              </q-btn>
                            </td>
                          </tr>
                          <tr
                            v-if="
                              !datosFormulario.rutas_fuera ||
                              datosFormulario.rutas_fuera.length === 0
                            "
                          >
                            <td colspan="9" class="text-center text-grey-6 q-pa-md">
                              No hay rutas registradas. Haga clic en "Agregar fila" para comenzar.
                            </td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </div>
                  </q-card>
                </div>

                <!-- Observaciones F-14 -->
                <div class="col-12" v-if="form.tipo_formulario === 'F-14'">
                  <div class="text-subtitle1 text-weight-bold text-primary q-mt-md q-mb-sm">
                    IV. Observaciones
                  </div>
                </div>
              </template>

              <!-- Observaciones -->
              <div class="col-12">
                <q-input
                  v-model="form.observaciones"
                  label="Observaciones"
                  type="textarea"
                  outlined
                  rows="3"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn label="Cancelar" color="grey" flat @click="cerrarDialog" />
            <q-btn
              :label="modoEdicion ? 'Actualizar' : 'Guardar'"
              color="primary"
              @click="guardar"
              :loading="loading"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSieaEncuestasStore } from 'src/stores/sieaEncuestas'
import { useSieaEncuestadoresStore } from 'src/stores/sieaEncuestadores'
import { useSieaSupervisoresStore } from 'src/stores/sieaSupervisores'
import { fertilizantesService } from 'src/services/siea/fertilizantesService'
import { agroquimicosService } from 'src/services/siea/agroquimicosService'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const encuestasStore = useSieaEncuestasStore()
const encuestadoresStore = useSieaEncuestadoresStore()
const supervisoresStore = useSieaSupervisoresStore()

// Catálogos de productos desde BD
const fertilizantesDisponibles = ref([])
const agroquimicosDisponibles = ref([])

// Estado
const dialogNuevo = ref(false)
const dialogVer = ref(false)
const dialogValidar = ref(false)
const dialogRechazar = ref(false)
const encuestaActual = ref(null)
const observaciones = ref('')
const modoEdicion = ref(false)

// Datos del formulario dinámico según tipo
const datosFormulario = ref({})

// Computed para obtener datos_json parseados correctamente
const datosJson = computed(() => {
  if (!encuestaActual.value) return null

  // Si datos_json existe y es un string, parsearlo
  if (encuestaActual.value.datos_json) {
    if (typeof encuestaActual.value.datos_json === 'string') {
      try {
        return JSON.parse(encuestaActual.value.datos_json)
      } catch (e) {
        console.error('❌ Error al parsear datos_json:', e)
        return null
      }
    }
    // Si ya es un objeto, devolverlo
    return encuestaActual.value.datos_json
  }

  // Si no existe datos_json, buscar en otros campos
  if (encuestaActual.value.datos) {
    if (typeof encuestaActual.value.datos === 'string') {
      try {
        return JSON.parse(encuestaActual.value.datos)
      } catch (e) {
        console.error('❌ Error al parsear datos:', e)
        return null
      }
    }
    return encuestaActual.value.datos
  }

  return null
})

// Formulario
const form = ref({
  codigo_encuesta: '',
  tipo_formulario: null,
  encuestador_id: null,
  supervisor_id: null,
  fecha_encuesta: null,
  provincia: '',
  canton: '',
  parroquia: '',
  latitud: null,
  longitud: null,
  datos_json: {},
  observaciones: '',
  estado: 'pendiente',
})

// Filtros
const filtros = ref({
  tipo_formulario: null,
  estado: null,
  encuestador_id: null,
  provincia: null,
})

// Opciones
const tiposFormulario = ['F-1', 'F-4', 'F-6', 'F-14']
const estados = ['pendiente', 'validado', 'rechazado']

const mesesOptions = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 },
]

// Columnas de tabla
const columns = [
  { name: 'codigo', label: 'Código', align: 'left', field: 'codigo_encuesta', sortable: true },
  { name: 'encuestador', label: 'Encuestador', align: 'left', field: 'encuestador' },
  { name: 'fecha', label: 'Fecha', align: 'center', field: 'fecha_encuesta', sortable: true },
  { name: 'provincia', label: 'Provincia', align: 'left', field: 'provincia', sortable: true },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Computed
const encuestas = computed(() => encuestasStore.encuestas)
const estadisticas = computed(() => encuestasStore.estadisticas)
const loading = computed(() => encuestasStore.loading)
const encuestadoresOptions = computed(() => encuestadoresStore.encuestadoresOptions)
const supervisoresOptions = computed(() => supervisoresStore.supervisoresOptions)

const paginacion = computed(() => ({
  page: encuestasStore.currentPage,
  rowsPerPage: encuestasStore.perPage,
  rowsNumber: encuestasStore.total,
}))

// Métodos
async function cargarEncuestas() {
  try {
    await Promise.all([encuestasStore.fetchEncuestas(), encuestasStore.fetchEstadisticas()])
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar encuestas',
      caption: error.message,
    })
  }
}

function aplicarFiltros() {
  encuestasStore.setFiltros(filtros.value)
  cargarEncuestas()
}

function onRequest(props) {
  encuestasStore.irAPagina(props.pagination.page)
}

function ver(encuesta) {
  encuestaActual.value = encuesta
  console.log('📋 Datos de la encuesta:', encuesta)
  console.log('📦 datos_json (raw):', encuesta.datos_json)
  console.log('� datos (raw):', encuesta.datos)
  console.log('�🔍 Todas las propiedades:', Object.keys(encuesta))

  // Esperar a que el computed se actualice
  setTimeout(() => {
    console.log('✅ datosJson (parseado):', datosJson.value)
  }, 100)

  dialogVer.value = true
}

function editar() {
  $q.notify({
    type: 'info',
    message: 'Función de edición pendiente de implementar',
  })
}

function limpiarFormulario() {
  form.value = {
    codigo_encuesta: '',
    tipo_formulario: null,
    encuestador_id: null,
    supervisor_id: null,
    fecha_encuesta: null,
    provincia: '',
    canton: '',
    parroquia: '',
    latitud: null,
    longitud: null,
    datos_json: {},
    observaciones: '',
    estado: 'pendiente',
  }
  datosFormulario.value = {
    // F-1 inicial
    anio_referencia: new Date().getFullYear(),
    mes_referencia: new Date().getMonth() + 1,
    sectores: [],
    precio_promedio: 0,
    precio_maximo: 0,
    precio_minimo: 0,
    // F-4 inicial (arrays vacíos)
    nitrogenados: [],
    fosfatados: [],
    potasicos: [],
    compuestos: [],
    organicos: [],
    // F-6 inicial (arrays vacíos)
    acaricidas: [],
    adherentes: [],
    fungicidas: [],
    herbicidas: [],
    insecticidas: [],
    nutrientes: [],
    reguladores: [],
    // F-14 inicial
    region: '',
    provincia: '',
    distrito: '',
    rutas_dentro: [],
    rutas_fuera: [],
  }
  modoEdicion.value = false
}

function cerrarDialog() {
  dialogNuevo.value = false
  limpiarFormulario()
}

// Funciones para F-1
function agregarSector() {
  if (!datosFormulario.value.sectores) {
    datosFormulario.value.sectores = []
  }
  datosFormulario.value.sectores.push({
    sector_estadistico: '',
    tractor_18_p: null,
    tractor_h_p: null,
    tractor_h_c: null,
    tractor_h_p_2: null,
    suradora: null,
    cosechadora: null,
    trilladora: null,
    mano_obra_hombres: null,
    mano_obra_mujeres: null,
    yunta_dia: null,
  })
}

function eliminarSector(index) {
  datosFormulario.value.sectores.splice(index, 1)
}

// Funciones para F-14: Rutas de transporte
function agregarRutaDentro() {
  if (!datosFormulario.value.rutas_dentro) {
    datosFormulario.value.rutas_dentro = []
  }
  datosFormulario.value.rutas_dentro.push({
    tipo: null,
    origen: '',
    destino: '',
    via: null,
    producto: '',
    unidad_medida: '',
    precio_minimo: null,
    precio_maximo: null,
  })
}

function eliminarRutaDentro(index) {
  datosFormulario.value.rutas_dentro.splice(index, 1)
}

function agregarRutaFuera() {
  if (!datosFormulario.value.rutas_fuera) {
    datosFormulario.value.rutas_fuera = []
  }
  datosFormulario.value.rutas_fuera.push({
    tipo: null,
    origen: '',
    destino: '',
    via: null,
    producto: '',
    unidad_medida: '',
    precio_minimo: null,
    precio_maximo: null,
  })
}

function eliminarRutaFuera(index) {
  datosFormulario.value.rutas_fuera.splice(index, 1)
}

// Funciones para F-4: Fertilizantes
function agregarProductoF4(categoria) {
  if (!datosFormulario.value[categoria]) {
    datosFormulario.value[categoria] = []
  }
  datosFormulario.value[categoria].push({
    producto_id: null, // ID del producto desde BD
    producto: null, // Objeto completo del producto seleccionado
    nombre: '', // Se llenará automáticamente al seleccionar
    envase: '',
    precio1: null,
    precio2: null,
    precio3: null,
    precio_promedio: 0,
  })
}

// Filtrar fertilizantes por categoría
function fertilizantesPorCategoria(categoria) {
  const mapeoTipos = {
    nitrogenados: 'NITROGENADO',
    fosfatados: 'FOSFATADO',
    potasicos: 'POTASICO',
    compuestos: 'COMPUESTO',
    organicos: 'ORGANICO',
  }
  const tipo = mapeoTipos[categoria]
  return fertilizantesDisponibles.value.filter(
    (f) => f.tipo?.toUpperCase() === tipo || f.tipo?.toUpperCase().includes(tipo),
  )
}

// Cuando se selecciona un fertilizante, autocompletar datos
function onSeleccionarFertilizante(producto, fertilizante) {
  if (fertilizante) {
    producto.producto_id = fertilizante.id
    producto.nombre = fertilizante.nombre_comercial || fertilizante.nombre
    producto.codigo = fertilizante.codigo
    // Sugerir envase común si existe
    producto.envase = fertilizante.envase_comun || ''
  }
}

function eliminarProductoF4(categoria, index) {
  datosFormulario.value[categoria].splice(index, 1)
}

function calcularPromedioF4(producto) {
  const precios = [producto.precio1, producto.precio2, producto.precio3].filter((p) => p !== null)
  if (precios.length > 0) {
    producto.precio_promedio = (precios.reduce((a, b) => a + b, 0) / precios.length).toFixed(2)
  } else {
    producto.precio_promedio = 0
  }
}

// Funciones para F-6: Agroquímicos
function agregarProductoF6(categoria) {
  if (!datosFormulario.value[categoria]) {
    datosFormulario.value[categoria] = []
  }
  datosFormulario.value[categoria].push({
    producto_id: null, // ID del producto desde BD
    producto: null, // Objeto completo del producto seleccionado
    nombre: '', // Se llenará automáticamente al seleccionar
    envase: '',
    precio1: null,
    precio2: null,
    precio3: null,
    precio_promedio: 0,
    noRegistrado: false,
  })
}

// Filtrar agroquímicos por categoría
function agroquimicosPorCategoria(categoria) {
  const mapeoTipos = {
    acaricidas: 'ACARICIDA',
    adherentes: 'ADHERENTE',
    fungicidas: 'FUNGICIDA',
    herbicidas: 'HERBICIDA',
    insecticidas: 'INSECTICIDA',
    nutrientes: 'NUTRIENTE',
    reguladores: 'REGULADOR',
  }
  const tipo = mapeoTipos[categoria]

  const resultados = agroquimicosDisponibles.value.filter((a) => {
    const categoriaUpper = a.categoria?.toUpperCase()
    const tipoUpper = a.tipo?.toUpperCase()

    // Normalizar: remover espacios, guiones bajos y caracteres especiales
    const normalizar = (str) => str?.replace(/[_\s-]/g, '').toUpperCase()
    const tipoNormalizado = normalizar(tipo)
    const categoriaNormalizada = normalizar(a.categoria)
    const tipoAgroquimicoNormalizado = normalizar(a.tipo)

    return (
      categoriaUpper === tipo ||
      categoriaUpper?.includes(tipo) ||
      tipoUpper === tipo ||
      tipoUpper?.includes(tipo) ||
      categoriaNormalizada?.includes(tipoNormalizado) ||
      tipoAgroquimicoNormalizado?.includes(tipoNormalizado)
    )
  })

  console.log(`🔍 Filtrando ${categoria} (${tipo}):`, resultados.length, 'encontrados')
  if (resultados.length > 0) {
    console.log(
      '   Productos:',
      resultados.map((r) => `${r.nombre_comercial} (${r.tipo})`),
    )
  }
  return resultados
}

// Cuando se selecciona un agroquímico, autocompletar datos
function onSeleccionarAgroquimico(producto, agroquimico) {
  if (agroquimico) {
    producto.producto_id = agroquimico.id
    producto.nombre = agroquimico.nombre_comercial || agroquimico.nombre
    producto.codigo = agroquimico.codigo
    // Sugerir envase común si existe
    producto.envase = agroquimico.envase_comun || ''
  }
}

function eliminarProductoF6(categoria, index) {
  datosFormulario.value[categoria].splice(index, 1)
}

function calcularPromedioF6(producto) {
  const precios = [producto.precio1, producto.precio2, producto.precio3].filter((p) => p !== null)
  if (precios.length > 0) {
    producto.precio_promedio = (precios.reduce((a, b) => a + b, 0) / precios.length).toFixed(2)
  } else {
    producto.precio_promedio = 0
  }
}

function getTituloFormulario(tipo) {
  const titulos = {
    'F-1': 'Precios de Alquiler de Maquinaria Agrícola, Mano de Obra y Yunta',
    'F-4': 'Precios de Principales Fertilizantes y Abonos Orgánicos',
    'F-6': 'Precios de Principales Agroquímicos',
    'F-14': 'Precios (S/) de Transporte de Productos Agropecuarios y Agroindustriales Alimenticios',
  }
  return titulos[tipo] || 'Datos de la Encuesta'
}

async function guardar() {
  try {
    // Validar campos requeridos
    if (
      !form.value.codigo_encuesta ||
      !form.value.tipo_formulario ||
      !form.value.encuestador_id ||
      !form.value.supervisor_id ||
      !form.value.fecha_encuesta
    ) {
      $q.notify({
        type: 'warning',
        message: 'Por favor complete todos los campos requeridos',
      })
      return
    }

    // Preparar datos según el tipo de formulario
    if (form.value.tipo_formulario === 'F-4') {
      // Recopilar datos de F-4 (Fertilizantes) - Dinámicos
      form.value.datos_json = {
        anio_referencia: datosFormulario.value.anio_referencia,
        mes_referencia: datosFormulario.value.mes_referencia,
        nitrogenados: datosFormulario.value.nitrogenados || [],
        fosfatados: datosFormulario.value.fosfatados || [],
        potasicos: datosFormulario.value.potasicos || [],
        compuestos: datosFormulario.value.compuestos || [],
        organicos: datosFormulario.value.organicos || [],
      }
    } else if (form.value.tipo_formulario === 'F-6') {
      // Recopilar datos de F-6 (Agroquímicos) - Dinámicos
      form.value.datos_json = {
        anio_referencia: datosFormulario.value.anio_referencia,
        mes_referencia: datosFormulario.value.mes_referencia,
        acaricidas: datosFormulario.value.acaricidas || [],
        adherentes: datosFormulario.value.adherentes || [],
        fungicidas: datosFormulario.value.fungicidas || [],
        herbicidas: datosFormulario.value.herbicidas || [],
        insecticidas: datosFormulario.value.insecticidas || [],
        nutrientes: datosFormulario.value.nutrientes || [],
        reguladores: datosFormulario.value.reguladores || [],
      }
    } else if (form.value.tipo_formulario === 'F-14') {
      // Recopilar datos de F-14 (Transporte)
      form.value.datos_json = {
        region: datosFormulario.value.region,
        provincia: datosFormulario.value.provincia,
        distrito: datosFormulario.value.distrito,
        anio_referencia: datosFormulario.value.anio_referencia,
        mes_referencia: datosFormulario.value.mes_referencia,
        rutas_dentro: datosFormulario.value.rutas_dentro || [],
        rutas_fuera: datosFormulario.value.rutas_fuera || [],
      }
    } else {
      // Convertir datosFormulario a datos_json para otros tipos
      form.value.datos_json = { ...datosFormulario.value }
    }

    // Guardar o actualizar
    if (modoEdicion.value) {
      await encuestasStore.updateEncuesta(encuestaActual.value.id, form.value)
      $q.notify({
        type: 'positive',
        message: 'Encuesta actualizada exitosamente',
        icon: 'check_circle',
      })
    } else {
      await encuestasStore.createEncuesta(form.value)
      $q.notify({
        type: 'positive',
        message: 'Encuesta creada exitosamente',
        icon: 'check_circle',
      })
    }

    cerrarDialog()
    await cargarEncuestas()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: modoEdicion.value ? 'Error al actualizar encuesta' : 'Error al crear encuesta',
      caption: error.message,
    })
  }
}

function validar(encuesta) {
  encuestaActual.value = encuesta
  observaciones.value = ''
  dialogValidar.value = true
}

function rechazar(encuesta) {
  encuestaActual.value = encuesta
  observaciones.value = ''
  dialogRechazar.value = true
}

async function confirmarValidar() {
  try {
    await encuestasStore.validarEncuesta(encuestaActual.value.id, observaciones.value)
    $q.notify({
      type: 'positive',
      message: 'Encuesta validada exitosamente',
      icon: 'check_circle',
    })
    dialogValidar.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al validar encuesta',
      caption: error.message,
    })
  }
}

async function confirmarRechazar() {
  if (!observaciones.value) {
    $q.notify({
      type: 'warning',
      message: 'Debes ingresar el motivo del rechazo',
    })
    return
  }

  try {
    await encuestasStore.rechazarEncuesta(encuestaActual.value.id, observaciones.value)
    $q.notify({
      type: 'positive',
      message: 'Encuesta rechazada',
      icon: 'info',
    })
    dialogRechazar.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al rechazar encuesta',
      caption: error.message,
    })
  }
}

function getColorEstado(estado) {
  const colores = {
    pendiente: 'orange',
    validado: 'positive',
    rechazado: 'negative',
  }
  return colores[estado] || 'grey'
}

function getColorTipo(tipo) {
  const colores = {
    'F-1': 'blue',
    'F-4': 'purple',
    'F-6': 'teal',
    'F-14': 'indigo',
  }
  return colores[tipo] || 'grey'
}

// Cargar catálogos de productos desde BD
async function cargarCatalogos() {
  try {
    // Cargar fertilizantes activos
    const resFertilizantes = await fertilizantesService.listarActivos()
    fertilizantesDisponibles.value = resFertilizantes.data || []
    console.log('✅ Fertilizantes cargados:', fertilizantesDisponibles.value.length)
    console.log('📦 Fertilizantes:', fertilizantesDisponibles.value)

    // Cargar agroquímicos activos
    const resAgroquimicos = await agroquimicosService.listarActivos()
    agroquimicosDisponibles.value = resAgroquimicos.data || []
    console.log('✅ Agroquímicos cargados:', agroquimicosDisponibles.value.length)
    console.log('📦 Agroquímicos completos:', agroquimicosDisponibles.value)

    // Mostrar TODOS los tipos únicos encontrados
    const tiposUnicos = [...new Set(agroquimicosDisponibles.value.map((a) => a.tipo))].sort()
    console.log('🏷️ Tipos únicos en BD:', tiposUnicos)

    // Contar por cada tipo
    tiposUnicos.forEach((tipo) => {
      const count = agroquimicosDisponibles.value.filter((a) => a.tipo === tipo).length
      console.log(`   ${tipo}: ${count} productos`)
    })
  } catch (error) {
    console.error('❌ Error cargando catálogos:', error)
    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar los catálogos de productos',
    })
  }
}

// Lifecycle
onMounted(async () => {
  await encuestadoresStore.fetchActivos()
  await supervisoresStore.fetchActivos()
  await cargarCatalogos()
  await cargarEncuestas()
})
</script>

<style scoped>
.q-card {
  transition: all 0.3s;
}

pre {
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
}
</style>
