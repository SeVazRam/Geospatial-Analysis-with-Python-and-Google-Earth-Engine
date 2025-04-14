Map.addLayer(aoi, {}, 'AOI - CDMX');
Map.addLayer(g_cs, {}, 'g_cs - CDMX');
Map.addLayer(g_urban, {}, 'g_urban - CDMX');
Map.centerObject(aoi, 10);

// ----------------- PARTE 1: CONFIGURACIÓN -----------------
var startDate = '2014-01-01';
var endDate = '2024-12-31';

var lstPalette = [
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
// ----------------- MODIS LAND COVER DATA -----------------

var modisLandCover = ee.ImageCollection("MODIS/061/MCD12Q1")
                       .mode()
                       .select('LC_Type1');
                       
// 4. Visualize Land Cover Data
var landCoverVisualization = {
  min: 11.0,
  max: 55.0,
  palette: lstPalette ,
};

// Función para agregar por año
function annualMeanLST(collection) {
  return ee.ImageCollection(
    ee.List.sequence(2014, 2024).map(function(year) {
      var start = ee.Date.fromYMD(year, 1, 1);
      var end = start.advance(1, 'year');
      
      var meanImage = collection
        .filterDate(start, end)
        .mean()
        .set('year', year)
        .set('system:time_start', start.millis()); // Para que el eje X funcione

      return meanImage;
    })
  );
}



var lstDay = ee.ImageCollection("MODIS/061/MOD11A2")
  .select('LST_Day_1km')
  .filterDate(startDate, endDate)
  .map(function(image) {
    return image.multiply(0.02).subtract(273.15)
      .copyProperties(image, image.propertyNames());
  });

var lstNight = ee.ImageCollection("MODIS/061/MOD11A2")
  .select('LST_Night_1km')
  .filterDate(startDate, endDate)
  .map(function(image) {
    return image.multiply(0.02).subtract(273.15)
      .copyProperties(image, image.propertyNames());
  });
  
var lstDayAnnual = annualMeanLST(lstDay);
var lstNightAnnual = annualMeanLST(lstNight);


// ----------------- PARTE 3: SERIES DE TIEMPO -----------------
// Gráfica para LST Diurna (promedio anual)
print(
  ui.Chart.image.series({
    imageCollection: lstDayAnnual,
    region: aoi,
    reducer: ee.Reducer.mean(),
    scale: 500,
    xProperty: 'system:time_start'
  }).setOptions({
    title: 'Average Annual Daytime LST in Mexico City (2014–2024)',
    hAxis: {title: 'Year', format: 'yyyy'},
    vAxis: {title: 'Temperature (°C)'},
    lineWidth: 2,
    pointSize: 4,
    colors: ['#d6662c']
  })
);
//////////////////////////////////////////////////////////
var lstDayTable = ui.Chart.image.series({
  imageCollection: lstDayAnnual,
  region: aoi,
  reducer: ee.Reducer.mean(),
  scale: 500,
  xProperty: 'system:time_start'
}).setChartType('Table')
  .setOptions({
    title: 'Valores de LST Diurna por Año',
    hAxis: {title: 'Year'},
    vAxis: {title: 'Temperatura (°C)'}
  });
  
print(lstDayTable);  
//////////////////////////////////////////////////////////
// Gráfica para LST Nocturna (promedio anual)
print(
  ui.Chart.image.series({
    imageCollection: lstNightAnnual,
    region: aoi,
    reducer: ee.Reducer.mean(),
    scale: 500,
    xProperty: 'system:time_start'
  }).setOptions({
    title: 'Average Annual Nighttime LST in Mexico City(2014–2024)',
    hAxis: {title: 'Year', format: 'yyyy'},
    vAxis: {title: 'Temperature (°C)'},
    lineWidth: 2,
    pointSize: 4,
    colors: ['#191970']
  })
);
/////////////////////////////////////////////////////////////
var lstNightTable = ui.Chart.image.series({
  imageCollection: lstNightAnnual,
  region: aoi,
  reducer: ee.Reducer.mean(),
  scale: 500,
  xProperty: 'system:time_start'
}).setChartType('Table')
  .setOptions({
    title: 'Valores de LST Diurna por Año',
    hAxis: {title: 'Año'},
    vAxis: {title: 'Temperatura (°C)'}
  });

print(lstNightTable);
///////////////////// PARTE 4.- graficas urban zone and countryside ///////////////////////
// Gráfica para LST Diurna (promedio anual)
print(
  ui.Chart.image.series({
    imageCollection: lstDayAnnual,
    region: g_urban,
    reducer: ee.Reducer.mean(),
    scale: 500,
    xProperty: 'system:time_start'
  }).setOptions({
    title: 'Average Annual Daytime LST (g_urban) in Mexico City (2014–2024)',
    hAxis: {title: 'Year', format: 'yyyy'},
    vAxis: {title: 'Temperature (°C)'},
    lineWidth: 2,
    pointSize: 4,
    colors: ['#e31a1c']
  })
);

print(
  ui.Chart.image.series({
    imageCollection: lstDayAnnual,
    region: g_cs,
    reducer: ee.Reducer.mean(),
    scale: 500,
    xProperty: 'system:time_start'
  }).setOptions({
    title: 'Average Annual Daytime LST (g_cs) in Mexico City (2014–2024)',
    hAxis: {title: 'Year', format: 'yyyy'},
    vAxis: {title: 'Temperature (°C)'},
    lineWidth: 2,
    pointSize: 4,
    colors: ['#191970']
  })
);

////////////////////////////////GRAFICA SUHI EARLY/////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////
// Gráfica para LST Nocturna (promedio anual)
print(
  ui.Chart.image.series({
    imageCollection: lstNightAnnual,
    region: g_urban,
    reducer: ee.Reducer.mean(),
    scale: 500,
    xProperty: 'system:time_start'
  }).setOptions({
    title: 'Average Annual Nighttime LST(g_urban) in Mexico City(2014–2024)',
    hAxis: {title: 'Year', format: 'yyyy'},
    vAxis: {title: 'Temperature (°C)'},
    lineWidth: 2,
    pointSize: 4,
    colors: ['#e31a1c']
  })
);

print(
  ui.Chart.image.series({
    imageCollection: lstNightAnnual,
    region: g_cs,
    reducer: ee.Reducer.mean(),
    scale: 500,
    xProperty: 'system:time_start'
  }).setOptions({
    title: 'Average Annual Nighttime LST(g_cs) in Mexico City(2014–2024)',
    hAxis: {title: 'Year', format: 'yyyy'},
    vAxis: {title: 'Temperature (°C)'},
    lineWidth: 2,
    pointSize: 4,
    colors: ['#191970']
  })
);

///////////////////// PARTE 5.- graficas merge urban zone and countryside ///////////////////////
// Extraer geometría si son FeatureCollections
var g_cs_geom = g_cs.geometry();
var g_urban_geom = g_urban.geometry();

// Crear FeatureCollection con etiquetas
var regionsList = ee.FeatureCollection([
  ee.Feature(g_cs_geom, {'label': 'Countryside'}),
  ee.Feature(g_urban_geom, {'label': 'Urban'})
]);

// Gráfica combinada para regiones
var annualChartLST_day = ui.Chart.image.seriesByRegion({
  imageCollection: lstDayAnnual,
  regions: regionsList,
  reducer: ee.Reducer.mean(),
  scale: 30,
  xProperty: 'system:time_start',
  seriesProperty: 'label'
})
.setChartType('ScatterChart')
.setOptions({
  title: 'Comparison between the annual daytime average of urban and rural LST - CDMX (2014-2024)',
  lineWidth: 2,
  pointSize: 5,
  interpolateNulls: true,
  vAxis: {title: 'Temperature (°C)'},
  hAxis: {
    title: 'Year',
    format: 'yyyy'
  },
  colors: ['#1f78b4', '#e31a1c']
});

print(annualChartLST_day);

/////////////////////////////////// Night Graph ////////////////////////

// Gráfica combinada para regiones
var annualChartLST_night = ui.Chart.image.seriesByRegion({
  imageCollection: lstNightAnnual,
  regions: regionsList,
  reducer: ee.Reducer.mean(),
  scale: 30,
  xProperty: 'system:time_start',
  seriesProperty: 'label'
})
.setChartType('ScatterChart')
.setOptions({
  title: 'Comparison between the annual nighttime average of urban and rural LST - CDMX (2014-2024)',
  lineWidth: 2,
  pointSize: 5,
  interpolateNulls: true,
  vAxis: {title: 'Temperature (°C)'},
  hAxis: {
    title: 'Year',
    format: 'yyyy'
  },
  colors: ['#1f78b4', '#e31a1c']
});

print(annualChartLST_night);

////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////

// Función para crear una FeatureCollection con SUHI diurno y nocturno
var suhiYearly = ee.FeatureCollection(
  ee.List.sequence(2014, 2024).map(function(year) {
    var date = ee.Date.fromYMD(year, 1, 1);

    var dayImage = lstDayAnnual.filter(ee.Filter.eq('year', year)).first();
    var nightImage = lstNightAnnual.filter(ee.Filter.eq('year', year)).first();

    // Reducir a promedios por región
    var urbanDay = dayImage.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: g_urban,
      scale: 1000,
      maxPixels: 1e13
    }).get('LST_Day_1km');  // Banda renombrada

    var ruralDay = dayImage.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: g_cs,
      scale: 1000,
      maxPixels: 1e13
    }).get('LST_Day_1km');

    var urbanNight = nightImage.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: g_urban,
      scale: 1000,
      maxPixels: 1e13
    }).get('LST_Night_1km');

    var ruralNight = nightImage.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: g_cs,
      scale: 1000,
      maxPixels: 1e13
    }).get('LST_Night_1km');

    // Calcular SUHI
    var suhi_day = ee.Number(urbanDay).subtract(ee.Number(ruralDay));
    var suhi_night = ee.Number(urbanNight).subtract(ee.Number(ruralNight));

    return ee.Feature(null, {
      'year': year,
      'system:time_start': date.millis(),
      'SUHI_Day': suhi_day,
      'SUHI_Night': suhi_night
    });
  })
);

