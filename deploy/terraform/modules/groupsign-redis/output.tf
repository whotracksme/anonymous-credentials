output "address" {
  value       = "${aws_elasticache_cluster.instance.cache_nodes.0.address}"
  description = "The address of the first Redis node. We are assuming that there is only one node and we are not operating Redis as a cluster."
}

output "port" {
  value       = "${aws_elasticache_cluster.instance.port}"
  description = "The port on which Redis is listening for incoming connections"
}

output "cluster_id" {
  value       = "${aws_elasticache_cluster.instance.cluster_id}"
  description = "The address of the Redis"
}

output "node_type" {
  value       = "${aws_elasticache_cluster.instance.node_type}"
  description = "The port on which Redis is listening for incoming connections"
}
