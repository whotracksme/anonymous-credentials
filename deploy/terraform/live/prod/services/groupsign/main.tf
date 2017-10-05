provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  # (see 'terraform.tfvars')
  backend "s3" {}
}

data "terraform_remote_state" "redis" {
  backend = "s3"

  config {
    bucket = "cliqz-ci"
    key    = "tf-state/hpnv2/prod/data/groupsign-redis/terraform.tfstate"
    region = "us-east-1"
  }
}

module "server" {
  # TODO: keep module and live config in different repositories to allow versioning
  # (has also the nice side-effect of avoiding to pollute the main repository
  #  with commits after each deployment)
  source = "../../../../modules/groupsign"

  # "cliqz-default" with its public subnets
  vpc_id = "vpc-c18060a8"

  public_subnet_ids = [
    "subnet-877192ee", # public-eu-central-1a
    "subnet-46c4c63e", # public-eu-central-1b
    "subnet-1f527155", # public-eu-central-1c
  ]

  ami = "${var.ami}"

  # EC2 settings
  detailed_monitoring = 1

  # Redis settings
  redis_port    = "${data.terraform_remote_state.redis.port}"
  redis_address = "${data.terraform_remote_state.redis.address}"

  # Data export of events to S3
  s3_bucket               = "cliqz-deploy-primary"
  iam_role_with_s3_access = "safe-browsing-vpc-0f587bc7634bbb82b01311539a89eb7b"

  # DNS
  dns_name                     = "collector.hpn.cliqz.com"
  use_cluster_prefix_dns_entry = 0
  dns_zone_id                  = "Z2XZKECBCM2IDQ"

  # certificate for *.cliqz.com
  elb_ssl_certificate_id = "arn:aws:iam::141047255820:server-certificate/star_cliqz_sha256"

  cluster_prefix = "hpnv2-prod"
}
