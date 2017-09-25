#
# Terragrunt configuration file.
#

terragrunt = {

  remote_state {
    backend = "s3"
    config {
      encrypt = true
      bucket = "cliqz-terraform-state-on-cliqz-test"

      # TODO: should we derive it from the path?
      key = "tf-state/hpnv2/dev/groupsign-redis/terraform.tfstate"
      region = "eu-central-1"
      profile = "cliqz-test"
      lock_table = "terraform-lock"
    }
  }
}

# TODO: do we need this?
aws_region = "eu-central-1"
account_id = "494430270403"
profile = "cliqz-test"
vpc_id = "vpc-aacd0ac3"
private_subnets = [
  "subnet-ef529b86", # private-eu-central-1a
  "subnet-05c52d7e", # private-eu-central-1b
  "subnet-290c2c63", # private-eu-central-1c
]
public_subnets = [
  "subnet-ec529b85", # public-eu-central-1a
  "subnet-07c52d7c", # public-eu-central-1b
  "subnet-122e0e58", # public-eu-central-1c
]
