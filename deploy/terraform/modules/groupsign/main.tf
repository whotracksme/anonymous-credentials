terraform {
  required_version = ">= 0.10"
}

resource "aws_launch_configuration" "groupsign_service" {
  name_prefix       = "${var.cluster_prefix}-groupsign-launch-configuration"
  image_id          = "${var.ami}"
  instance_type     = "${var.instance_type}"
  security_groups   = ["${aws_security_group.instance.id}"]
  user_data         = "${data.template_file.user_data.rendered}"
  enable_monitoring = "${var.detailed_monitoring}"

  lifecycle {
    create_before_destroy = true
  }
}

data "template_file" "user_data" {
  template = "${file("${path.module}/user-data.sh")}"

  vars {
    server_port = "${var.server_port}"

    #db_address  = "${data.terraform_remote_state.db.address}"
    #db_port     = "${data.terraform_remote_state.db.port}"
  }
}

resource "aws_autoscaling_group" "groupsign_service" {
  launch_configuration = "${aws_launch_configuration.groupsign_service.id}"

  #availability_zones   = ["${data.aws_availability_zones.all.names}"]
  vpc_zone_identifier = [
    "subnet-ec529b85", # public-eu-central-1a
    "subnet-07c52d7c", # public-eu-central-1b
    "subnet-122e0e58", # public-eu-central-1c
  ]

  load_balancers    = ["${aws_elb.groupsign_service.name}"]
  health_check_type = "ELB"

  min_size = "${var.min_size}"
  max_size = "${var.max_size}"

  tag {
    key                 = "Name"
    value               = "${var.cluster_prefix}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Owner"
    value               = "${var.tag_Owner}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Project"
    value               = "${var.tag_Project}"
    propagate_at_launch = true
  }
}

resource "aws_security_group" "instance" {
  name   = "${var.cluster_prefix}-groupsign-service-instance"
  vpc_id = "${var.vpc_id}"

  lifecycle {
    create_before_destroy = true
  }

  tags {
    Name    = "${var.cluster_prefix}"
    Owner   = "${var.tag_Owner}"
    Project = "${var.tag_Project}"
  }
}

resource "aws_security_group_rule" "allow_groupsign_ssh_inbound" {
  type              = "ingress"
  security_group_id = "${aws_security_group.instance.id}"

  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["10.0.0.0/8"]
}

resource "aws_security_group_rule" "allow_groupsign_http_inbound" {
  type              = "ingress"
  security_group_id = "${aws_security_group.instance.id}"

  from_port   = "${var.server_port}"
  to_port     = "${var.server_port}"
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "allow_groupsign_all_outbound" {
  type              = "egress"
  security_group_id = "${aws_security_group.instance.id}"

  from_port   = 0
  to_port     = 0
  protocol    = "-1"
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_elb" "groupsign_service" {
  name = "${var.cluster_prefix}-groupsign"

  # availability_zones = ["${data.aws_availability_zones.all.names}"]
  security_groups = ["${aws_security_group.elb.id}"]

  # TODO: add variable for public subnets:
  subnets = [
    "subnet-ec529b85", # public-eu-central-1a
    "subnet-07c52d7c", # public-eu-central-1b
    "subnet-122e0e58", # public-eu-central-1c
  ]

  listener {
    lb_port           = 80
    lb_protocol       = "http"
    instance_port     = "${var.server_port}"
    instance_protocol = "http"
  }

  listener {
    lb_port            = 443
    lb_protocol        = "https"
    instance_port      = "${var.server_port}"
    instance_protocol  = "http"
    ssl_certificate_id = "${var.elb_ssl_certificate_id}"
  }

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
    target              = "HTTP:${var.server_port}/config"
  }

  tags {
    Name    = "${var.cluster_prefix}"
    Owner   = "${var.tag_Owner}"
    Project = "${var.tag_Project}"
  }
}

resource "aws_security_group" "elb" {
  name   = "${var.cluster_prefix}-elb"
  vpc_id = "${var.vpc_id}"

  tags {
    Name    = "${var.cluster_prefix}"
    Owner   = "${var.tag_Owner}"
    Project = "${var.tag_Project}"
  }
}

resource "aws_security_group_rule" "allow_http_inbound" {
  type              = "ingress"
  security_group_id = "${aws_security_group.elb.id}"

  from_port   = 80
  to_port     = 80
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "allow_https_inbound" {
  type              = "ingress"
  security_group_id = "${aws_security_group.elb.id}"

  from_port   = 443
  to_port     = 443
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "allow_all_outbound" {
  type              = "egress"
  security_group_id = "${aws_security_group.elb.id}"

  from_port   = 0
  to_port     = 0
  protocol    = "-1"
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_route53_record" "groupsign_service" {
  name    = "${var.use_cluster_prefix_dns_entry ? "${var.cluster_prefix}-${var.dns_name}" : var.dns_name}"
  type    = "A"
  zone_id = "${var.dns_zone_id}"

  alias {
    name                   = "${aws_elb.groupsign_service.dns_name}"
    zone_id                = "${aws_elb.groupsign_service.zone_id}"
    evaluate_target_health = false
  }
}

data "aws_availability_zones" "all" {}

#data "terraform_remote_state" "db" {
#  backend = "s3"
#
#  config {
#    bucket = "${var.db_remote_state_bucket}"
#    key    = "${var.db_remote_state_key}"
#    region = "us-east-1"
#  }
#}

