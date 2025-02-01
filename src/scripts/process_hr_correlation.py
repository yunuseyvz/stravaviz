# file: process_heart_rate_correlation.py

import os
import pandas as pd
import json
import numpy as np
from typing import Optional, Dict, Any
from converter import StravaConverter  # or wherever your Converter is located

class HeartRatePaceProcessor:
    """
    This class uses the existing StravaConverter to parse .FIT files,
    then computes correlation between heart rate and pace (rolling average).
    It also filters out data points with slopes above a threshold.
    """

    def __init__(self, dir_in: str, dir_out: str, slope_threshold: float = 0.01, 
                 rolling_window_sec: int = 30, status_msg: bool = False):
        """
        :param dir_in: Path to the directory containing .fit activities (or your 'activities_gpx' or 'activities' folder)
        :param dir_out: Where to store the correlation JSON files
        :param slope_threshold: absolute slope threshold above which data is excluded (uphill/downhill)
        :param rolling_window_sec: window size in seconds for rolling average
        :param status_msg: print status messages
        """
        self.dir_in = dir_in
        self.dir_out = dir_out
        self.slope_threshold = slope_threshold
        self.rolling_window_str = f'{rolling_window_sec}S'  # for Pandas time-based rolling
        self.status_msg = status_msg
        
        if not os.path.exists(self.dir_out):
            os.makedirs(self.dir_out)
        
        # Note: The StravaConverter expects dir_in to be the main Strava export directory.
        # In our case, if self.dir_in points to the activities folder, we pass its parent.
        parent_dir = os.path.dirname(self.dir_in.rstrip(os.sep))
        self.converter = StravaConverter(dir_in=parent_dir, dir_out=None)

    def process_all_fit_files(self):
        """
        Main method to process all FIT files in self.dir_in, compute correlation,
        and save to JSON. Only processes activities whose type is "run" or "lauf".
        """
        # Look for the activities.csv metadata file.
        # Assuming activities.csv is one level up from the directory of FIT files.
        activities_csv_path = os.path.join(os.path.dirname(self.dir_in.rstrip(os.sep)), 'activities.csv')
        if os.path.exists(activities_csv_path):
            df_acts = pd.read_csv(activities_csv_path).fillna('')
            mapping = self.converter._get_metadata_mapping(df_acts)
        else:
            df_acts = None
            mapping = None
            if self.status_msg:
                print("No activities.csv file found. Processing all FIT files regardless of activity type.")

        # List all FIT files in the provided directory.
        fit_files = [f for f in os.listdir(self.dir_in) if f.lower().endswith('.fit')]
        
        if self.status_msg:
            print(f"Found {len(fit_files)} FIT files to process for correlation.")
        
        results = []
        
        for f in fit_files:
            # If metadata is available, look up the activity type for this file.
            if df_acts is not None and mapping is not None:
                matching = df_acts[df_acts[mapping['filename']].str.contains(f, na=False)]
                if not matching.empty:
                    md = matching.iloc[0].to_dict()
                    act_type = md[mapping['activity_type']]
                    # Only process activities of type "run" or "lauf"
                    if act_type.lower() not in ['run', 'lauf']:
                        if self.status_msg:
                            print(f"Skipping {f} because its activity type is '{act_type}'.")
                        continue
                else:
                    if self.status_msg:
                        print(f"No metadata found for {f}. Processing without activity type filtering.")
            
            f_path = os.path.join(self.dir_in, f)
            try:
                df_laps, df_points = self.converter.fit_to_dataframes(f_path)
                
                # Compute correlation for the activity
                corr_data = self._compute_correlation_per_activity(df_points, f)
                if corr_data is not None:
                    results.append(corr_data)
                    
                    # Write out a JSON file for this activity's correlation data.
                    out_file = os.path.splitext(f)[0] + "_corr.json"
                    out_path = os.path.join(self.dir_out, out_file)
                    with open(out_path, 'w') as fp:
                        json.dump(corr_data, fp, indent=2, default=str)
                    
                    if self.status_msg:
                        print(f"Processed {f}, correlation={corr_data['correlation_rolling_30s']:.3f}")
                else:
                    if self.status_msg:
                        print(f"No valid data for correlation in {f}. Skipping.")
            
            except Exception as e:
                if self.status_msg:
                    print(f"Error processing {f}: {e}")
                continue
        
        # Optionally, write an aggregated file with all correlations
        all_corr_path = os.path.join(self.dir_out, "all_correlations.json")
        with open(all_corr_path, 'w') as fp:
            json.dump(results, fp, indent=2, default=str)
        
        if self.status_msg:
            print(f"Finished processing. Stored {len(results)} correlation results.")

    def _compute_correlation_per_activity(self, df_points: pd.DataFrame, filename: str) -> Optional[Dict[str, Any]]:
        """
        1) Filter out missing heart rate / speed rows
        2) Convert to time-index, compute slope
        3) Filter out slopes above threshold
        4) Compute 30s rolling average
        5) Correlate HR and pace
        6) Return correlation + metadata
        """
        # Ensure we have the columns we need
        if 'heart_rate' not in df_points.columns or 'speed' not in df_points.columns:
            return None
        
        # Remove rows with missing heart rate or speed values.
        df_points = df_points.dropna(subset=['heart_rate', 'speed'])
        if df_points.empty:
            return None

        # Convert timestamp to datetime, sort, and set as index.
        df_points['timestamp'] = pd.to_datetime(df_points['timestamp'])
        df_points.sort_values(by='timestamp', inplace=True)
        df_points.set_index('timestamp', inplace=True)

        # If altitude is missing, fill it (so that slope filtering works).
        if 'altitude' not in df_points.columns or df_points['altitude'].isnull().all():
            df_points['altitude'].fillna(method='ffill', inplace=True)
            df_points['altitude'].fillna(value=0, inplace=True)
        
        # Compute slope
        df_points['delta_time'] = df_points.index.to_series().diff().dt.total_seconds()
        df_points['horizontal_dist'] = df_points['speed'] * df_points['delta_time']  # in meters
        df_points['delta_alt'] = df_points['altitude'].diff()
        df_points['slope'] = df_points['delta_alt'] / df_points['horizontal_dist'].replace(0, np.nan)
        
        # Filter out segments with absolute slope above threshold.
        df_points = df_points[abs(df_points['slope']) < self.slope_threshold]
        if df_points.empty:
            return None
        
        # Compute rolling averages over the specified window for heart rate and speed.
        df_points['hr_rolling'] = df_points['heart_rate'].rolling(self.rolling_window_str).mean()
        df_points['speed_rolling'] = df_points['speed'].rolling(self.rolling_window_str).mean()

        # Convert rolling speed to pace in min/km (speed is in m/s).
        df_points['pace_rolling'] = (1000.0 / df_points['speed_rolling']) / 60.0  # (min/km)
        
        # Drop rows where the rolling averages are NaN.
        df_points.dropna(subset=['hr_rolling', 'pace_rolling'], inplace=True)
        if df_points.empty:
            return None
        
        # Compute the correlation between the rolling heart rate and pace.
        correlation = df_points['hr_rolling'].corr(df_points['pace_rolling'])

        # Extract start and end time for the activity.
        start_time = df_points.index[0].isoformat()
        end_time = df_points.index[-1].isoformat()

        # Return a dictionary with the results and some metadata.
        return {
            "filename": filename,
            "start_time": start_time,
            "end_time": end_time,
            "correlation_rolling_30s": float(correlation),
            "slope_threshold": self.slope_threshold,
            "rolling_window_sec": int(self.rolling_window_str.replace('S','')),
        }

if __name__ == "__main__":
    # Example usage:
    # The dir_in should contain your .fit files (e.g., the "activities" folder)
    # The dir_out is where you'll store the correlation JSON results.
    #USER = 'Strava-export_47979926'
    USER = 'Strava-export_62940241'
    BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'users', 'raw')
    DIR_IN = os.path.join(BASE_DIR, USER, 'activities')
    DIR_OUT = os.path.join(BASE_DIR, USER, 'corr')

    processor = HeartRatePaceProcessor(dir_in=DIR_IN, dir_out=DIR_OUT, slope_threshold=0.01, status_msg=True)
    processor.process_all_fit_files()
