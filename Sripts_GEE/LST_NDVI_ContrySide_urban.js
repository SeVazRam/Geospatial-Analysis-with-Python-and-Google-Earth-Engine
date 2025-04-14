Map.addLayer(aoi_cdmx, {}, 'AOI - CDMX');
Map.centerObject(aoi_cdmx, 10);

Map.addLayer(aoi, {}, 'AOI - CDMX_countryside'); //g_cs
Map.addLayer(aoi1, {}, 'AOI - CDMX_urban'); // g_urban
///////////////////////////////////////////////////
var g_urban_feature = ee.Feature(g_urban, {'name': 'g_urban'});
var g_cs_feature = ee.Feature(g_cs, {'name': 'g_cs'});

var fc_urban = ee.FeatureCollection([g_urban_feature]);
var fc_cs = ee.FeatureCollection([g_cs_feature]);

Export.table.toDrive({
  collection: fc_urban,
  folder: 'GEE_geometry',
  description: 'G_urban',
  fileFormat: 'SHP'  // O puedes usar 'GeoJSON', 'KML', 'CSV'
});

Export.table.toDrive({
  collection: fc_cs,
  folder: 'GEE_geometry',
  description: 'G_cs',
  fileFormat: 'SHP'  // O puedes usar 'GeoJSON', 'KML', 'CSV'
});

/////////////////////////////////////////////


// ----------------- PARTE 1: CONFIGURACIÓN -----------------
var startDate = '2013-12-31';
var endDate = '2024-12-31';

// Paleta NDVI
var ndviPalette = [
  '#800000', '#a52a2a', '#b22222', '#cd5c5c', '#e9967a',
  '#f08080', '#fa8072', '#f4a460', '#f0e68c', '#fffacd',
  '#ffffe0', '#d9f99d', '#bbf7d0', '#86efac', '#4ade80',
  '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  '#0f3d22'
];

var ndviLabels = [
  '-1.0', '-0.9', '-0.8', '-0.7', '-0.6',
  '-0.5', '-0.4', '-0.3', '-0.2', '-0.1',
  ' 0.0', ' 0.1', ' 0.2', ' 0.3', ' 0.4',
  ' 0.5', ' 0.6', ' 0.7', ' 0.8', ' 0.9',
  ' 1.0'
];

var lstPalette2 = [
  '0000ff', // Azul (frío)
  '00bfff', // Azul claro
  '00ffbf', // Verde-azulado
  '00ff00', // Verde
  'bfff00', // Verde amarillento
  'ffff00', // Amarillo
  'ffbf00', // Naranja claro
  'ff8000', // Naranja fuerte
  'ff4000', // Naranja-rojo
  'ff0000', // Rojo puro
  'b30000', // Rojo oscuro
  '7f0000'  // Rojo muy oscuro (extremo calor)
];
  

// ----------------- PARTE 2: FUNCIONES -----------------
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

function cloudMask(image) {
  var cloudShadowBitmask = (1 << 3);
  var cloudBitmask = (1 << 5);
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(cloudShadowBitmask).eq(0)
                .and(qa.bitwiseAnd(cloudBitmask).eq(0));
  return image.updateMask(mask);
}

// Calcular NDVI + LST en cada imagen
function computeLST(image) {
  var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('ndvi');

  // NDVI min y max fijos (ajustables si quieres calcular por imagen)
  var ndviMin = -0.2;
  var ndviMax = 0.8;
  var fv = ((ndvi.subtract(ndviMin)).divide(ndviMax - ndviMin)).pow(2);
  var em = fv.multiply(0.004).add(0.986).rename('em');

  var thermal = image.select('ST_B10').rename('thermal');

  var lst = thermal.expression(
    '(TB / (1 + (0.00115 * (TB / 1.438)) * log(em))) - 273.15',
    {
      'TB': thermal,
      'em': em
    }).rename('LST');

  return image.addBands(ndvi).addBands(lst).copyProperties(image, ['system:time_start']);
}

// ----------------- PARTE 3: COLECCIÓN LANDSAT -----------------
var landsatCollection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                            .filterBounds(g_cs) //g_cs
                            .filterBounds(g_urban) // g_urban
                            .filterDate(startDate, endDate)
                            .map(applyScaleFactors)
                            .map(cloudMask)
                            .map(computeLST);

