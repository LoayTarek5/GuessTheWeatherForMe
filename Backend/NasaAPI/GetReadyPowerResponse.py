from datetime import datetime, timedelta
from .NasaPowerAPICalling import CallPowerAPI
from .NasaAPIRequestInput import NasaAPIRequestInput
from .Utilities.Validation import validateDate, validate_parameters
from .Utilities.CacheUtilities import CacheUtility

DEFAULT_START_DATE = "20100101"
END_DATE_BACKWARD_COMPATABLE = (datetime.today() - timedelta(days=365)).strftime("%Y%m%d")
DEFAULT_END_DATE = (datetime.today() - timedelta(days=10)).strftime("%Y%m%d")


async def GetReadyPowerApiResponse(FutureDate: str, longitude: float, latitude: float,
                                   threshHolds: dict[str, float]) -> dict:
    # will raise an error that will be handled by fastapi exception handler
    validate_parameters(threshHolds)
    validateDate(FutureDate)

    cache = CacheUtility()

    cacheKey = cache.GenerateKey(longitude, latitude)
    cached_response = await cache.get_dict(cacheKey)

    if cached_response:
        cached_response = await AddNotIncludedParameters(cached_response, list(threshHolds.keys()),
                                                         longitude, latitude,
                                                         DEFAULT_END_DATE)
        return cached_response

    finalEndDate = DEFAULT_END_DATE

    futureDate = datetime.strptime(FutureDate, "%Y%m%d")
    today = datetime.today()
    previousTenDays = today - timedelta(days=10)

    if futureDate.month == today.month and futureDate >= previousTenDays:
        finalEndDate = END_DATE_BACKWARD_COMPATABLE

    nasaApiInput = NasaAPIRequestInput(DEFAULT_START_DATE, finalEndDate, longitude,
                                       latitude, list(threshHolds.keys()))
    response = CallPowerAPI(nasaApiInput)

    await cache.set_dict(cacheKey, response)
    return response


def deep_merge(d1, d2):
    for k, v in d2.items():
        if k in d1 and isinstance(d1[k], dict) and isinstance(v, dict):
            deep_merge(d1[k], v)
        else:
            d1[k] = v
    return d1


async def AddNotIncludedParameters(cached_response: dict, paramList: list[str], longitude: float,
                                   latitude: float, finalDate: str) -> dict:
    notIncludedParams = []
    for param in paramList:
        if param not in cached_response:
            notIncludedParams.append(param)
    if notIncludedParams:
        newResponse = NasaAPIRequestInput(DEFAULT_START_DATE, finalDate, longitude, latitude, notIncludedParams)
        newResponse = CallPowerAPI(newResponse)
        cached_response = deep_merge(cached_response, newResponse)
    return cached_response
