The data used in the project come from the federal portal of CONABIO/CONAGUA

https://smn.conagua.gob.mx/es/climatologia/temperaturas-y-lluvias/resumenes-mensuales-de-temperaturas-y-lluvias

The project aims to analyze the evolution of the average temperature in Mexico in the range of 2013-2023 according to CONABIO data. The results are found in the images folder with the subfolders MapasCalor (Average temperature by state) and a gif that combines the heat maps obtained.

In the Notebooks folder it has been divided into different notebooks so that the analysis can be seen more easily by year.

In the Notebooks folder (TMed2013.ipynb) it shows how to work with the conabio data (folder 2013, the data can be downloaded directly) as well as performing an ETL process, together with GeoPandas, to obtain clean data to later plot a heat map. Following a similar process, clean data from 2013 to 2023 is obtained (Data/emp2013to2023). Follow this notebook as a guide.

The notebook AnimacionMapaCalor.ipynb (Gathers all the results and makes an animation with this, a graph of the increase in temperature per year in the country). It also performs a simple regression to see the year-by-year increase in temperature.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
******************************************************************************************************************************************************************************************************************
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Part 2 analysis of precipitation data from Conabio

Similar to part 1. Precs2013.ipynb loads the precipitation data from the conabio found in the github folder /Data/2013MM010000Lluv.csv. The notebook shows how once the data is cleaned, the results are plotted on a county map using BASEMAP python.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
******************************************************************************************************************************************************************************************************************
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Part 3 Analysis of land surface temperature in Google Earth Engine.

In the Scripts_GEE folder, you will find JS files for running in Google Earth Engine. There is a folder with geometries to use, as well as five files that show in a simple way how to obtain Land Surface Temperature (LST) and Normalized Difference Vegetation Index (NDVI) values. The first example is LANDSAT 8, LST_NDVI.js.

In addition, it shows how to add legends (NDVI_leyend), time series (file LST_NDVI_TS_13_24), and differences between early and night time with MODIS.
