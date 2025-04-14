Map.addLayer(aoi, {}, 'AOI - CDMX');
Map.centerObject(aoi, 10);

// ----------------- PARTE 1: CONFIGURACIÓN -----------------
var startDate = '2013-01-01';
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
                            .filterBounds(aoi)
                            .filterDate(startDate, endDate)
                            .map(applyScaleFactors)
                            .map(cloudMask)
                            .map(computeLST);

// ----------------- PARTE 4: MEDIANAS PARA MAPA -----------------
var meanNdvi = landsatCollection.select('ndvi').mean().clip(aoi);
var meanLst = landsatCollection.select('LST').mean().clip(aoi);

// ----------------- PARTE 5: VISUALIZACIÓN EN MAPA -----------------
Map.centerObject(aoi, 10);
Map.addLayer(meanNdvi, {min: -1, max: 1, palette: ndviPalette}, 'NDVI 2024');
Map.addLayer(meanLst, {min: 11, max: 55, palette: lstPalette2}, 'LST 2024');

// ----------------- PARTE 6: SERIES DE TIEMPO -----------------
// ---------------- SERIE ANUAL DE LST (PROMEDIO POR AÑO) ----------------
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
var annualChartLST = ui.Chart.image.seriesByRegion({
  imageCollection: annualLST,
  regions: aoi,
  reducer: ee.Reducer.mean(),
  scale: 30,
  xProperty: 'system:time_start'
})
.setChartType('ScatterChart')  // <-- IMPORTANTE: cambiar tipo de gráfico
.setOptions({
  title: 'LST Annual Average - CDMX (2014-2024)',
  lineWidth: 2,
  pointSize: 5,
  interpolateNulls: true,
  vAxis: {title: 'Temperature (°C)'},
  hAxis: {
    title: 'Año',
    format: 'yyyy',
    slantedText: false
  },
  colors: ['#e31a1c'],
  trendlines: {
    0: {
      type: 'linear',
      color: 'black',
      lineWidth: 2,
      opacity: 0.7,
      showR2: true,  // Muestra el R^2 en la gráfica
      visibleInLegend: true
    }
  }
});
print(annualChartLST);

// --- Calcular regresión lineal y mostrar ecuación de tendencia ---
var lstRegression = ee.FeatureCollection(
  annualLST.map(function(image) {
    var year = ee.Number(image.get('year'));
    var mean = image.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi,
      scale: 30,
      maxPixels: 1e13
    }).get('LST');
    return ee.Feature(null, {'year': year, 'LST': mean});
  })
);

// Calcular regresión lineal (LST = m*año + b)
var regression = lstRegression.reduceColumns({
  reducer: ee.Reducer.linearFit(),
  selectors: ['year', 'LST']
});

// Obtener pendiente y ordenada al origen
var slope = regression.get('scale');
var intercept = regression.get('offset');

// Imprimir ecuación en consola
print('Ecuación de la línea de tendencia LST:', 
      'LST =', slope, '* año +', intercept);

Map.setOptions('SATELLITE');