var suhiChart = ui.Chart.feature.byFeature({
  features: suhiYearly,
  xProperty: 'system:time_start',
  yProperties: ['SUHI_Day', 'SUHI_Night']
}).setOptions({
  title: 'Annual SUHI (Day vs Night) - CDMX (2014–2024)',
  hAxis: {title: 'Year', format: 'yyyy'},
  vAxis: {title: 'SUHI (°C)'},
  lineWidth: 2,
  pointSize: 5,
  colors: ['#e31a1c', '#1f78b4'],  // Rojo para día, azul para noche
  legend: {position: 'bottom'}
});

print(suhiChart);


// Calcular el promedio de todos los años para SUHI Día y Noche
var suhi_day_mean = suhiYearly.aggregate_mean('SUHI_Day');
var suhi_night_mean = suhiYearly.aggregate_mean('SUHI_Night');

// Evaluar e imprimir
ee.Dictionary({
  'Promedio SUHI Día (°C)': suhi_day_mean,
  'Promedio SUHI Noche (°C)': suhi_night_mean
}).evaluate(function(dict) {
  print('📊 Promedio SUHI (2014–2024):');
  print('SUHI Día promedio:', dict['Promedio SUHI Día (°C)'].toFixed(2), '°C');
  print('SUHI Noche promedio:', dict['Promedio SUHI Noche (°C)'].toFixed(2), '°C');
});


// Imprimir SUHI año por año
suhiYearly.evaluate(function(fc) {
  print('🟡 SUHI (°C) por año:');

  fc.features.forEach(function(f) {
    var year = f.properties.year;
    var suhi_day = f.properties.SUHI_Day;
    var suhi_night = f.properties.SUHI_Night;

    print('year ' + year + ': SUHI Day = ' + suhi_day.toFixed(2) + ' °C, SUHI Night = ' + suhi_night.toFixed(2) + ' °C');
  });
});

