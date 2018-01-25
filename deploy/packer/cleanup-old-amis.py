#
# Script to automatically clean up old AMIs and
# snapshots that were created by Packer.
#
# To use it, log into the AWS account. The script
# will automatically detec the AMIs based on their tags.
#
# To only simulate the deletion, enable the "dry_run" option.
#

import boto3
import re
import sys
from distutils.util import strtobool

dry_run = False
keep_last = 3
owners = ['alex@cliqz.com', 'philipp@cliqz.com']

def confirm(question):
    # for python 2 (https://stackoverflow.com/a/7321970/783510)
    try: input = raw_input
    except NameError: pass

    while True:
        try:
            answer = strtobool(input(question + ' [yes/no] '))
            if answer == 1:
                return True
            if answer == 0:
                return False
        except KeyboardInterrupt: return False
        except Exception: pass


ec2 = boto3.resource('ec2')

GROUPSIGN_PATTERN = 'groupsign-[0-9]{14}$'

ami_filters = [
    { 'Name': 'tag:Project', 'Values': ['hpnv2'] },
    { 'Name': 'tag:Owner', 'Values': owners }
]

build_ids_to_ami = {}
for ami in ec2.images.filter(Filters=ami_filters).all():
    for tag in ami.tags:
        if tag['Key'] == 'BuildId' and tag['Value'].startswith('groupsign-'):
            build_id = tag['Value']
            build_ids_to_ami[build_id] = ami

filter_for_build_ids = [
    { 'Name': 'tag:Project', 'Values': ['hpnv2'] },
    { 'Name': 'tag:Owner', 'Values': owners },
    { 'Name': 'tag:BuildId', 'Values': [str(id) for id in build_ids_to_ami.keys()] }
]

build_ids_to_snapshot = {}
for snapshot in ec2.snapshots.filter(Filters=filter_for_build_ids).all():
    if snapshot.tags != None:
        for t in snapshot.tags:
            if t['Key'] == 'BuildId' and t['Value'].startswith('groupsign-'):
                build_id = t['Value']
                build_ids_to_snapshot[build_id] = snapshot

# first: oldest, last: newest
ordered_build_ids = sorted(id for id in build_ids_to_snapshot.keys() if re.match(GROUPSIGN_PATTERN, id))
if keep_last > 0:
    build_ids_to_keep = ordered_build_ids[-keep_last:]
    build_ids_to_delete = ordered_build_ids[:-keep_last]
else:
    build_ids_to_keep = []
    build_ids_to_delete = ordered_build_ids

print('The following build ids will be kept (last {} builds):'.format(keep_last))
for id in build_ids_to_keep:
    print('- {}'.format(id))
print('')

if len(build_ids_to_delete) == 0:
    print('Nothing founds that needs to be deleted.')
    sys.exit()

print('The following build ids will be deleted:')
for id in build_ids_to_delete:
    print('- {}'.format(id))
print('')

if not confirm('Are you sure to delete these builds?'):
    sys.exit()

for build_id in build_ids_to_delete:
    snapshot = build_ids_to_snapshot[build_id]
    try:
      if build_id in build_ids_to_ami:
          ami = build_ids_to_ami[build_id]
          print('Deleting build={} (ami={} and snapshot={}) ...'.format(build_id, ami, snapshot.id))

          if not dry_run:
              ami.deregister()
              snapshot.delete()

      else:
          print('Deleting dangling snapshot without AMI. Snapshot: {}, BuildId: {}'
                .format(snapshot.id, build_id))
          if not dry_run:
              snapshot.delete
    except:
        print('Failed to delete snapshot={} with BuildId={}'.format(snapshot.id, build_id))

if dry_run:
    print('')
    print('NOTE: The script run in dry-mode. Nothing has been deleted.')
