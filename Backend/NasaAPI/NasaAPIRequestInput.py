class NasaAPIRequestInput:
    startingDate: str
    endingDate: str
    longitude: float
    latitude: float
    parametersList: list[str]

    def __init__(self, startingDate: str, endingDate: str, longitude: float, latitude: float,
                 parametersList: list[str]):
        self.startingDate = startingDate
        self.endingDate = endingDate
        self.longitude = longitude
        self.latitude = latitude
        self.parametersList = parametersList
