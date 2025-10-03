from pydantic import BaseModel, Field


class VariableData(BaseModel):
    mean: float = 0
    probability: float = 0
    forecastPrediction: float = 0
    previousDates: dict[str, float] = Field(default_factory=dict)
    min: float = 0
    max: float = 0


class WeatherResponse(BaseModel):
    Data: dict[str, VariableData] = {}
    Success: bool = True  # very useless but meh
