from .NasaAPIRequestInput import NasaAPIRequestInput
from requests import request as req

BASEURL = "https://power.larc.nasa.gov/api/temporal/"
CALLING_TYPE = ["hourly", "daily", "monthly"]
API_POINT = ["point", "regional"]
COMMUNITY = "ag"


def CallPowerAPI(nasaRequestInput: NasaAPIRequestInput):
    endPoint = f"{BASEURL}{CALLING_TYPE[1]}/{API_POINT[0]}"

    parameters = {
        "start": nasaRequestInput.startingDate,
        "end": nasaRequestInput.endingDate,
        "community": COMMUNITY,
        "longitude": nasaRequestInput.longitude,
        "latitude": nasaRequestInput.latitude,
        "parameters": ','.join(nasaRequestInput.parametersList),
    }

    response = req("GET", endPoint, params=parameters)

    response.raise_for_status()  # raises exception if HTTP status != 200
    data = response.json()
    return data.get("properties", {}).get("parameter", {})


