"""Classes to convert FIT files to GPX, including tools to process Strava Bulk Export
"""
import os
import gzip
import shutil
from datetime import datetime, timedelta
from typing import Dict, Union, Optional, Tuple
import pandas as pd
import gpxpy.gpx
import fitdecode


# MAIN CONVERTER CLASS
class Converter:
    """Main converter that holds the FIT > pd.DataFrame and pd.DataFrame > GPX methods"""

    def __init__(self, status_msg: bool = False):
        """Main constructor for StravaConverter
        Parameters:
            status_msg (bool): Option to have the Converter print to console with status messages,
            such as number of files converted.
        """
        self.status_msg = status_msg
        # The names of the columns will be used in our points and laps DataFrame
        # (use the same name as the field names in FIT file to facilitate parsing)
        self._colnames_points = [
            'latitude',
            'longitude',
            'lap',
            'timestamp',
            'altitude',
            'enhanced_altitude',
            'temperature',
            'heart_rate',
            'cadence',
            'speed',
            'enhanced_speed',
            'power',
        ]

        self._colnames_laps = [
            'number',
            'start_time',
            'total_distance',
            'total_elapsed_time',
            'max_speed',
            'max_heart_rate',
            'avg_heart_rate'
        ]

    def _get_fit_laps(self, frame: fitdecode.records.FitDataMessage) -> Dict[str, Union[float, datetime, timedelta, int]]:
        """Extract some data from a FIT frame representing a lap and return it as a dict.
        """
        data: Dict[str, Union[float, datetime, timedelta, int]] = {}
        for field in self._colnames_laps[1:]:
            if frame.has_field(field):
                data[field] = frame.get_value(field)
        return data

    def _get_fit_points(self, frame: fitdecode.records.FitDataMessage) -> Optional[Dict[str, Union[float, int, str, datetime]]]:
        """Extract some data from an FIT frame representing a track point and return it as a dict.
        """
        data: Dict[str, Union[float, int, str, datetime]] = {}

        if not (frame.has_field('position_lat') and frame.has_field('position_long')):
            return None
        elif frame.get_value('position_lat') is None and frame.get_value('position_long') is None:
            return None
        else:
            data['latitude'] = frame.get_value('position_lat') / ((2 ** 32) / 360)
            data['longitude'] = frame.get_value('position_long') / ((2 ** 32) / 360)

        for field in self._colnames_points[3:]:
            if frame.has_field(field):
                data[field] = frame.get_value(field)

        return data

    def fit_to_dataframes(self, fname: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Takes the path to a FIT file and returns two Pandas DataFrames for lap data and point data
        Parameters:
            fname (str): string representing file path of the FIT file
        Returns:
            dfs (tuple): df containing data about the laps, df containing data about the individual points.
        """
        input_extension = os.path.splitext(fname)[1]
        if input_extension.lower() != '.fit':
            raise fitdecode.exceptions.FitHeaderError("Input file must be a .FIT file.")

        data_points = []
        data_laps = []
        lap_no = 1
        with fitdecode.FitReader(fname) as fit_file:
            for frame in fit_file:
                if isinstance(frame, fitdecode.records.FitDataMessage):
                    if frame.name == 'record':
                        single_point_data = self._get_fit_points(frame)
                        if single_point_data is not None:
                            single_point_data['lap'] = lap_no
                            data_points.append(single_point_data)
                    elif frame.name == 'lap':
                        single_lap_data = self._get_fit_laps(frame)
                        single_lap_data['number'] = lap_no
                        data_laps.append(single_lap_data)
                        lap_no += 1

        df_laps = pd.DataFrame(data_laps, columns=self._colnames_laps)
        df_laps.set_index('number', inplace=True)
        df_points = pd.DataFrame(data_points, columns=self._colnames_points)
        if 'enhanced_speed' in df_points.columns and df_points['speed'].count() == 0:
            df_points['speed'] = df_points['enhanced_speed']
        if 'enhanced_altitude' in df_points.columns and df_points['altitude'].count() == 0:
            df_points['altitude'] = df_points['enhanced_altitude']

        return df_laps, df_points

    def dataframe_to_gpx(self, df_points, col_lat='latitude', col_long='longitude', col_time=None, col_alt=None,
                         gpx_name=None, gpx_desc=None, gpx_link=None, gpx_type=None):
        """
        Convert a pandas dataframe to gpx
        Parameters:
            df_points (pd.DataFrame): pandas dataframe containing at minimum lat and long info of points
            col_alt (str): name of the altitudes column
            col_time (str): name of the time column
            col_long (str): name of the longitudes column
            col_lat (str): name of the latitudes column
            gpx_name (str): name for the gpx track (note is not the same as the file name)
            gpx_desc (str): description for the gpx track
            gpx_type : activity type for the gpx track (can be str, or int)
            gpx_link (str): link to the gpx activity
        """
        cols_to_check = [col_lat, col_long]
        if col_alt:
            cols_to_check.append(col_alt)
        if col_time:
            cols_to_check.append(col_time)

        if any(elem not in df_points.columns for elem in cols_to_check):
            raise KeyError("The input dataframe must consist of point coordinates in longitude and latitude. "
                           "Ideally, it should be the df_points output from the fit_to_dataframes() method.")

        gpx = gpxpy.gpx.GPX()
        gpx_track = gpxpy.gpx.GPXTrack()
        gpx.tracks.append(gpx_track)
        gpx_segment = gpxpy.gpx.GPXTrackSegment()
        gpx_track.segments.append(gpx_segment)

        gpx.tracks[0].name = gpx_name
        gpx.tracks[0].type = gpx_type
        gpx.tracks[0].description = gpx_desc if not pd.isna(gpx_desc) else None
        gpx.tracks[0].link = gpx_link

        for idx in df_points.index:
            track_point = gpxpy.gpx.GPXTrackPoint(
                latitude=df_points.loc[idx, col_lat],
                longitude=df_points.loc[idx, col_long],
                time=pd.Timestamp(df_points.loc[idx, col_time]) if col_time else None,
                elevation=df_points.loc[idx, col_alt] if col_alt else None
            )
            gpx_segment.points.append(track_point)

        return gpx

    def fit_to_gpx(self, f_in, f_out):
        """Method to convert a FIT file into a GPX file
        Parameters:
            f_in (str): file path to FIT activity
            f_out (str): file path to save the converted FIT file
        """
        input_extension = os.path.splitext(f_in)[1]
        if input_extension.lower() != '.fit':
            raise Exception("Input file must be a .FIT file.")

        output_extension = os.path.splitext(f_out)[1]
        if output_extension.lower() != ".gpx":
            raise TypeError(f"Output file must be a .gpx file.")

        df_laps, df_points = self.fit_to_dataframes(f_in)

        enhanced_fields = ['altitude', 'speed']
        for field in enhanced_fields:
            if df_points[field].count() == 0 and df_points[f'enhanced_{field}'].count() > 0:
                df_points[field].fillna(df_points[f'enhanced_{field}'], inplace=True)

        gpx = self.dataframe_to_gpx(
            df_points=df_points,
            col_lat='latitude',
            col_long='longitude',
            col_time='timestamp',
            col_alt='altitude',
        )

        with open(f_out, 'w') as f:
            f.write(gpx.to_xml())

        return gpx

    def fit_to_gpx_bulk(self, dir_in, dir_out):
        """Method to convert all FIT files in a directory to GPX files
        Parameters:
            dir_in (str): path to directory with all FIT activities
            dir_out (str): path to directory to save the converted FIT files to
        """
        if dir_in[-1] != '/':
            dir_in += '/'
        if dir_out and dir_out[-1] != '/':
            dir_out += '/'

        if not os.path.isdir(dir_out):
            os.mkdir(dir_out)

        fit_files = [f for f in os.listdir(dir_in) if f.lower().endswith('.fit')]

        for f_activity in fit_files:
            self.fit_to_gpx(
                f_in=dir_in + f_activity,
                f_out=dir_out + os.path.splitext(f_activity)[0] + '.gpx'
            )

        if self.status_msg:
            print(f'{len(fit_files)} files converted from .fit to .gpx')


# STRAVA CONVERTER
class StravaConverter(Converter):
    """Converter to use when converting .FIT files from Strava data download to GPX files"""

    def __init__(self, dir_in, dir_out=None):
        """Main constructor for StravaConverter
        Parameters:
            dir_in (str): path to main Strava data download folder
            dir_out (str): path to directory to save the converted FIT files to.
              If not provided, saves to an 'activities_gpx' directory in the main directory
        """
        super().__init__()
        if dir_in[-1] != '/':
            dir_in += '/'
        if dir_out and dir_out[-1] != '/':
            dir_out += '/'

        if not dir_out:
            dir_out = dir_in + 'activities_gpx/'

        if 'activities.csv' not in os.listdir(dir_in) or not os.path.isdir(dir_in + 'activities'):
            raise Exception('The input directory must be the main Strava data download directory, '
                            'i.e. must contain activities.csv and have a sub directory named "activities".')

        if not os.path.isdir(dir_out):
            os.mkdir(dir_out)

        self._dir_in = dir_in
        self._dir_out = dir_out
        self._dir_activities = self._dir_in + 'activities/'

    def unzip_activities(self):
        """Method to unzip .gz files to their native format (e.g. gpx, tcx, fit, etc.)
           Note: This version creates the unzipped file if not already present but does not delete the original .gz file.
        """
        cnt_activities = len({f.split('.')[0] for f in os.listdir(self._dir_activities)})
        zip_paths = [os.path.join(self._dir_activities, f) for f in os.listdir(self._dir_activities)
                     if f.lower().endswith('.gz')]

        for path_zip in zip_paths:
            path_unzip = path_zip[:-3]
            if os.path.exists(path_unzip):
                continue
            else:
                with gzip.open(path_zip, 'rb') as f_in:
                    with open(path_unzip, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)

        if self.status_msg:
            if len(os.listdir(self._dir_activities)) >= cnt_activities:
                print(f'{len(zip_paths)} zipped files have been unzipped (original .gz files kept)')
            else:
                print('ERROR: Some files may be missing.')

    def _get_metadata_mapping(self, df_acts: pd.DataFrame) -> Dict[str, str]:
        """
        Detect which set of column names is present in the activities.csv file.
        Returns a mapping dictionary with keys: filename, activity_id, activity_name,
        activity_description, activity_type.
        """
        mapping = {}
        if 'Dateiname' in df_acts.columns:
            mapping['filename'] = 'Dateiname'
            mapping['activity_id'] = 'Aktivitäts-ID'
            mapping['activity_name'] = 'Name der Aktivität'
            mapping['activity_description'] = 'Aktivitätsbeschreibung'
            mapping['activity_type'] = 'Aktivitätsart'
        elif 'Filename' in df_acts.columns:
            mapping['filename'] = 'Filename'
            mapping['activity_id'] = 'Activity ID'
            mapping['activity_name'] = 'Activity Name'
            mapping['activity_description'] = 'Activity Description'
            mapping['activity_type'] = 'Activity Type'
        else:
            raise Exception("activities.csv does not contain recognized column names.")
        return mapping

    def strava_fit_to_gpx(self):
        """Method to convert all FIT files in a directory to GPX files, adding metadata from Strava to GPX files
        """
        df_acts = pd.read_csv(os.path.join(self._dir_in, 'activities.csv')).fillna('')
        mapping = self._get_metadata_mapping(df_acts)
        fit_files = [f for f in os.listdir(self._dir_activities) if f.lower().endswith('.fit')]

        for f_activity in fit_files:
            try:
                # Attempt to read the FIT file and convert it to dataframes
                df_laps, df_points = self.fit_to_dataframes(os.path.join(self._dir_activities, f_activity))
                
                # Get metadata from activities.csv for the current activity file
                md = df_acts.loc[df_acts[mapping['filename']].str.contains(f_activity)].iloc[0, :].to_dict()
                act_id = md[mapping['activity_id']]
                act_name = md[mapping['activity_name']]
                act_desc = md[mapping['activity_description']]
                act_type = md[mapping['activity_type']]

                # Clean non-ASCII characters if needed
                if not act_name.isascii():
                    act_name = str(act_name.encode('ascii', 'ignore'))
                if isinstance(act_desc, str) and not act_desc.isascii():
                    act_desc = str(act_desc.encode('ascii', 'ignore'))
                if pd.isna(act_desc):
                    act_desc = None

                # Prepare arguments for GPX conversion
                strava_args = {
                    'gpx_name': act_name,
                    'gpx_type': act_type,
                    'gpx_desc': act_desc,
                    'gpx_link': f"https://www.strava.com/activities/{act_id}"
                }

                # Convert the dataframe to a GPX object
                gpx = self.dataframe_to_gpx(
                    df_points=df_points,
                    col_lat='latitude',
                    col_long='longitude',
                    col_time='timestamp',
                    col_alt='altitude',
                    **strava_args
                )

                # Save the GPX file to the output directory
                path_out = os.path.join(self._dir_out, f'{act_id}.gpx')
                with open(path_out, 'w') as f:
                    f.write(gpx.to_xml())

                if self.status_msg:
                    print(f"Successfully processed {f_activity}")

            except Exception as e:
                # If an error occurs, print an error message and skip this file.
                print(f"Error processing file {f_activity}: {e}. Skipping.")
                continue

        if self.status_msg:
            print(f"Finished processing {len(fit_files)} files (errors were skipped).")

    def add_metadata_to_gpx(self):
        """Method adds Strava metadata to default GPX files (i.e. files downloaded as GPX from Strava)"""
        gpx_files = [f for f in os.listdir(self._dir_activities)
                     if f.lower().endswith('.gpx') and f not in os.listdir(self._dir_out)]
        df_acts = pd.read_csv(os.path.join(self._dir_in, 'activities.csv')).fillna('')
        mapping = self._get_metadata_mapping(df_acts)

        for gpx_path in gpx_files:
            md = df_acts.loc[df_acts[mapping['filename']].str.contains(gpx_path)].iloc[0, :].to_dict()
            act_id = md[mapping['activity_id']]
            act_name = md[mapping['activity_name']]
            act_desc = md[mapping['activity_description']]
            act_type = md[mapping['activity_type']]

            if not act_name.isascii():
                act_name = str(act_name.encode('ascii', 'ignore'))
            if isinstance(act_desc, str) and not act_desc.isascii():
                act_desc = str(act_desc.encode('ascii', 'ignore'))
            if pd.isna(act_desc):
                act_desc = None

            with open(os.path.join(self._dir_activities, gpx_path), 'r', encoding='utf-8') as f_gpx:
                gpx = gpxpy.parse(f_gpx)

            gpx.tracks[0].name = act_name
            gpx.tracks[0].type = act_type
            gpx.tracks[0].description = act_desc
            gpx.tracks[0].link = f"https://www.strava.com/activities/{act_id}"

            path_out = os.path.join(self._dir_out, f'{act_id}.gpx')
            with open(path_out, 'w') as f:
                f.write(gpx.to_xml())

        if self.status_msg:
            print(f'{len(gpx_files)} GPX files have had Strava metadata added.')


if __name__ == '__main__':
    # Adjust the base directory so that we go one directory up from this file
    # and then into the subdirectories: data/users/raw
    BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'users', 'raw')
    
    # You can modify the subdirectory name (for example, if your Strava export folder is named differently)
    DIR_Strava = os.path.join(BASE_DIR, 'Strava-export_47979926')
    #DIR_Strava = os.path.join(BASE_DIR, 'Strava-export_62940241')

    strava_conv = StravaConverter(
        dir_in=DIR_Strava,
        # Optionally add status_msg=True to see conversion messages
        # status_msg=True
    )

    # Unzip the zipped files (keeping the original .gz files)
    strava_conv.unzip_activities()

    # Add metadata to existing GPX files
    strava_conv.add_metadata_to_gpx()

    # Convert FIT to GPX (with metadata)
    strava_conv.strava_fit_to_gpx()
