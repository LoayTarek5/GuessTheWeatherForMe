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