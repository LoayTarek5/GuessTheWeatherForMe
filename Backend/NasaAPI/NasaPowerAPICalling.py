from NasaAPIRequestInput import NasaAPIRequestInput
from requests import request as req

BASEURL = "https://power.larc.nasa.gov/api/temporal/"
CALLING_TYPE = ["hourly", "daily", "monthly"]
API_POINT = ["point", "regional"]


def CallPowerAPI(nasaRequestInput: NasaAPIRequestInput):
    endPoint = f"{BASEURL}{CALLING_TYPE[1]}/{API_POINT[0]}/"

    parameters = {
        "start": nasaRequestInput.startingDate,
        "end": nasaRequestInput.endingDate,
        "longitude": nasaRequestInput.longitude,
        "latitude": nasaRequestInput.latitude,
        "parameters": ','.join(nasaRequestInput.parametersList),
    }

    response = req("GET", endPoint, params=parameters)

    return response.json()["properties"]["parameter"]