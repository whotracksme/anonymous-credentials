provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  # (see 'terraform.tfvars')
  backend "s3" {}
}

module "groupsign_redis" {
  # TODO: keep module and live config in different repositories to allow versioning
  # (has also the nice side-effect of avoiding to pollute the main repository
  #  with commits after each deployment)
  source = "../../../../modules/groupsign-redis"

  vpc_id     = "vpc-aacd0ac3"
  subnet_ids = ["subnet-ef529b86", "subnet-05c52d7e", "subnet-290c2c63"]

  cluster_prefix = "hpnv2-dev"
}
