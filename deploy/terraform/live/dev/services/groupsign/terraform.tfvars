#
# Terragrunt configuration file.
#

terragrunt = {

  remote_state {
    backend = "s3"
    config {
      encrypt = true
      bucket = "cliqz-terraform-state-on-cliqz-test"

      # TODO: should we derive it from the path?
      key = "tf-state/hpnv2/dev/server/terraform.tfstate"
      region = "eu-central-1"
      profile = "cliqz-test"
      lock_table = "terraform-lock"
    }
  }
}
