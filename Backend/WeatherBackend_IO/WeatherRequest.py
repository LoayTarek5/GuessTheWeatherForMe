from pydantic import BaseModel


class WeatherRequest(BaseModel):
    date: str
    longitude: float
    latitude: float
    parameters: dict[str, float]
