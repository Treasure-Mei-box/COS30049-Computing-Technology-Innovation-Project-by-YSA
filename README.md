# COS30049 Computing Technology Innovation Project (YSA)

A reproducible pipeline and repository for air quality analytics across Malaysia, Singapore, and Thailand. It includes data, notebooks for EDA and modeling (classification, regression, clustering), saved visualizations, and documentation.

## Executive Summary

Air pollution is one of the most pressing environmental challenges of the 21st century. Factors such as rapid industrial development, growing urban areas, vehicle emissions, and deforestation have all contributed to declining air quality worldwide.

This project focuses on building an AI-powered web application that uses machine learning to forecast air quality levels across multiple countries (**Thailand, Malaysia and Singapore**) and regions from **2014 to 2024**. The platform gathers historical meteorological data such as AQI index, temperature, relative humidity, and wind speed, and applies advanced models to analyze and predict air quality trends.

Three key machine learning models form the core of this system. **A Random Forest Tree Regression Model predicts Air Quality Index (AQI) values** based on weather conditions. **A DBSCAN Clustering Model groups cities and regions with similar AQI patterns**, highlighting areas that share comparable air quality characteristics. Lastly, a **Random Forest Classification Model is employed to label AQI values into specific air quality categories.** For example, AQI scores ranging from 0–50 are classified as *Good*, and those from 51–100 as *Moderate*, and so on.

By integrating predictive modeling and data visualization, the platform provides a comprehensive view of air quality patterns over time. The insights gained can support communities in monitoring air conditions and making informed decisions to promote cleaner, healthier environments.

## Repository Structure

- `data/` — Consolidated and country-level datasets
  - `FINAL_ANALYSIS.csv` (main analysis dataset)
  - `malaysia/`, `singapore/`, `thailand/` raw and clean subfolders
- `notebooks/` — Analysis and processing notebooks
  - `final_analysis_eda.ipynb` (cross-country EDA)
  - Country folders for detailed steps
- `models/` — Model training notebooks and outputs
  - `Classification AQI categories/ClassificationModels.ipynb`
  - `Regression/Random Forest Regression/Random_Forest_Regression.ipynb`
  - `Regression/XGBRegressor/XGBRegressor.ipynb`
  - `Clustering/DBSCAN/DBSCAN.ipynb`, `Clustering/KMeans/KMeans.ipynb`
- `visualizations/` — Generated figures (EDA summaries per country and combined)
- `docs/` — Reports, including `02_explanation_of_data_analysis.md`
- `src/` — Placeholder for application code (future web app integration)
- `README.md`, `requirements.txt`

---

## 1) Environment Setup

These steps were tested on macOS (zsh). Use absolute paths when possible.

### 1.1. Create and activate a virtual environment

```bash
# From the project root
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# On Windows (PowerShell): .venv\Scripts\Activate.ps1
```

### 1.2. Install dependencies (requirements up-to-date)

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

If you plan to run notebooks headlessly:

```bash
pip install jupyterlab nbconvert papermill
```

### 1.3. Verify data and paths

- Ensure `data/FINAL_ANALYSIS.csv` exists.
- Notebooks will create visualization output folders automatically where applicable.

---

## 2) End-to-End Workflows

### 2.1. Exploratory Data Analysis (EDA)

Interactive:

```bash
jupyter lab
```

Open and run: `notebooks/final_analysis_eda.ipynb`

Headless:

```bash
jupyter nbconvert \
  --to notebook --execute \
  --inplace \
  /Users/sharin/Downloads/COS30049/Assignment/Assignment_2/COS30049-Computing-Technology-Innovation-Project-by-YSA/notebooks/final_analysis_eda.ipynb
```

Outputs include EDA figures in `visualizations/final_analysis/` and a summary text file.

### 2.2. Classification (AQI categories)

Notebook: `models/Classification AQI categories/ClassificationModels.ipynb`

Interactive:

```bash
jupyter lab
```

Headless:

