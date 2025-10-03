from pydantic import BaseModel


class WeatherRequest(BaseModel):
    futureDate: str
    longitude: float
    latitude: float
    parameters: dict[str, float]
