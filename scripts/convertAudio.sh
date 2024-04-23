#!/bin/bash

if ! command -v ffmpeg &> /dev/null; then
    echo "ERROR: FFmpeg is not installed."
    exit 1
fi

input_file="$1"
directory=$(dirname "$input_file")
filename=$(basename "$input_file")
filename_noext="${filename%.*}"

ffmpeg -i "$input_file" -codec:a libvorbis -q:a 4 "$directory/$filename_noext.ogg"
