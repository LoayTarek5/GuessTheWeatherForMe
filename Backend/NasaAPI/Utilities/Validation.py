"""


what do validate ?

1- Parameters [✅]
2- FutureDate => YMD format/ is not in the past and in a 1 year from now range
3- Check Parameters values ( must be valid ) [✅]

T2M -> temp
WS2M -> wind speed
PRECTOTCORR -> precipitation (mainly for rainfall and snowfall)
RH2M -> humidity
CLOUD_AMT -> cloud amount
AOD_55 -> aerosol (dust, haze, smoke, fog)
SNODP -> snow depth

"""

from fastapi import HTTPException

VALID_PARAMETERS = {"T2M", "WS2M", "PRECTOTCORR", "RH2M", "CLOUD_AMT", "AOD_55", "SNODP"}
FUTURE_THRESH_HOLD_IN_YEARS = 1


# very bad code design don't try that at home
def validate_parameters(params: dict[str, float]) -> bool:
    for param, value in params.items():
        if param not in VALID_PARAMETERS:
            raise HTTPException(status_code=400, detail=f"Invalid parameter: {param}")

        if param in {"RH2M", "CLOUD_AMT"}:
            if not (0 <= value <= 100):
                raise HTTPException(status_code=400, detail=f"{param} must be between 0 and 100")
        elif param == "T2M":
            if not (-100 <= value <= 60):
                raise HTTPException(status_code=400, detail=f"{param} seems unrealistic: {value}")
        elif param == "WS2M":
            if value < 0:
                raise HTTPException(status_code=400, detail=f"{param} must be >= 0")
        elif param == "PRECTOTCORR":
            if value < 0:
                raise HTTPException(status_code=400, detail=f"{param} must be >= 0")
        elif param == "AOD_55":
            if not (0 <= value <= 10):
                raise HTTPException(status_code=400, detail=f"{param} must be between 0 and 10")
        elif param == "SNODP":
            if value < 0:
                raise HTTPException(status_code=400, detail=f"{param} must be >= 0")

    return True


def validateDate(date_str: str) -> bool:
    from datetime import datetime, timedelta

    try:
        date = datetime.strptime(date_str, "%Y%m%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Date must be in YYYYMMDD format")

    today = datetime.now()
    one_year_later = today + timedelta(days=365 * FUTURE_THRESH_HOLD_IN_YEARS)

    if date < today:
        raise HTTPException(status_code=400, detail="Date cannot be in the past nor today")
    if date > one_year_later:
        raise HTTPException(status_code=400, detail=f"Date cannot be more than {FUTURE_THRESH_HOLD_IN_YEARS} year in the future")

    return True
