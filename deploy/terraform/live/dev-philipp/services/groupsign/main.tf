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
    # TODO: Can we avoid duplicating this information?
    bucket = "cliqz-terraform-state-on-cliqz-test"
    key    = "tf-state/hpnv2/dev-philipp/data/groupsign-redis/terraform.tfstate"
    region = "eu-central-1"
  }
}

module "server" {
  # TODO: keep module and live config in different repositories to allow versioning
  # (has also the nice side-effect of avoiding to pollute the main repository
  #  with commits after each deployment)
  source = "../../../../modules/groupsign"

  # VPC: "cliqz-default"
  vpc_id = "vpc-aacd0ac3"
  public_subnet_ids = [
    "subnet-ec529b85", # public-eu-central-1a
    "subnet-07c52d7c", # public-eu-central-1b
    "subnet-122e0e58", # public-eu-central-1c
  ]
  ami       = "${var.ami}"

  # Redis settings
  redis_port    = "${data.terraform_remote_state.redis.port}"
  redis_address = "${data.terraform_remote_state.redis.address}"

  # certificate for *.test.cliqz.com
  dns_zone_id            = "ZASDE0L6R1NKM"
  elb_ssl_certificate_id = "arn:aws:acm:eu-central-1:494430270403:certificate/b417e86f-e160-41ee-bbc7-b91ef6a174de"

  cluster_prefix = "hpnv2-dev-philipp"
}
