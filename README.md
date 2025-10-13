# AirAware - Air Quality and Health Analysis

## Project Overview
This project investigates and analyzes air quality and its potential impacts on health, with a focus on COPD (Chronic Obstructive Pulmonary Disease). We apply machine learning techniques for prediction, attribution, and classification of AQI-related data to improve understanding and management of health risks.

## Project Structure
```
AirAware/
├── data/                           # Raw and processed datasets
│   ├── singapore/                  # Complete
│   ├── thailand/                   # 🔄 In Progress
│   └── malaysia/                   # 🔄 In Progress
├── notebooks/                      # Jupyter notebooks for analysis
│   ├── Singapore/                  
│   │   ├── singapore_data_cleaning_processing.ipynb
│   │   └── singapore_data_merging_analysis.ipynb
│   ├── Thailand/                   
│   └── Malaysia/                   
├── docs/                           # Documentation
│   ├── data_processing_guide.md   # Guide for Thailand/Malaysia teams
│   └── report/                     # Assignment reports
├── models/                        
├── visualizations/                 # Generated plots and charts
└── README.md                       # Project documentation
```

## Setup Instructions

### Environment Setup

#### Quick Setup (Recommended)
Run the all-in-one setup and test script:
```bash
./setup_environment.sh
```
This script will install all dependencies and verify that your environment is correctly configured.

#### Manual Setup
1. Install Anaconda (if not already installed):
   - Download from [Anaconda website](https://www.anaconda.com/products/distribution)

2. Create and activate a conda environment:
   ```bash
   conda create -n airaware python=3.10
   conda activate airaware
   ```

3. Install required packages:
   **Using pip directly:**
   ```bash
   pip install -r requirements.txt
   ```

4. Verify your environment:
   ```bash
   python test_imports.py
   ```

### Data Collection
The project uses air quality data from multiple sources:
- OpenAQ API
- World Air Quality Index
- WHO Global Ambient Air Quality Database
- Weather data (for correlation analysis)

Data collection scripts are provided in the `src/data_collection` directory.

## Models
This project implements multiple machine learning models:
- Regression models for predicting AQI values
- Classification models for categorizing health risk levels
- Optional: Clustering models for identifying patterns in air quality data

## Team Members
- SHIN THANT THI RI
- YADANAR THEINT
- AUNG SI HEIN

## References
- [Additional references will be added as the project progresses]