// ----------------- PARTE 4: MEDIANAS PARA MAPA -----------------
var medianNdvi_aoi = landsatCollection.select('ndvi').median().clip(g_cs);
var medianLst_aoi = landsatCollection.select('LST').median().clip(g_cs);
var medianNdvi_aoi1 = landsatCollection.select('ndvi').median().clip(g_urban);
var medianLst_aoi1 = landsatCollection.select('LST').median().clip(g_urban);
// ----------------- PARTE 5: VISUALIZACIÓN EN MAPA -----------------
//Map.centerObject(aoi, 10);
Map.addLayer(medianNdvi_aoi, {min: -1, max: 1, palette: ndviPalette}, 'NDVI AOI country 2024');
Map.addLayer(medianLst_aoi, {min: 11, max: 55, palette: lstPalette2}, 'LST AOI country 2024');
Map.addLayer(medianNdvi_aoi1, {min: -1, max: 1, palette: ndviPalette}, 'NDVI AOI1 urban2024');
Map.addLayer(medianLst_aoi1, {min: 11, max: 55, palette: lstPalette2}, 'LST AOI1 urban 2024');

// ----------------- PARTE 6: CÁLCULO DE SUHI -----------------

// Obtener LST promedio en zona urbana (g_urban)
var lstUrban = landsatCollection.select('LST')
  .mean()
  .reduceRegion({
    geometry: g_urban,
    reducer: ee.Reducer.mean(),
    scale: 30,
    maxPixels: 1e13
  }).get('LST');

// Obtener LST promedio en zona rural (g_cs)
var lstRural = landsatCollection.select('LST')
  .mean()
  .reduceRegion({
    geometry: g_cs,
    reducer: ee.Reducer.mean(),
    scale: 30,
    maxPixels: 1e13
  }).get('LST');



var suhi = ee.Number(lstUrban).subtract(ee.Number(lstRural));

// Ver Km2
print('Área en km² (2 decimales) g_urban:', g_urban.area().divide(1e6).format('%.2f'));
print('Área en km² (2 decimales) geometry:', geometry.area().divide(1e6).format('%.2f'));
print('Área en km² (2 decimales) g_cs:', g_cs.area().divide(1e6).format('%.2f'));


// Imprimir resultados
print('LST promedio urbano (°C):', lstUrban);
print('LST promedio rural (°C):', lstRural);
print('SUHI (°C):', suhi);

// ----------------- PARTE 7: SERIES DE TIEMPO -----------------

var years = ee.List.sequence(2014, 2024);

// Función para calcular la media anual de LST
var annualLST = ee.ImageCollection.fromImages(
  years.map(function(year) {
    var start = ee.Date.fromYMD(year, 1, 1);
    var end = start.advance(1, 'year');

    var yearCollection = landsatCollection
      .filterDate(start, end)
      .select('LST');

    var meanImage = yearCollection.mean()
      .set('year', year)
      .set('system:time_start', start.millis());

    return meanImage;
  })
);

// Gráfica de LST anual
// Crear regiones como Features con nombres
var regionsList = ee.FeatureCollection([
  ee.Feature(g_cs, {'label': 'Countryside'}),
  ee.Feature(g_urban, {'label': 'Urban'})
]);

// Gráfica de LST anual por región con nombres y colores
var annualChartLST = ui.Chart.image.seriesByRegion({
  imageCollection: annualLST,
  regions: regionsList,
  reducer: ee.Reducer.mean(),
  scale: 30,
  xProperty: 'system:time_start',
  seriesProperty: 'label'  // <-- Esto es lo que le da nombre a las líneas
})
.setChartType('ScatterChart')
.setOptions({
  title: 'Comparison between the annual average of urban and rural LST - CDMX (2014-2024)',
  lineWidth: 2,
  pointSize: 5,
  interpolateNulls: true,
  vAxis: {title: 'Temperature (°C)'},
  hAxis: {
    title: 'Year',
    format: 'yyyy',
    slantedText: false
  },
  // Colores para cada línea: rojo y verde por ejemplo
  colors: ['#1f78b4','#e31a1c' ]
});
print(annualChartLST);

