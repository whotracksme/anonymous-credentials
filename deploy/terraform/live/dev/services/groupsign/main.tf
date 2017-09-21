provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

module "server" {

  # TODO: keep module and live config in different repositories to allow versioning
  source = "../../../../modules/groupsign"
  subnet_id     = "subnet-07c52d7c"
  vpc_id        = "vpc-aacd0ac3"
  ami           = "${var.ami}"

  # certificate for *.test.cliqz.com
  elb_ssl_certificate_id = "arn:aws:acm:eu-central-1:494430270403:certificate/b417e86f-e160-41ee-bbc7-b91ef6a174de"

  cluster_name = "hpnv2-dev"
}
