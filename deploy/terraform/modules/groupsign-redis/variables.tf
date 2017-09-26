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

# Redis settings:
variable "port" {
  description = "The port on which Redis will accept connections"
  default     = 6379                                              # leave the standard default port
}

variable "node_type" {
  default     = "cache.t2.micro"
  description = "The type of node used for running Redis. For details, see https://aws.amazon.com/elasticache/details/#Available_Cache_Node_Types."
}

# Redis VPC settings:
variable "vpc_id" {
  description = "The VPC in which the Redis cluster will be started"
}

variable "subnet_ids" {
  type        = "list"
  description = "The subnets in which the Redis nodes will be started"
}
