#! /usr/bin/env python
import sys
import pandas

def load_data():
    series = pandas.read_csv(
        'ordata/or.data.1.AllData', 
        delimiter='\t',
        index_col=False,
        usecols=['series_id', 'value']
    )
    series['value'] = pandas.to_numeric(series['value'], errors='coerce')
    series['occupation_code'] = series['series_id'].map(lambda a: a[9:12])
    series['estimate_code'] = series['series_id'].map(lambda a: a[15:20])
    
    occupations = pandas.read_csv(
        'ordata/or.occupation', 
        delimiter='\t', 
        index_col=False,
        dtype={'occupation_code': str, 'soc_code': str}, 
        usecols=['occupation_code', 'soc_code']
    )
    # convert from ONETSOC to SOC code
    occupations['soc_code'] = occupations['soc_code'].map(lambda a: a[:6])
    series = occupations.merge(series, on='occupation_code')

    estimate_values_by_soc = series.groupby(by=('soc_code', 'estimate_code'))['value'].mean()

    return estimate_values_by_soc.to_frame().pivot_table(
        index="soc_code", 
        columns="estimate_code", 
        values="value")

def preproc(outpath):
    data = load_data()
    print(data.head())
    data.to_csv(outpath)
    
if __name__=='__main__':
    outpath = sys.argv[1]
    preproc(outpath)