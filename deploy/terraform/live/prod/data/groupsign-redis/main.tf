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

  # VPC "cliqz-default" with its private subnets
  vpc_id     = "vpc-c18060a8"
  subnet_ids = ["subnet-987192f1", "subnet-47c4c63f", "subnet-0050734a"]

  cluster_prefix = "hpnv2-prod"
}
