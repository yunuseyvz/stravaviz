#!/usr/bin/env python3

import os
import sys
from fit2gpx import StravaConverter

def find_strava_folders(root_dir):
    """
    Recursively search for directories that start with 'Strava' within the root_dir.
    
    Args:
        root_dir (str): The root directory to start searching from.
        
    Returns:
        List[str]: A list of paths to directories that start with 'Strava'.
    """
    strava_dirs = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Check if the current directory name starts with 'Strava'
        if os.path.basename(dirpath).lower().startswith('strava'):
            strava_dirs.append(dirpath)
    return strava_dirs

def process_strava_folder(strava_dir):
    """
    Process a single Strava directory by unzipping activities, adding metadata,
    and converting FIT files to GPX.
    
    Args:
        strava_dir (str): Path to the Strava directory.
    """
    print(f"Processing Strava directory: {strava_dir}")
    
    # Initialize the StravaConverter with the current Strava directory
    strava_conv = StravaConverter(dir_in=strava_dir)
    
    # Step 2: Unzip the zipped files
    print("Unzipping activities...")
    strava_conv.unzip_activities()
    
    # Step 3: Add metadata to existing GPX files
    print("Adding metadata to GPX files...")
    strava_conv.add_metadata_to_gpx()
    
    # Step 4: Convert FIT to GPX
    print("Converting FIT files to GPX...")
    strava_conv.strava_fit_to_gpx()
    
    print(f"Finished processing: {strava_dir}\n")

def main(raw_data_dir):
    """
    Main function to find and process all Strava folders within the raw data directory.
    
    Args:
        raw_data_dir (str): Path to the raw data directory containing user data.
    """
    if not os.path.isdir(raw_data_dir):
        print(f"Error: The directory '{raw_data_dir}' does not exist.")
        sys.exit(1)
    
    print(f"Searching for Strava folders in '{raw_data_dir}'...\n")
    strava_folders = find_strava_folders(raw_data_dir)
    
    if not strava_folders:
        print("No Strava folders found.")
        return
    
    print(f"Found {len(strava_folders)} Strava folder(s). Starting processing...\n")
    
    for strava_dir in strava_folders:
        try:
            process_strava_folder(strava_dir)
        except Exception as e:
            print(f"An error occurred while processing '{strava_dir}': {e}\n")

if __name__ == "__main__":
    # Check if the raw data directory is provided as a command-line argument
    if len(sys.argv) < 2:
        print("Usage: python3 script.py <path_to_raw_data_directory>")
        print("Example: python3 script.py ../data/users/raw")
        sys.exit(1)
    
    raw_data_directory = sys.argv[1]
    main(raw_data_directory)
