import json
import numpy as np
import pandas as pd
import sys
import math
from collections import defaultdict


def file2list(file):
    with open(file) as f:
        flist = [l.rstrip('\n') for l in f.readlines()]
    return flist


def parse_scan(filename):
    station = filename[:4]
    date = filename[4:12]
    time = filename[13:19]
    return station, date, time

def load_scans(scans_file, days=dict()):

    scans = file2list(scans_file)

    scans_for_day = dict()
    for filename in scans:
        _, day, _ = parse_scan(filename)

        if (not (day in scans_for_day) ):
            scans_for_day[day] = list()
            
        scans_for_day[day].append(filename)

    days = sorted(scans_for_day.keys())
        
    return days, scans_for_day

def load_tracks(file):

    tracks = dict()
    
    with open(file, 'r') as f:
        header = f.readline()
        i = 0
        for line in f:
            track_id,filename,from_sunrise,det_score,x,y,r,lon,lat,radius = line.split(',')

            station, date, _ = parse_scan(filename)

            id = station + track_id

            box = {
                'filename' : filename,
                'from_sunrise': float(from_sunrise),
                'score' : float(det_score),
                'x' : float(y), # SWAP X AND Y DUE TO UPSTREAM BUG
                'y': float(x),  # TODO: FIX ONCE IT IS FIXED!
                'r': float(r),
                'lon': float(lon),
                'lat': float(lat),
                'radius': float(radius)
            };
            

            if (not (id in tracks) ):
                tracks[id] = {
                    'id': id,
                    'station' : station,
                    'date': date,
                    'score': 0,
                    'boxes' : []
                }
            tracks[id]['boxes'].append(box)


    def dd_recursive():
        return defaultdict(dd_recursive)
            
    tracks_for_day = defaultdict(dd_recursive)

    for id, track in tracks.items():
        tracks_for_day[track['date']][id] = track

    return tracks, tracks_for_day

stations = file2list('stations.txt')

for station in stations:

    boxes_file = 'boxes-nofilter/%s_boxes.txt' % (station)
    scans_file = 'scans/%s.txt' % (station)
    json_file = 'json/%s.json' % (station)
    
    # Get lists of scans for each day
    days, scans_for_day = load_scans(scans_file)

    # Assemble tracks
    tracks, tracks_for_day = load_tracks(boxes_file)
    
    # Assign meta information to each track
    for track in tracks.values():
        scores = np.array([box['score'] for box in track['boxes']])
        when  = np.array([box['from_sunrise'] for box in track['boxes']])
        track['score'] = scores.sum()
        track['length'] = len(scores)
        track['first_appears'] = when.min()

    # Sort based on score
    #tracks = sorted(tracks, key = lambda x: x['score'], reverse=True);
    # Sort based on date
    #tracks = sorted(tracks, key = lambda x: x['date']);

    json_data = {
        'days': days,
        'scans': scans_for_day,
        'tracks': tracks_for_day
        }
    
    with open(json_file, 'w') as f:
        json.dump(json_data, f)

