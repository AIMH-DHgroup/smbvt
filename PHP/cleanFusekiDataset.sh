#!/bin/bash

# Count number of files in folder before removal
before_count=`find /var/www/tool.dlnarratives.eu/PHP/prova -type f | wc -l`

# Remove files from protected folder
rm -rf /var/www/tool.dlnarratives.eu/PHP/prova/*

# Count number of files in folder after removal
after_count=`find /var/www/tool.dlnarratives.eu/PHP/prova -type f | wc -l`

# check if all files have been removed
if [ $before_count -eq $after_count ]; then
    echo "Error: Some files not removed"
    exit 1
fi

# Restart Tomcat
systemctl restart tomcat9

# Check if Tomcat is running
while true; do
  if systemctl is-active --quiet tomcat9; then
    break
  fi
  sleep 5
done

# Run JAR file
java -jar /var/www/tool.dlnarratives.eu/cleanFuseki/triplify.jar "moving/;narratives/;Narration2/" > /var/www/tool.dlnarratives.eu/cleanFuseki/outputfile.log 2>&1
