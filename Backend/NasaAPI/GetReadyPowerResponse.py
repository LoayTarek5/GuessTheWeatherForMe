from datetime import datetime, timedelta
from ..WeatherBackend_IO.WeatherRequest import WeatherRequest
from NasaPowerAPICalling import CallPowerAPI
from NasaAPIRequestInput import NasaAPIRequestInput

DEFAULT_START_DATE = "20100101"
END_DATE_BACKWARD_COMPATABLE = (datetime.today() - timedelta(days=365)).strftime("%Y%m%d")
DEFAULT_END_DATE = (datetime.today() - timedelta(days=10)).strftime("%Y%m%d")


def GetReadyPowerApiResponse(weatherRequestInput: WeatherRequest):
    # validate future date
    # validate long and lat maybe
    # validate if the threshHolds are valid (exist in our supported parameters or not) with valid values

    finalEndDate = DEFAULT_END_DATE

    futureDate = datetime.strptime(weatherRequestInput.FutureDate, "%Y%m%d")
    today = datetime.today()
    previousTenDays = today - timedelta(days=10)

    if futureDate.month == today.month and futureDate >= previousTenDays:
        finalEndDate = END_DATE_BACKWARD_COMPATABLE

    nasaApiInput = NasaAPIRequestInput(DEFAULT_START_DATE, finalEndDate, weatherRequestInput.longitude,
                                       weatherRequestInput.latitude, weatherRequestInput.threshHolds)

    response = CallPowerAPI(nasaApiInput)

    return response
