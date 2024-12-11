import pathlib
import pandas as pd 

path = pathlib.Path(__file__).parent.parent.parent.parent / "misc/data/Strava-export_47979926/activities.csv"
df = pd.read_csv(path)

distance = df.iloc[:, 6]
distance = distance.str.replace(",", ".").astype(float)

date = df.iloc[:, 1]
date = date.str.split(",").str[0]
month = date.str.split(".").str[1].astype(int)
year = date.str.split(".").str[2].astype(int)

distancePerDate = pd.DataFrame({"month": month, "year": year, "distance": distance})

def getMonthlyDistancePerYear(data: pd.DataFrame, year: int):
    data = data[data.year == year]
    data = data.drop(columns="year")
    data = data.groupby("month").sum()
    return data.to_csv(pathlib.Path(__file__).parent.parent.parent / f"data/monthly-distance-in{year}.csv")

for year in year.unique():
    getMonthlyDistancePerYear(distancePerDate, year)