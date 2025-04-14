Map.addLayer(aoi, {}, 'AOI - CDMX');
Map.centerObject(aoi, 10);

// Definir las fechas de inicio y fin para la colección de imágenes
var startDate = '2024-01-01';
var endDate = '2024-12-31';

// Función para aplicar factores de escala a las bandas ópticas y térmicas
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

// Función para enmascarar nubes y sombras de nubes en imágenes Landsat 8
function cloudMask(image) {
  var cloudShadowBitmask = (1 << 3);
  var cloudBitmask = (1 << 5);
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(cloudShadowBitmask).eq(0)
                .and(qa.bitwiseAnd(cloudBitmask).eq(0));
  return image.updateMask(mask);
}

// Importar la colección de imágenes Landsat 8, aplicar filtros y funciones
var landsatCollection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                            .filterBounds(aoi)
                            .filterDate(startDate, endDate)
                            .map(applyScaleFactors)
                            .map(cloudMask);

// Calcular la mediana de la colección de imágenes
var medianImage = landsatCollection.median().clip(aoi);

// Calcular el Índice de Vegetación de Diferencia Normalizada (NDVI)
var ndvi = medianImage.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');


//añadir paleta NDVI

// Paleta y etiquetas asociadas
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

// Añadir las capas al mapa
Map.addLayer(ndvi, {min: -1, max: 1, 
            palette: ndviPalette},'NDVI');

/////////////////////////////////////////////////////////////// Panel contenedor
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px',
    backgroundColor: 'rgba(255,255,255,0.8)'
  }
});

// Título
legend.add(ui.Label({
  value: 'NDVI index',
  style: {
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '0 0 6px 0'
  }
}));

// Agregar cada color y etiqueta
for (var i = 0; i < ndviPalette.length; i++) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: ndviPalette[i],
      padding: '8px',
      margin: '2px',
      width: '20px'
    }
  });

  var label = ui.Label({
    value: ndviLabels[i],
    style: {margin: '2px 6px'}
  });

  var row = ui.Panel({
    widgets: [colorBox, label],
    layout: ui.Panel.Layout.flow('horizontal')
  });

  legend.add(row);
}

// Agregar leyenda al mapa
Map.add(legend);
/////////////////////////////////////////////////////////////////////////////////////////////
Export.image.toDrive({
  image: ndvi, // o LST u otra imagen
  description: 'NDVI_CDMX_2024',
  folder: 'GEE_exports',     // nombre de carpeta en tu Google Drive
  fileNamePrefix: 'ndvi_cdmx_2024',
  region: aoi.geometry(),    // área de interés (puede ser aoi o geometría personalizada)
  scale: 30,                 // resolución espacial (Landsat = 30m)
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});
