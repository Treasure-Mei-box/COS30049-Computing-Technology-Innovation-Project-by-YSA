import pandas as pd
import numpy as np
import re

# INPUT / OUTPUT
FNAME = "Khon Kaen.csv"         # change if needed
OUT = "Khon Kaen_Daily.csv"

df_try = pd.read_csv(FNAME, nrows=5)
first_col_name = df_try.columns[0]

# Heuristic: if first value of first column looks like an ISO timestamp, use header=0,
# otherwise assume headerless and set names manually later.
sample_first = df_try.iloc[0, 0]
is_timestamp_like = isinstance(sample_first, str) and re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}', sample_first)

if is_timestamp_like:
    df = pd.read_csv(FNAME)
else:
    # headerless assumed: keep only first 3 columns if more
    df = pd.read_csv(FNAME, header=None)
    # give sensible names: time + remaining columns generically
    ncols = df.shape[1]
    names = ["time"] + [f"col{i}" for i in range(1, ncols)]
    df.columns = names

# 2) Clean column names (strip, remove BOM, simplify)
df.columns = df.columns.str.strip().str.replace('\ufeff', '', regex=False)
# optional: make simpler safe names (remove spaces/symbols)
safe_cols = []
for c in df.columns:
    # keep 'time' as-is
    if c.lower() == 'time':
        safe_cols.append('time')
    else:
        s = re.sub(r'[^\w]+', '_', c).strip('_').lower()  # e.g. "temperature_2m_(°C)" -> "temperature_2m_c"
        s = s.replace('degreec', 'c').replace('c_', 'c')
        safe_cols.append(s)
df.columns = safe_cols

# 3) Parse 'time' column
if 'time' not in df.columns:
    # assume first column is time
    df = df.rename(columns={df.columns[0]: 'time'})

df['time'] = pd.to_datetime(df['time'], format='%Y-%m-%dT%H:%M', errors='coerce')
df = df.dropna(subset=['time'])

# 4) Select numeric columns (everything except time)
num_cols = df.columns.difference(['time']).tolist()

# 5) Clean numeric columns: strip spaces, remove non-numeric chars commonly found
for col in num_cols:
    # convert to string then strip unwanted characters before numeric cast
    df[col] = df[col].astype(str).str.strip().str.replace('\ufeff','', regex=False)
    df[col] = df[col].str.replace(',', '', regex=False)          # remove thousands comma
    # allow negative sign, digits, dot; replace other chars with ''
    df[col] = df[col].str.replace(r'[^0-9\.\-]', '', regex=True)
    df[col] = pd.to_numeric(df[col], errors='coerce')

# 6) Set time index and resample to daily mean
df = df.set_index('time')
daily = df[num_cols].resample('D').mean()

# 7) Round to 2 decimals (numeric)
daily = daily.round(2)

# 8) Save single CSV with 2-decimal formatting
daily.to_csv(OUT, float_format="%.2f", index=True, index_label='date')

print(f"✅ Saved daily averages to {OUT}")
print("Columns averaged:", num_cols)
print(daily.head())
