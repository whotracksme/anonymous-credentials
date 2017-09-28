terraform {
  required_version = ">= 0.10"
}

resource "aws_elasticache_subnet_group" "instance" {
  description = "Subnet group for the groupsign redis cluster. Managed by Terraform."

  name       = "${var.cluster_prefix}-groupsign-redis-cache-subnet"
  subnet_ids = ["${var.subnet_ids}"]
}

resource "aws_security_group" "instance" {
  name_prefix = "${var.cluster_prefix}-groupsign-redis-security-group"
  vpc_id      = "${var.vpc_id}"

  tags {
    Name    = "${var.cluster_prefix}"
    Owner   = "${var.tag_Owner}"
    Project = "${var.tag_Project}"
  }
}

resource "aws_security_group_rule" "allow_redis_connections_inbound" {
  type              = "ingress"
  security_group_id = "${aws_security_group.instance.id}"

  from_port   = "${var.port}"
  to_port     = "${var.port}"
  protocol    = "tcp"
  cidr_blocks = ["10.0.0.0/8"]
}

resource "aws_elasticache_cluster" "instance" {
  # "gsr" == groupsign-redis
  # (cluster_id is limited to 20 characters)
  cluster_id = "${format("%.20s", "${var.cluster_prefix}-gsr")}"

  engine               = "redis"
  node_type            = "${var.node_type}"
  port                 = "${var.port}"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis3.2"
  subnet_group_name    = "${aws_elasticache_subnet_group.instance.name}"
  security_group_ids   = ["${aws_security_group.instance.id}"]

  # even if the change introduces downtime, do not
  # wait for the next maintainance window
  apply_immediately = true

  tags {
    Name    = "${var.cluster_prefix}"
    Owner   = "${var.tag_Owner}"
    Project = "${var.tag_Project}"
  }
}
