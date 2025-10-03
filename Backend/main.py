import time
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pathlib import Path
from WeatherBackend_IO.WeatherRequest import WeatherRequest
from WeatherBackend_IO.WeatherResponse import WeatherResponse
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from Analysis.Analysis import get_result
from NasaAPI.GetReadyPowerResponse import GetReadyPowerApiResponse

app = FastAPI()


@app.on_event("startup")
async def startup():
    FastAPICache.init(InMemoryBackend())


@app.get("/", response_class=HTMLResponse)
async def root():
    file_path = Path(__file__).parent / "templates" / "home.html"
    html_content = file_path.read_text(encoding="utf-8")
    return HTMLResponse(status_code=200, content=html_content)


@app.post("/WeatherQuery")
async def ConstructWeatherQuery(weatherRequest: WeatherRequest):
    start_time = time.time()  # <-- start stopwatch

    # Call Get Ready Power Response
    nasa_response = await GetReadyPowerApiResponse(
        weatherRequest.FutureDate,
        weatherRequest.Longitude,
        weatherRequest.Longitude,
        weatherRequest.Parameters
    )

    # Analysis
    final_result = get_result(nasa_response, weatherRequest.FutureDate, weatherRequest.Parameters)

    response = WeatherResponse()
    response.Data = final_result
    response.Success = True

    end_time = time.time()  # <-- stop stopwatch
    elapsed = end_time - start_time
    print(f"[Stopwatch] /WeatherQuery executed in {elapsed:.3f} seconds")

    return response
