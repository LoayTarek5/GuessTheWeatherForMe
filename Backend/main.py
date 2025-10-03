from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pathlib import Path
from WeatherBackend_IO.WeatherRequest import WeatherRequest
from WeatherBackend_IO.WeatherResponse import WeatherResponse

app = FastAPI()


# uvicorn main:app --reload


@app.get("/", response_class=HTMLResponse)
async def root():
    file_path = Path(__file__).parent / "templates" / "home.html"

    # Read the HTML file content
    html_content = file_path.read_text(encoding="utf-8")
    return HTMLResponse(status_code=200, content=html_content)


@app.post("/WeatherQuery")
async def ConstructWeatherQuery(weatherRequest: WeatherRequest):
    # right flow will be as following
    # Call Get Ready Power Response => ( searches for cache hit, uses validation)

    # call the analysis to get final result as a Weather Response

    response = WeatherResponse()

    # dummy response for now
    response.Data = {
        "Temperature": {
            "Mean": 20.5,
            "Probability": 0.8,
            "ExponentialSmoothingPrediction": 21.0,
            "PreviousDates": {
                "2023-10-01": 19.5,
                "2023-10-02": 20.0,
                "2023-10-03": 21.5
            },
            "MinValue": 15.0,
            "MaxValue": 25.0
        }
    }
    response.Success = True

    return response
