variable "cluster_name" {
  description = "The name to use for all the cluster resources. It is used as a prefix to avoid name clashes while deploying different clusters in same AWS region. Example: hpnv2-dev, hpnv2-stage, hpnv2-prod"
}

# Tags applied on all resources (Cliqz convention)
variable "tag_Owner" {
  description = "Used to tag AWS resouces. By convention, use <yourname>@cliqz.com"
  default = "philipp@cliqz.com"
}

variable "tag_Project" {
  description = "Used to tag AWS resouces."
  default = "hpnv2"
}

# EC2 settings:
variable "instance_type" {
  default = "t2.nano",
  description = "The EC2 instance type used for the server"
}

variable "min_size" {
  default = 1
  description = "The minimum size of the auto scaling group"
}

variable "max_size" {
  default = 1
  description = "The maximum size of the auto scaling group"
}

# VPC settings:
variable "subnet_id" {
  description = "The subnet in which the EC2 instances will be started"
}

variable "vpc_id" {
  description = "The VPC in which the EC2 instances will be started"
}

variable "ami" {
  description = "The group sign server AMI (build by packer)"
}

variable "server_port" {
  default = 3000
  description = "The port of the groupsign server"
}