```bash
jupyter nbconvert \
  --to notebook --execute \
  --inplace \
  "/Users/sharin/Downloads/COS30049/Assignment/Assignment_2/COS30049-Computing-Technology-Innovation-Project-by-YSA/models/Classification AQI categories/ClassificationModels.ipynb"
```

Models: Logistic Regression, KNN, Random Forest Classifier.

### 2.3. Regression (numeric AQI)

Notebooks:

- `models/Regression/Random Forest Regression/Random_Forest_Regression.ipynb`
- `models/Regression/XGBRegressor/XGBRegressor.ipynb`

Headless example:

```bash
jupyter nbconvert \
  --to notebook --execute \
  --inplace \
  "/Users/sharin/Downloads/COS30049/Assignment/Assignment_2/COS30049-Computing-Technology-Innovation-Project-by-YSA/models/Regression/Random Forest Regression/Random_Forest_Regression.ipynb"
```

### 2.4. Clustering (unsupervised)

Notebooks:

- `models/Clustering/DBSCAN/DBSCAN.ipynb`
- `models/Clustering/KMeans/KMeans.ipynb`

These group regions with similar AQI behavior and produce country-level plots.

---

## 3) Using Trained Models for Prediction

Currently, notebooks produce metrics and figures. To generate predictions on new data, add cells to the end of the training notebook to save and load models, then apply to your input CSV.

Example cell to add:

```python
from joblib import dump, load
import pandas as pd

# Save
# dump(trained_model, "rf_classifier.joblib")

# Predict
# model = load("rf_classifier.joblib")
# new_data = pd.read_csv("/absolute/path/to/new_data.csv")
# preds = model.predict(new_data[feature_columns])
# pd.DataFrame({"prediction": preds}).to_csv("predictions.csv", index=False)
```

To parameterize and run headlessly with `papermill`, add parameter cells (`INPUT_CSV`, `OUTPUT_PRED_CSV`) and run:

```bash
papermill \
  "/abs/path/to/ClassificationModels.ipynb" \
  "/abs/path/to/ClassificationModels.out.ipynb" \
  -p INPUT_CSV "/abs/path/to/new_data.csv" \
  -p OUTPUT_PRED_CSV "/abs/path/to/predictions.csv"
```

---

## 4) Reproducibility and Configuration

- Notebooks assume project root at `/Users/sharin/Downloads/COS30049/Assignment/Assignment_2/COS30049-Computing-Technology-Innovation-Project-by-YSA`. Update the first cell constant if your path differs.
- Use stratified/time-aware splits when evaluating; avoid leakage across time/regions.
- Set random seeds for reproducibility of results.

---

## 5) Students

| # | Name | Student ID |
| --- | --- | --- |
| 1 | **Yadanar Theint** | **104992813 / J22037276** |
| 2 | **Shin Thant Thi Ri** | **104842811 / J22037681** |
| 3 | **Aung Si Hein** | **105229693 / J23039263** |

---

## 6) Troubleshooting

- If plots do not appear: ensure output directories exist; notebooks create them if missing.
- If paths break: update `PROJECT_ROOT` in notebooks.
- If dependency issues occur: recreate the virtual environment and reinstall from `requirements.txt`.

---

## 7) Citations and Acknowledgements

- Data sources:
  - Open-Meteo Historical Weather API: [open-meteo.com](https://open-meteo.com/en/docs/historical-weather-api?timezone=Asia%2FBangkok&start_date=2023-01-01&latitude=13.7563&longitude=100.5018&end_date=2023-12-31#settings)
  - Thailand AQI Map: [aqicn.org/map/thailand](https://aqicn.org/map/thailand/)
  - Malaysia AQI Map: [aqicn.org/map/malaysia](https://aqicn.org/map/malaysia/)
  - Singapore Government Data Portal: [data.gov.sg](https://data.gov.sg)
- See `docs/02_explanation_of_data_analysis.md` for methodology and interpretation.
- Acknowledgements to data providers and open-source libraries used in this project.
