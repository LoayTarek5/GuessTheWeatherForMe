from pydantic import BaseModel


class VariableData(BaseModel):
    Mean: float = 0
    Probability: float = 0
    ExponentialSmoothingPrediction: float = 0
    PreviousDates: dict[str, float] = 0
    MinValue: float = 0
    MaxValue: float = 0


class WeatherResponse(BaseModel):
    Data: dict[str, VariableData] = {}
    Success: bool = True  # very useless but meh
