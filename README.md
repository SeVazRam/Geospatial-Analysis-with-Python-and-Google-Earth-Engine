# Analysis of Temperature, Precipitation, and Land Surface Data in Mexico (2013–2024)

## Description
This project analyzes the evolution of average temperature and precipitation in Mexico between 2013 and 2023, based on official datasets from CONABIO and CONAGUA.  
Additionally, it includes Land Surface Temperature (LST) and Normalized Difference Vegetation Index (NDVI) analysis using Google Earth Engine.

The project is organized into three main parts:
1. Temperature Analysis (2013–2023)
2. Precipitation Analysis (2013)
3. Land Surface Temperature Analysis via Google Earth Engine

---

## Data Sources
- [Monthly Temperature and Precipitation Summaries - CONAGUA Portal](https://smn.conagua.gob.mx/es/climatologia/temperaturas-y-lluvias/resumenes-mensuales-de-temperaturas-y-lluvias)
- Google Earth Engine Datasets (LANDSAT 8, MODIS)

---

# 📈 Part 1: Average Temperature Analysis (2013–2023)

## Methodology
- Datasets from 2013 to 2023 were processed using ETL pipelines developed in Python.
- `GeoPandas` was used to clean and prepare spatial data for plotting.
- Annual heatmaps were created to visualize average temperature by state.
- A time-series analysis was conducted to examine temperature trends.

## Structure
- **Notebooks Folder**:  
  - Individual notebooks for each year (e.g., `TMed2013.ipynb`) demonstrating the ETL and visualization process.
  - `AnimacionMapaCalor.ipynb`: consolidates results and generates an animated GIF showing temperature evolution across the years.
  - A simple linear regression model estimates the year-over-year temperature increase.

## Outputs
- **Images/MapasCalor**: annual heatmaps of Mexico by state.
- **Images/GIFs**: animated temperature evolution from 2013 to 2023.

---

# 🌧️ Part 2: Precipitation Analysis (2013)

## Methodology
- Precipitation data from 2013 (`/Data/2013MM010000Lluv.csv`) was processed.
- Cleaning operations were applied to structure the data appropriately.
- `Basemap` (Python) was used to plot precipitation levels across Mexican counties.

## Structure
- **Notebooks Folder**:  
  - `Precs2013.ipynb`: shows full workflow from raw data to precipitation map.

---

# 🌎 Part 3: Land Surface Temperature (LST) and NDVI Analysis (Google Earth Engine)

## Methodology
- Scripts in JavaScript were developed for Google Earth Engine (GEE).
- Geometries and analysis scripts enable extraction of:
  - Land Surface Temperature (LST)
  - Normalized Difference Vegetation Index (NDVI)

## Structure
- **Scripts_GEE Folder**:
  - `LST_NDVI.js`: extraction of LST and NDVI from LANDSAT 8 imagery.
  - `NDVI_legend.js`: adds a legend to NDVI maps.
  - `LST_NDVI_TS_13_24.js`: creates LST/NDVI time series from 2013–2024.
  - `MODIS_day_night_comparison.js`: analyzes day/night temperature differences using MODIS data.

---

## How to Run
1. Clone this repository.
2. For Temperature and Precipitation Analysis:
   - Navigate to `/Notebooks/`
   - Open the corresponding Jupyter notebooks and run them sequentially.
3. For LST/NDVI Analysis:
   - Access [Google Earth Engine](https://earthengine.google.com/).
   - Upload and run scripts located in the `/Scripts_GEE/` folder.

---

## Results
- Visualized annual changes in average temperatures across Mexico.
- Detected year-by-year increase in average temperature through linear regression.
- Developed precipitation distribution maps at the municipal level.
- Extracted and visualized LST and NDVI patterns over time using remote sensing data.

---

## Contact
Author: **Sebastián Vázquez Ramírez**  
Email: sebas.vaz.ra@gmail.com  
GitHub: [github.com/SeVazRam](https://github.com/SeVazRam)
