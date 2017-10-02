terragrunt = {

  remote_state {

    backend = "s3"
    config {
      encrypt = true
      bucket = "cliqz-terraform-state-on-cliqz-test"

      key = "tf-state/hpnv2/dev/${path_relative_to_include()}/terraform.tfstate"
      region = "eu-central-1"

      profile = "cliqz-test"
      lock_table = "terraform-lock"
    }
  }
}
