/// Importar aoi archivo SHP

Map.addLayer(aoi, {}, 'AOI - CDMX');
Map.centerObject(aoi, 10);

// ----------------- PARTE 1: CONFIGURACIÓN -----------------
var startDate = '2023-12-31';
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
var medianNdvi = landsatCollection.select('ndvi').median().clip(aoi);
var medianLst = landsatCollection.select('LST').median().clip(aoi);

// ----------------- PARTE 5: VISUALIZACIÓN EN MAPA -----------------
Map.centerObject(aoi, 10);
Map.addLayer(medianNdvi, {min: -1, max: 1, palette: ndviPalette}, 'NDVI 2024');
Map.addLayer(medianLst, {min: 11, max: 55, palette: lstPalette2}, 'LST 2024');

// ----------------- PARTE 6: SERIES DE TIEMPO -----------------
// Serie NDVI
var chartNDVI = ui.Chart.image.seriesByRegion({
  imageCollection: landsatCollection.select('ndvi'),
  regions: aoi,
  reducer: ee.Reducer.mean(),
  scale: 30,
  xProperty: 'system:time_start'
}).setOptions({
  title: 'NDVI Time Series - CDMX (2024)',
  lineWidth: 2,
  interpolateNulls: true,
  vAxis: {title: 'NDVI'},
  hAxis: {
    title: 'Date',
    format: 'YYYY-MMM',
    slantedText: true
  },
  colors: ['green']
});
print(chartNDVI);

// Serie LST
var chartLST = ui.Chart.image.seriesByRegion({
  imageCollection: landsatCollection.select('LST'),
  regions: aoi,
  reducer: ee.Reducer.mean(),
  scale: 30,
  xProperty: 'system:time_start'
}).setOptions({
  title: 'LST Time Series - CDMX (2024)',
  lineWidth: 2,
  interpolateNulls: true,
  vAxis: {title: 'LST (°C)'},
  hAxis: {
    title: 'Date',
    format: 'YYYY-MMM',
    slantedText: true
  },
  colors: ['red']
});
print(chartLST);
  
// Crear panel de leyenda
var legend = ui.Panel({
  style: {
    position: 'bottom-center',
    padding: '8px 15px',
    backgroundColor: 'white',
     margin: '9000px 600px 400px 1100px' // margin: 'top right bottom left'
  }
});

// Título de la leyenda
legend.add(ui.Label({
  value: 'Surface Temperature (°C)',
  style: {
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '0 0 8px 0'
  }
}));

// Rango de temperatura (ajústalo según lo que usaste en Map.addLayer)
var minLST = 11;
var maxLST = 55;
var steps = lstPalette2.length;
var stepSize = (maxLST - minLST) / (steps - 1);

// Crear los elementos de color y texto
for (var i = 0; i < steps; i++) {
  var color = lstPalette2[i];
  var value = (minLST + stepSize * i).toFixed(1);

  var colorBox = ui.Label('', {
    backgroundColor: color,
    padding: '10px',
    margin: '0'
  });

  var label = ui.Label(value + '°C', {
    margin: '0 0 4px 6px'
  });

  var row = ui.Panel({
    widgets: [colorBox, label],
    layout: ui.Panel.Layout.Flow('horizontal')
  });

  legend.add(row);
}

// Agregar la leyenda al mapa
Map.add(legend);
Map.setOptions('SATELLITE');