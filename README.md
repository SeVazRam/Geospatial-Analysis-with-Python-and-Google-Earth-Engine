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
