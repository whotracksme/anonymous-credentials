output "groupsign_elb" {
  value       = "${aws_elb.groupsign_service.name}"
  description = "The ELB name of the groupsign service"
}

output "groupsign_asg" {
  value       = "${aws_autoscaling_group.groupsign_service.id}"
  description = "The Auto Scaling Group of the groupsign service"
}

output "groupsign_dns" {
  value       = "${aws_route53_record.groupsign_service.name}"
  description = "The DNS name of the groupsign service"
}
