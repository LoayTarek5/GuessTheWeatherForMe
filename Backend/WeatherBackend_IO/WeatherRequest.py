from pydantic import BaseModel


class WeatherRequest(BaseModel):
    FutureDate: str
    Longitude: float
    Latitude: float
    Parameters: dict[str, float]
