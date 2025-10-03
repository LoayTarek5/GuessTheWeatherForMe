import numpy as np
import pandas as pd


def clean(df: pd.DataFrame, param: str):
    df = df[(df[param] != -999) & (df[param].notna())].copy()
    return df


def get_mean(df: pd.DataFrame, param: str):
    df = clean(df, param)
    return df[param].mean()


def get_probability(df: pd.DataFrame, param: str, thres: int):
    df = clean(df, param)
    sub = df[param][df[param] > thres].count()
    total = df[param].count()
    return sub / total if total > 0 else 0


def predict_next(df: pd.DataFrame, param: str):
    df = clean(df, param)
    values = np.array(df[param])
    x = np.arange(len(values))

    line_coeffs = np.polyfit(x, values, 1)
    linear_trend_line = np.polyval(line_coeffs, x)
    residuals = values - linear_trend_line

    next_val = np.polyval(line_coeffs, len(values)) + np.mean(residuals[:-3])
    return next_val


def get_column(df: pd.DataFrame, param: str):
    df = clean(df, param)
    return df[param]


def get_min(df: pd.DataFrame, param: str):
    df = clean(df, param)
    return df[param].min()


def get_max(df: pd.DataFrame, param: str):
    df = clean(df, param)
    return df[param].max()


def prepareDateFrame(JSONRespnse: dict, required_date: str):
    df = pd.DataFrame(JSONRespnse)
    df.index = df.index.astype(str)
    required_day = required_date[6:8]
    required_month = required_date[4:6]
    df = df[(df.index.str[4:6] == required_month) & (df.index.str[6:8] == required_day)]
    return df


def get_result(JSONResponse: dict, required_date: str, parameters: dict):
    df = prepareDateFrame(JSONResponse, required_date)

    result: dict = {}
    for param, thres in parameters.items():
        result[param] = {
            "mean": get_mean(df, param),
            "probability": get_probability(df, param, thres),
            "forecastPrediction": predict_next(df, param),
            "previousDates": get_column(df, param),
            "min": get_min(df, param),
            "max": get_max(df, param)
        }

    return result


def get_csv(df: pd.DataFrame):
    return df.to_csv(index=True)
