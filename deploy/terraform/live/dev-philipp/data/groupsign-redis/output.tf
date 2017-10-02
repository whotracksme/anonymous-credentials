output "address" {
  value       = "${module.groupsign_redis.address}"
  description = "The address of the first Redis node. Currently, Redis is not configured to be a cluster."
}

output "port" {
  value       = "${module.groupsign_redis.port}"
  description = "The port on which Redis is listening for incoming connections"
}

output "cluster_id" {
  value       = "${module.groupsign_redis.cluster_id}"
  description = "The Redis cluster id"
}
