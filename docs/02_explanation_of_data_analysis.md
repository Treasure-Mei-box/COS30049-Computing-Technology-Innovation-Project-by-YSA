# 2) Explanation of Data Analysis

This section details the methods used to analyze `data/FINAL_ANALYSIS.csv` and interprets the resulting insights. Visualizations referenced below are saved in `visualizations/final_analysis/`.

## 2.1 Dataset Overview and Preparation

- We loaded `FINAL_ANALYSIS.csv` with parsed `Date` and verified structure: `Country`, `Region`, `Date`, numeric metrics (`AQI`, `Temperature`, `RelativeHumidity`, `WindSpeed`), calendar features (`Year`, `Month`, `Quarter`, `MonthName`), and `AQI_Category`.
- We profiled missingness across columns to assess data quality and potential bias in time or region coverage (see `00_missingness.png`). Missingness is generally low and does not cluster in a single variable, suggesting analyses are representative after listwise handling for specific plots.

## 2.2 Univariate Distributions

- We examined the distribution of numeric variables (`01_distributions.png`).
  - `AQI` is moderately right-skewed, indicating occasional degraded air quality periods.
  - `Temperature` and `RelativeHumidity` reflect expected climatic ranges across the three countries.
  - `WindSpeed` shows lower central tendency with a long tail, consistent with intermittent gusts.

## 2.3 Correlations among Variables

- A correlation heatmap (`02_correlation_heatmap.png`) summarizes linear relationships.
  - `AQI` vs `RelativeHumidity`: typically weak-to-moderate positive/negative depending on seasonality and region; overall modest linear association.
  - `AQI` vs `Temperature`: weak correlation overall; effects likely seasonal and region-specific.
  - `AQI` vs `WindSpeed`: generally weak negative association (higher wind disperses pollutants) but with considerable variability.
- These patterns suggest limited purely linear signal from single weather features; interactions and nonlinearities may be present.

## 2.4 Temporal Patterns

- Country-level time series (`03_time_series_aqi_by_country.png`) show clear temporal dynamics with episodic spikes in AQI.
- Yearly averages by country (`04_yearly_avg_aqi.png`) indicate gradual, country-specific trends rather than a uniform pattern.
- Monthly seasonality (`05_monthly_avg_aqi.png`) reveals recurring seasonal signatures; some months are consistently higher for certain countries, likely influenced by monsoon cycles and transboundary haze events.

## 2.5 Regional Differences

- Regional AQI distributions by country (`06_regional_boxplots.png`) show variability within each country.
  - Wider IQRs and outliers indicate heterogeneous pollution exposure across regions.
  - Some metropolitan or industrial regions present higher medians and upper tails.

## 2.6 AQI Category Profiles

- Category counts by country (`07_aqi_category_by_country.png`) show that most observations fall under `Good`/`Moderate`, with fewer `Unhealthy` or worse categories.
- Class imbalance is present, which has implications for classification model evaluation (use stratification, class-weighting, or resampling).

## 2.7 AQI–Weather Relationships

- Scatter plots (`08_aqi_vs_weather_scatter.png`) indicate weak global linear relationships.
  - Patterns are often country-dependent; the same weather metric can correspond to different AQI ranges by country/region and season.
  - This supports trying models that can learn interactions and nonlinear effects.

## 2.8 Implications for Modeling

- Classification target: `AQI_Category`. Due to class imbalance and nonlinear effects:
  - Start with Logistic Regression as a linear baseline with class weights.
  - KNN can capture local structures but may be sensitive to scale and class skew; standardization recommended.
  - Random Forest Classifier is promising for nonlinearities and interactions, robust to scaling, and can handle mixed signals.
- Regression target: numeric `AQI`.
  - Linear Regression provides an interpretable baseline but may underfit.
  - Random Forest Regressor can capture seasonality-like nonlinearities and complex feature interactions.

## 2.9 Evaluation Considerations

- Train/validation splitting should respect temporal order and geographic grouping to prevent leakage (e.g., group by `Region` or use time-based splits).
- Use stratified splits for category prediction; consider macro-averaged metrics (F1, recall) given imbalance.
- For regression, report MAE and RMSE; for classification, report accuracy, macro-F1, and confusion matrices.

## 2.10 Key Takeaways

- AQI exhibits temporal spikes and regional variability; weather covariates show weak global linear correlation with AQI.
- Nonlinear and interaction-aware models (Random Forests) are likely to outperform strictly linear models.
- However, linear baselines remain valuable for interpretability and as sanity checks.

The above insights will guide final model selection after validating performance on properly split datasets.
