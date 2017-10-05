#!/bin/bash
#
# Looks for '.log' files in $DATA_EXPORT_READY_FOR_EXPORT_DIR,
# aggregates and compresses them, and uploads them to the S3 bucket
# $DATA_EXPORT_S3_BUCKET.
#

set -e
set -u # fail on undefined variable

readonly incoming=$DATA_EXPORT_READY_FOR_EXPORT_DIR
readonly tmpdir=$DATA_EXPORT_TMP_DIR
readonly s3_bucket=$DATA_EXPORT_S3_BUCKET
readonly s3_key_prefix=$DATA_EXPORT_S3_KEY_PREFIX

/bin/mkdir -p -- "$tmpdir"
/bin/mkdir -p -- "$incoming"

readonly timeout_in_sec=90
readonly lockfile=$tmpdir/groupsign-exporter.exclusivelock

# make sure that the script is only executed once:
# https://stackoverflow.com/a/169969/783510
echo "Waiting for lock..."
(
  /usr/bin/flock -x -w $timeout_in_sec 200 || { echo "ERROR: Locked timed out after $timeout_in_sec seconds. Lockfile: $lockfile. Aborting..." ; exit 1 ; }

  echo "Checking $incoming directory..."
  files="$(find $incoming -name '*.log' -printf "%T@ %p\n" | sort -n | cut -d' ' -f 2-)" # sort by timestamp
  if [[ -z $files ]] ; then
      echo "No incoming files found. Nothing to do."
  else
      echo "Found the following files:"
      echo "$files"
      echo

      # Generate a unique key. The exact name is not relevant, but to protect
      # against name clashes, it uses the IP address and the current date.
      readonly ip="$(/sbin/ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/' | sed 's/[.:]/_/g')"
      readonly timestamp=$(date '+%Y%m%d%H%M%S')
      readonly unique_key="hpnv2-events-${timestamp}-${ip}.log.xz"

      readonly tmp_upload_file="$tmpdir/$unique_key"

      # collect some stats for basic monitoring
      total_events=0
      total_size=0
      while read -r file; do
          total_events=$(( $total_events + $(wc -l < "$file") ))
          total_size=$(( $total_size + $(wc -c < "$file") ))
      done <<< "$files"

      if (( $total_events != 0 )); then

          echo "Preparing upload. Writing file $tmp_upload_file"
          while read -r file; do cat -- "$file" ; done <<< "$files" | xz -9 --memlimit-compress=20% - > "$tmp_upload_file"
          trap "/bin/rm -f \"$tmp_upload_file\"" EXIT
          echo "Preparing upload complete."
          echo
          echo "Statistics:"
          echo "- #events:           $total_events"
          echo "- uncompressed size: $total_size bytes"
          echo "- compressed size:   $(wc -c < "$tmp_upload_file") bytes"

          readonly day=$(date '+%Y%m%d')
          readonly s3_target="s3://$s3_bucket/$s3_key_prefix/$day/$unique_key"
          echo "Starting to upload file to $s3_target..."

          success=false
          readonly max_upload_attempts=3
          for i in $(seq 1 $max_upload_attempts) ; do
              aws s3 cp "$tmp_upload_file" "$s3_target" && success=true && break
          done
          if [[ $success == false ]]; then
              echo "ERROR: Failed to upload file. Giving up after ${max_upload_attempts} attempts."
              exit 2
          fi

          echo "Upload successful, cleaning up processed files..."
      else
          echo "WARNING: No data points found. Skipping upload to S3."
      fi

      while read -r file; do
          /bin/rm -f -- "$file"
      done <<< "$files"
      echo "Cleanup finished."
  fi
) 200>$lockfile
