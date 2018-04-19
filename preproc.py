#! /usr/bin/env python
import sys
import pandas

def load_data(filepath):
    series = pandas.read_csv(filepath, delimiter='\t')
    series['value'] = pandas.to_numeric(series['value'], errors='coerce')
    series['occupation_code'] = series['series_id'].map(lambda a: a[9:12])
    series['estimate_code'] = series['series_id'].map(lambda a: a[15:20])
    
    estimate_codes = series['estimate_code'].unique()
    data = pandas.DataFrame({'occupation_code': series['occupation_code'].unique()})
    for est_code in estimate_codes:
        data[est_code] = 0.0
        for _, r in series[series['estimate_code']==est_code].iterrows():
            data.loc[data['occupation_code']==r.occupation_code, est_code] = r.value
    
    return data

def preproc(inpath, outpath):
    data = load_data(inpath)
    data.to_csv(outpath, index=False)
    
if __name__=='__main__':
    inpath = 'ordata/or.data.1.AllData'
    outpath = sys.argv[1]
    preproc(inpath, outpath)