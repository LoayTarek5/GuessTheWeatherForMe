# GuessTheWeatherForMe
2025 Nasa Hackathon Project for "Will it rain on my parade" challenge


You Can use the project through the following link:
https://transit-definitely-decrease-eau.trycloudflare.com/

Note: the project uses free cloud flare tunnel which if the server shut down for what ever reason you won't be able to reach it (i hope it doesn't until judging time) 


# if it shut down for what ever reason:
## you will need to these instruc

1- have python 3.13 or abve installed 
2- have npm installed

3- install python requirements inside the backend file 
```pip install -r requirements.txt```

4- run the backend on using the command 
```uvicorn main:app --reload```

5- go to the frontend file and install the npm packages using 
```npm install```

6- run the frontend using 
```npm run dev```

7- you will likely need to route the frontend to fetch data from backend using localhost:8000 instead of the cloudflare link

i know it is kinda a lot but i hope it helps if the server shut down for some reason.


## Features

- **Interactive Map Interface**: Select any location worldwide using an intuitive map interface
- **Customizable Weather Parameters**: Choose from various NASA POWER API parameters
- **Historical Analysis**: Compare current forecasts with historical data from the past 15 years
- **Probability Calculations**: Get likelihood percentages for extreme weather conditions
- **Real-time Data**: Powered by NASA's POWER (Prediction of Worldwide Energy Resources) API
- **Responsive Design**: Modern, mobile-friendly interface built with Next.js and React

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **NASA POWER API** - Weather and climate data
- **Pandas & NumPy** - Data analysis and processing
- **Pydantic** - Data validation
- **FastAPI Cache** - Response caching for performance

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type-safe development
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling

## API Response Structure

The application returns comprehensive weather analysis in the following format:

```json
{
  "Data": {
    "T2M": {
      "mean": 25.4,
      "probability": 0.15,
      "foreCastPrediction": 26.1,
      "previousDates": {
        "20150902": 31.41,
        "20160902": 28.92,
        // ... historical data for past 15 years
      },
      "minValue": 18.2,
      "maxValue": 35.7
    },
    "RH2M": { /* humidity data */ },
    "WS2M": { /* wind speed data */ },
    "PRECTOTCORR": { /* precipitation data */ },
    "CLOUD_AMT": { /* cloud amount data */ }
  },
  "Success": true
}
```

## Quick Start (If Server is Down)

If the live demo is unavailable, you can run the project locally:

### Prerequisites
- Python 3.13 or above
- Node.js and npm installed

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install npm packages:
   ```bash
   npm install
   ```

3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

### Configuration Note
If running locally, you may need to update the frontend configuration to fetch data from `localhost:8000` instead of the Cloudflare tunnel URL.

## Docker Deployment

The project includes Docker configuration for containerized deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Project Structure

```
GuessTheWeatherForMe/
├── Backend/
│   ├── Analysis/           # Weather analysis algorithms
│   ├── NasaAPI/           # NASA POWER API integration
│   ├── WeatherBackend_IO/ # Request/Response models
│   ├── main.py            # FastAPI application
│   └── requirements.txt   # Python dependencies
├── Frontend/
│   ├── app/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   └── api/          # API routes
│   ├── package.json      # Node.js dependencies
│   └── Dockerfile        # Frontend container config
└── docker-compose.yaml   # Multi-container setup
```

## How It Works

1. **Location Selection**: Users select a location on the interactive map
2. **Parameter Configuration**: Choose weather parameters of interest
3. **Data Retrieval**: Backend fetches historical and forecast data from NASA POWER API
4. **Analysis**: Algorithms calculate probabilities and trends
5. **Visualization**: Results are displayed through charts and probability indicators

## NASA Hackathon Challenge

This project addresses the "Will it rain on my parade?" challenge by:
- Providing personalized weather condition predictions
- Analyzing historical patterns to improve forecast accuracy
- Offering intuitive interfaces for non-technical users
- Leveraging NASA's authoritative weather and climate data

## Contributing

This is a hackathon project, but feel free to fork and improve upon it!

## License

This project is created for the 2025 NASA Hackathon and is available for educational and research purposes.

