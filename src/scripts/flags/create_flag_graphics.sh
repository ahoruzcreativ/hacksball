#!/bin/sh
wget http://famfamfam.com/lab/icons/flags/famfamfam_flag_icons.zip -O /tmp/flags.zip
unzip /tmp/flags.zip -d /tmp/flags/
rm /tmp/flags.zip
python3 create_graphics.py /tmp/flags/png/ > flags.json
mkdir -p ../../web/img/
mv flags.json ../../web/
mv flags.png ../../web/img/
rm -r /tmp/flags/
