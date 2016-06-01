#!/bin/bash

if [ -z "$1" ]; then
  echo "input video required"
  exit 1
fi

if [ ! -e "$1" ]; then
  echo "$1 does not exist";
  exit 1
fi

ORIG_DIR=`pwd`
cd "`dirname \"$1\"`"
INPUT_FILE=`basename "$1"`
OUTPUT_FILE=`echo $INPUT_FILE | perl -pe 's/ /_/g'`

# 720x1280
# target: iPad; desktop Chrome, Edge, Safari
SECONDS=0
ffmpeg -y -i "$INPUT_FILE" -codec:v libx264 -profile:v high -level 4.1 -preset slow -b:v 1.2M -minrate 100k -maxrate 2.4M -bufsize 2M -vf scale=-1:720 -threads 0 -pass 1 -an -f mp4 /dev/null
ffmpeg -y -i "$INPUT_FILE" -codec:v libx264 -profile:v high -level 4.1 -preset slow -b:v 1.2M -minrate 100k -maxrate 2.4M -bufsize 2M -vf scale=-1:720 -threads 0 -pass 2 -codec:a libfdk_aac -b:a 128k -f mp4 "${OUTPUT_FILE%.*}-720.mp4"
echo "Encoded ${OUTPUT_FILE%.*}-720.mp4 in $(($SECONDS / 60)) minutes and $(($SECONDS % 60)) seconds" >> "${OUTPUT_FILE%.*}.encoding.log"

# 480x854
# target: iPhone 6+
SECONDS=0
ffmpeg -y -i "$INPUT_FILE" -codec:v libx264 -profile:v high -level 4.1 -preset slow -b:v 600k -minrate 100k -maxrate 1.2M -bufsize 1M -vf scale=854:-1 -threads 0 -pass 1 -an -f mp4 /dev/null
ffmpeg -y -i "$INPUT_FILE" -codec:v libx264 -profile:v high -level 4.1 -preset slow -b:v 600k -minrate 100k -maxrate 1.2M -bufsize 1M -vf scale=854:-1 -threads 0 -pass 2 -codec:a libfdk_aac -b:a 128k -f mp4 "${OUTPUT_FILE%.*}-480.mp4"
echo "Encoded ${OUTPUT_FILE%.*}-480.mp4 in $(($SECONDS / 60)) minutes and $(($SECONDS % 60)) seconds" >> "${OUTPUT_FILE%.*}.encoding.log"

# 320x568
# target: iphone 4S - 5S
SECONDS=0
ffmpeg -y -i "$INPUT_FILE"  -codec:v libx264 -profile:v high -level 4.1 -preset slow -b:v 350k -minrate 40k -maxrate 700k -bufsize 700k -vf scale=568:-1 -threads 0 -pass 1 -an -f mp4 /dev/null
ffmpeg -i "$INPUT_FILE"  -codec:v libx264 -profile:v high -level 4.1 -preset slow -b:v 350k -minrate 40k -maxrate 700k -bufsize 700k -vf scale=568:-1 -threads 0 -pass 2 -codec:a libfdk_aac -b:a 96k -f mp4 "${OUTPUT_FILE%.*}-320.mp4"
echo "Encoded ${OUTPUT_FILE%.*}-320.mp4 in $(($SECONDS / 60)) minutes and $(($SECONDS % 60)) seconds" >> "${OUTPUT_FILE%.*}.encoding.log"

# 720x1280
# target: desktop no h.264
SECONDS=0
ffmpeg -y -i "$INPUT_FILE" -codec:v libvpx -g 120 -lag-in-frames 16 -deadline good -cpu-used 0 -vprofile 0 -qmin 11 -qmax 51 -b:v 1.6M -threads 8 -vf scale=-1:720 -pass 1 -an -f webm /dev/null
ffmpeg -y -i "$INPUT_FILE" -codec:v libvpx -g 120 -lag-in-frames 16 -deadline good -cpu-used 0 -vprofile 0 -qmin 11 -qmax 51 -b:v 1.6M -maxrate 3.2M -minrate 100k -auto-alt-ref 1 -arnr-maxframes 7 -arnr-strength 5 -arnr-type centered -threads 8 -vf scale=-1:720 -pass 2 -codec:a libvorbis -b:a 128k -f webm "${OUTPUT_FILE%.*}-720.webm"
echo "Encoded ${OUTPUT_FILE%.*}-720.webm in $(($SECONDS / 60)) minutes and $(($SECONDS % 60)) seconds" >> "${OUTPUT_FILE%.*}.encoding.log"

# 480x854
# target: unsure; most Android phones seem to be 360x640; but why not?
SECONDS=0
ffmpeg -y -i "$INPUT_FILE" -codec:v libvpx -g 120 -lag-in-frames 16 -deadline good -cpu-used 0 -vprofile 0 -qmin 11 -qmax 51 -b:v 800k -threads 8 -vf scale=-1:480 -pass 1 -an -f webm /dev/null
ffmpeg -y -i "$INPUT_FILE" -codec:v libvpx -g 120 -lag-in-frames 16 -deadline good -cpu-used 0 -vprofile 0 -qmin 4 -qmax 60 -b:v 800k -maxrate 1.6M -minrate 100k -auto-alt-ref 1 -arnr-maxframes 7 -arnr-strength 5 -arnr-type centered -threads 8 -vf scale=-1:480 -pass 2 -codec:a libvorbis -b:a 128k -f webm "${OUTPUT_FILE%.*}-480.webm"
echo "Encoded ${OUTPUT_FILE%.*}-480.webm in $(($SECONDS / 60)) minutes and $(($SECONDS % 60)) seconds" >> "${OUTPUT_FILE%.*}.encoding.log"

# 360x640
# target: various Android phones; even Galaxy flagship phones are 360x640
SECONDS=0
ffmpeg -y -i "$INPUT_FILE" -codec:v libvpx -g 120 -lag-in-frames 16 -deadline good -cpu-used 0 -vprofile 0 -qmin 0 -qmax 63 -b:v 400k -threads 8 -vf scale=-1:360 -pass 1 -an -f webm /dev/null
ffmpeg -y -i "$INPUT_FILE" -codec:v libvpx -g 120 -lag-in-frames 16 -deadline good -cpu-used 0 -vprofile 0 -qmin 0 -qmax 63 -b:v 400k -maxrate 1M -minrate 40k -auto-alt-ref 1 -arnr-maxframes 7 -arnr-strength 5 -arnr-type centered -threads 8 -vf scale=-1:360 -pass 2 -codec:a libvorbis -b:a 96k -f webm "${OUTPUT_FILE%.*}-360.webm"
echo "Encoded ${OUTPUT_FILE%.*}-360.webm in $(($SECONDS / 60)) minutes and $(($SECONDS % 60)) seconds" >> "${OUTPUT_FILE%.*}.encoding.log"

cd $ORIG_DIR
