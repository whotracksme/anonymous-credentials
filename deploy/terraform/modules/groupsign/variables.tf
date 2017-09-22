variable "cluster_prefix" {
  description = "The name to use for all the cluster resources. It is used as a prefix to avoid name clashes while deploying different clusters in same AWS region. Example: hpnv2-dev, hpnv2-stage, hpnv2-prod"
}

# Tags applied on all resources (Cliqz convention)
variable "tag_Owner" {
  description = "Used to tag AWS resouces. By convention, use <yourname>@cliqz.com"
  default     = "philipp@cliqz.com"
}

variable "tag_Project" {
  description = "Used to tag AWS resouces."
  default     = "hpnv2"
}

# ELB and Route53 settings:
variable "dns_name" {
  default     = "groupsign.test.cliqz.com"
  description = "The Route53 zone id, which must the domain that we used for the DNS name."
}

variable "use_cluster_prefix_dns_entry" {
  default     = 1
  description = "If this flag is set, the cluster prefix is applied on the dns record to avoid name clashes. On production, where you want to have nice URLs, you should disable it."
}

variable "dns_zone_id" {
  description = "The Route53 zone id, which must the domain that we used for the DNS name."
}

variable "elb_ssl_certificate_id" {
  description = "The certificate used for the ELB (must match the domain used in the Route53 configuration)"
}

# EC2 settings:
variable "instance_type" {
  default     = "t2.nano"
  description = "The EC2 instance type used for the server"
}

variable "min_size" {
  default     = 1
  description = "The minimum size of the auto scaling group"
}

variable "max_size" {
  default     = 1
  description = "The maximum size of the auto scaling group"
}

variable "detailed_monitoring" {
  default = 0
  description = "Detailed monitoring makes sense in production, but basic monitoring, which is free of charge, should be sufficient for non-production deployments."
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
  default     = 3000
  description = "The port of the groupsign server"
}
